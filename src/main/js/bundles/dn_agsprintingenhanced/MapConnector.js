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
        "ct/_lang",
        "ct/util/css",
        "ct/mapping/geometry",
        "./PrintPreview",
        "esri/config",
        "esri/units",
        "esri/geometry/Polyline",
        "esri/geometry/webMercatorUtils",
        "esri/geometry/geodesicUtils",
        "agsprinting/PrintPreviewWidgetController"
    ],
    function (declare, d_lang, d_aspect, _Connect, ct_lang, ct_css, geometry, PrintPreview, esri_config, esri_units, Polyline, webMercatorUtils, geodesicUtils, PrintPreviewWidgetController) {
        return declare([_Connect],
            {
                mapState: null,
                printPreviewRenderer: null,

                constructor: function () {
                    this._latestPrintPreview = null;
                },

                activate: function () {
                    this.connect(PrintPreviewWidgetController.prototype, "showWidget", function (widgetParams, noZoom) {
                        this.addToMap(widgetParams, false, noZoom);
                    });
                    this.connect(PrintPreviewWidgetController.prototype, "changeRotation", function (rotation) {
                        var latestPrintPreview = this._latestPrintPreview;
                        if (latestPrintPreview && latestPrintPreview.printFormat) {
                            latestPrintPreview.printFormat.rotation = rotation;
                            this.addToMap(latestPrintPreview.printFormat, true, false);
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

                addToMap: function (widgetParams, onlyRotation, noZoom) {
                    var renderer = this.printPreviewRenderer;
                    var latestPrintPreview = this._latestPrintPreview;
                    if (latestPrintPreview && !onlyRotation) {
                        // use last rotation
                        widgetParams.rotation = latestPrintPreview.rotation;
                    }
                    if (latestPrintPreview && !latestPrintPreview.get("isPrinted")) {
                        this.remove();
                    }

                    var centerPoint = latestPrintPreview && latestPrintPreview.centerPoint || this.mapState.getExtent().getCenter();
                    var scale = widgetParams.scale;
                    if (scale === -1) {
                        scale = Math.round(this._getScale());
                    }

                    var printPreview = new PrintPreview({
                        centerPoint: centerPoint,
                        scale: scale,
                        printFormat: widgetParams,
                        rotation: widgetParams.rotation
                    });

                    this._latestPrintPreview = printPreview;

                    var renderedGraphics = renderer.showDefaultGraphics(printPreview);
                    renderer._graphicsRenderer.graphicsNode.refresh();
                    var polygon = renderedGraphics[0].geometry;
                    if (!noZoom) {
                        // change map extent
                        this._checkPolygonAndMapExtent(polygon);
                    }
                    printPreview.set("extent", polygon.getExtent());
                    printPreview.set("geometry", polygon);

                    return printPreview;
                },

                getLatestPrintPreview: function () {
                    return this._latestPrintPreview;
                },

                _checkPolygonAndMapExtent: function (polygon) {
                    if (polygon) {
                        var extent = polygon.getExtent();
                        this.mapState.setExtent(extent);
                    }
                },

                _getScale: function () {
                    var properties = this._properties || {};
                    var fixScale = ct_lang.chkProp(properties, "fixScale", true);
                    var viewport = this.mapState.getViewPort();
                    var screen = viewport.getScreen();
                    var geo = viewport.getGeo();
                    var spatialReference = geo.spatialReference;
                    var isWebMercator = geometry.isWebMercator(spatialReference);
                    if (!isWebMercator || !fixScale) {
                        return viewport.getScale();
                    }
                    var centimeters = esri_units.CENTIMETERS;
                    var screenDPI = esri_config.defaults.screenDPI;
                    var line = new Polyline(spatialReference);
                    var lowerLeft = geometry.createPoint(geo.xmin, geo.ymin, spatialReference);
                    var lowerRight = geometry.createPoint(geo.xmax, geo.ymin, spatialReference);
                    line.addPath([lowerLeft, lowerRight]);
                    line = webMercatorUtils.webMercatorToGeographic(line);
                    var length = geodesicUtils.geodesicLengths([line], centimeters)[0];
                    return (length / screen.getWidth()) * (screenDPI / 2.54);
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