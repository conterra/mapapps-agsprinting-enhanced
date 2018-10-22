/*
 * Copyright (C) 2018 con terra GmbH (info@conterra.de)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
define([
        "dojo/_base/declare",
        "esri/symbols/jsonUtils",
        "./PolygonRotator",
        "ct/_Connect"
    ],
    function (declare, jsonUtils, PolygonRotator, _Connect) {
        return declare([_Connect],
            {
                printPreviewRenderer: null,
                mapState: null,
                esriMap: null,
                editingSymbol: {
                    "type": "esriSFS",
                    "style": "esriSFSSolid",
                    "color": [
                        0,
                        255,
                        0,
                        100
                    ],
                    "outline": {
                        "type": "esriSLS",
                        "style": "esriSLSSolid",
                        "color": [
                            0,
                            255,
                            0,
                            255
                        ],
                        "width": 1
                    }
                },
                editStateController: null,

                activate: function () {
                    this._registerEditingEvents();

                    this.connect(this.printPreviewRenderer, "remove", function () {
                        this.cleanEditedGraphic();
                    });
                },

                _registerEditingEvents: function () {
                    var that = this;
                    this._mapStateEvent = this.mapState.on("Click", function (event) {
                        var editedPrintPreview = that._editedPrintPreview;
                        var graphic = event.graphic;
                        if (!graphic && editedPrintPreview) {
                            that._stopEditing(editedPrintPreview);
                            that._editedPrintPreview = null;
                            return;
                        }
                        if (graphic) {
                            if (graphic.esriGraphic && !graphic.esriGraphic.editable) {
                                if (editedPrintPreview) {
                                    that._stopEditing(editedPrintPreview);
                                    that._editedPrintPreview = null;
                                }
                                return;
                            }

                            var clickedPrintPreview = that.printPreviewRenderer.printPreview;
                            if (!clickedPrintPreview && editedPrintPreview) {
                                that._stopEditing(editedPrintPreview);
                                that._editedPrintPreview = null;
                            }

                            if (!clickedPrintPreview && !editedPrintPreview) {
                                return;
                            }

                            if (clickedPrintPreview && !editedPrintPreview) {
                                that._editedPrintPreview = clickedPrintPreview;
                                that._startEditing(clickedPrintPreview, graphic);
                            }

                            if (clickedPrintPreview && editedPrintPreview && clickedPrintPreview !== editedPrintPreview) {
                                that._stopEditing(editedPrintPreview);
                                that._editedPrintPreview = null;
                            }
                        }
                    });
                },

                _startEditing: function (printPreview, graphic) {
                    var editStateController = this.editStateController;
                    var renderer = this.printPreviewRenderer;

                    editStateController.activateEditing({
                        editModes: [['ROTATE', 'MOVE']]
                    });
                    graphic.setSymbol(jsonUtils.fromJson(this.editingSymbol));

                    editStateController.editGraphic({graphic: graphic});
                    this._editedGraphic = graphic;
                    renderer.showEditingGraphics(printPreview);
                },

                _stopEditing: function (printPreview) {
                    var editedGraphic = this._editedGraphic;
                    if (!editedGraphic) {
                        return;
                    }
                    var geometry = editedGraphic.geometry;
                    var rotation = PolygonRotator.computeAngle(geometry.rings[0][0], geometry.rings[0][1]) * (-1);
                    this.editStateController.deactivateEditing();
                    printPreview.set("rotation", rotation);
                    printPreview.set("centerPoint", geometry.getCentroid());
                    printPreview.set("extent", geometry.getExtent());
                    printPreview.set("geometry", geometry);
                    this.printPreviewRenderer.showDefaultGraphics(printPreview);
                    this._editedGraphic = null;
                },

                cleanEditedGraphic: function () {
                    this._editedGraphic = null;
                    this._editedPrintPreview = null;
                },

                deactivate: function () {
                    this._mapStateEvent.remove();
                    this.disconnect();
                }
            });
    });