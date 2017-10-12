/*
 * Copyright (C) 2017 con terra GmbH (info@conterra.de)
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
        "dojo/_base/lang",
        "dojo/aspect",
        "ct/_Connect",
        "ct/util/css",
        "./PrintPreview",
        "agsprinting/PrintPreviewWidgetController"
    ],
    function (declare, d_lang, d_aspect, _Connect, ct_css, PrintPreview, PrintPreviewWidgetController) {
        return declare([_Connect],
            {
                mapState: null,
                printPreviewRenderer: null,

                constructor: function () {
                    this._latestPrintPreview = null;
                },

                activate: function () {
                    this.connect(PrintPreviewWidgetController.prototype, "showWidget", function (widgetParams) {
                        this.addToMap(widgetParams);
                    });
                    this.connect(PrintPreviewWidgetController.prototype, "changeRotation", function (rotation) {
                        var latestPrintPreview = this._latestPrintPreview;
                        if (latestPrintPreview && latestPrintPreview.printFormat) {
                            latestPrintPreview.printFormat.rotation = rotation;
                            this.addToMap(latestPrintPreview.printFormat, true);
                        }
                    });
                    this.connect(PrintPreviewWidgetController.prototype, "hideWidget", function () {
                        this.remove();
                    });

                    var printController = this.printController;
                    var printDefFunction = "_getPrintDefinition";
                    d_aspect.after(printController._printTask, printDefFunction, d_lang.hitch(this, function (mapPrintDef) {
                        var latestPrintPreview = this.getLatestPrintPreview();
                        if (latestPrintPreview) {
                            mapPrintDef.mapOptions.extent = latestPrintPreview.extent;
                            mapPrintDef.mapOptions.scale = latestPrintPreview.scale;
                            mapPrintDef.mapOptions.rotation = latestPrintPreview.rotation;
                        }
                        return mapPrintDef;
                    }));

                    var that = this;
                    d_aspect.before(printController, "print", function () {
                        that.hideAllBeforePrinting();
                    });
                },

                addToMap: function (widgetParams, onlyRotation) {
                    var renderer = this.printPreviewRenderer;
                    var latestPrintPreview = this._latestPrintPreview;
                    if (latestPrintPreview && !onlyRotation) {
                        widgetParams.rotation = latestPrintPreview.rotation;
                    }
                    if (latestPrintPreview && !latestPrintPreview.get("isPrinted")) {
                        this.remove();
                    }

                    var centerPoint = latestPrintPreview && latestPrintPreview.centerPoint || this.mapState.getExtent().getCenter();
                    var currentScale = Math.round(this.mapState.getViewPort().getScale());
                    var scale = widgetParams.scale;
                    if (scale === -1) {
                        scale = currentScale;
                    }

                    var printPreview = new PrintPreview({
                        centerPoint: centerPoint,
                        scale: scale,
                        printFormat: widgetParams,
                        rotation: widgetParams.rotation
                    });

                    this._latestPrintPreview = printPreview;

                    var renderedGraphics = renderer.showDefaultGraphics(printPreview);
                    var firstGeometry = renderedGraphics[0].geometry;
                    this._checkPolygonAndMapExtent(firstGeometry);
                    printPreview.set("extent", firstGeometry.getExtent());
                    printPreview.set("geometry", firstGeometry);

                    return printPreview;
                },

                getLatestPrintPreview: function () {
                    return this._latestPrintPreview;
                },

                _checkPolygonAndMapExtent: function (polygon) {
                    //var polygonCenter = polygon.getCentroid();
                    //this.mapState.centerAt(polygonCenter);
                    var polygonExtent = polygon.getExtent();
                    /*var mapExtent = this.mapState.getExtent();
                    if (!mapExtent.contains(polygonExtent)) {
                        var unionExtent = mapExtent.union(polygonExtent).expand(1.0);
                        this.mapState.setExtent(unionExtent);
                    }*/
                    this.mapState.setExtent(polygonExtent);
                },

                remove: function () {
                    this._latestPrintPreview = null;
                    this.printPreviewRenderer.remove();
                },

                hideAllBeforePrinting: function () {
                    this.printPreviewRenderer.hide();
                }
            });
    });