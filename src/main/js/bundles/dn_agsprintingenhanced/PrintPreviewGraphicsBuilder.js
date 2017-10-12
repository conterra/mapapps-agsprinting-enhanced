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
        "esri/geometry/Polygon",
        "./PrintFormatUnitConverter",
        "./PolygonRotator",
        "esri/symbols/PictureMarkerSymbol",
        "esri/graphic",
        "esri/symbols/jsonUtils"
    ],
    function (declare, d_lang, Polygon, PrintFormatUnitConverter, PolygonRotator, PictureMarkerSymbol, Graphic, esriJsonUtils) {
        return declare([],
            {
                printFormat: null,
                centerPoint: null,
                scale: null,
                spatialReference: null,
                rotation: 0,

                mainFrameSymbol: {
                    "type": "esriSFS",
                    "style": "esriSFSSolid",
                    "color": [
                        255,
                        0,
                        0,
                        100
                    ],
                    "outline": {
                        "type": "esriSLS",
                        "style": "esriSLSSolid",
                        "color": [
                            255,
                            0,
                            0,
                            255
                        ],
                        "width": 1
                    }
                },
                printHeadSymbol: {
                    "type": "esriSFS",
                    "style": "esriSFSSolid",
                    "color": [
                        255,
                        0,
                        0,
                        0
                    ],
                    "outline": {
                        "type": "esriSLS",
                        "style": "esriSLSSolid",
                        "color": [
                            255,
                            0,
                            0,
                            255
                        ],
                        "width": 1
                    }
                },
                inactiveStateSymbol: {
                    "type": "esriSFS",
                    "style": "esriSFSSolid",
                    "color": [
                        100,
                        0,
                        0,
                        100
                    ],
                    "outline": {
                        "type": "esriSLS",
                        "style": "esriSLSSolid",
                        "color": [
                            100,
                            0,
                            0,
                            255
                        ],
                        "width": 1
                    }
                },
                printHeadInactiveSymbol: {
                    "type": "esriSFS",
                    "style": "esriSFSSolid",
                    "color": [
                        255,
                        0,
                        0,
                        0
                    ],
                    "outline": {
                        "type": "esriSLS",
                        "style": "esriSLSSolid",
                        "color": [
                            100,
                            0,
                            0,
                            255
                        ],
                        "width": 1
                    }
                },
                arrowPictureUrl: "images/arrow.png",

                constructor: function (printPreview, params) {
                    this.printFormat = printPreview.printFormat;
                    this.centerPoint = printPreview.centerPoint;
                    this.scale = printPreview.scale;
                    this.spatialReference = this.centerPoint.spatialReference;
                    this.rotation = printPreview.rotation;

                    d_lang.mixin(this, params);
                },

                buildDefaultGraphics: function () {
                    return [
                        this._getMainFrameGraphic(),
                        this._getUprightDirectionIndicatorGraphic()
                    ];
                },

                buildInactiveStateGraphics: function () {
                    return [
                        this._getInactiveStateGraphics(),
                        this._getUprightDirectionIndicatorGraphic()
                    ];
                },

                _getMainFrameGraphic: function () {
                    var mainFrameGeom = this._getMainFrameGeometry();
                    var g = new Graphic(mainFrameGeom, this._getMainFrameSymbol());
                    g.editable = true;
                    return g;
                },

                _getInactiveStateGraphics: function () {
                    var mainFrameGeom = this._getMainFrameGeometry();
                    return new Graphic(mainFrameGeom, this._getInactiveStateSymbol());
                },

                _getMainFrameSymbol: function () {
                    return esriJsonUtils.fromJson(this.mainFrameSymbol);
                },

                _getInactiveStateSymbol: function () {
                    return esriJsonUtils.fromJson(this.inactiveStateSymbol);
                },

                _getMainFrameGeometry: function () {
                    var printFormatInMapUnits = PrintFormatUnitConverter.convertPrintFormatToMapUnits(this.printFormat, this.scale);
                    var centerPoint = this.centerPoint;

                    //Create a polygon from the click events coordinates and the template width/height
                    var x = centerPoint.x;
                    var y = centerPoint.y;
                    var halfWidth = printFormatInMapUnits.width / 2;
                    var halfHeight = printFormatInMapUnits.height / 2;

                    var geom = [
                        [x - halfWidth, y - halfHeight],
                        [x + halfWidth, y - halfHeight],
                        [x + halfWidth, y + halfHeight],
                        [x - halfWidth, y + halfHeight],
                        [x - halfWidth, y - halfHeight]
                    ];

                    var polygon = new Polygon(geom);
                    polygon.setSpatialReference(this.spatialReference);

                    return PolygonRotator.rotatePolygon(polygon, this.rotation, centerPoint);
                },

                _getUprightDirectionIndicatorGraphic: function () {
                    var pictureMarkerSymbol = new PictureMarkerSymbol();
                    pictureMarkerSymbol.setHeight(100);
                    pictureMarkerSymbol.setWidth(100);
                    pictureMarkerSymbol.setUrl(this.arrowPictureUrl);
                    pictureMarkerSymbol.setAngle(this.rotation);

                    return new Graphic(this.centerPoint, pictureMarkerSymbol);
                }
            });

    });