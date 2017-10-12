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
define(["esri/geometry/Polygon"],
    function (Polygon) {
        return {
            /**
             * Adapted rotate function from https://developers.arcgis.com/javascript/jsapi/esri.geometry.geometryengine-amd.html
             */
            rotatePolygon: function (polygon, rotation, pivotPoint) {
                //getCentroid seems to be buggy (sometimes a value outside of the actual extent is returned)
                //var d = polygon.getCentroid();

                var ext = polygon.getExtent();
                var d = {};  // Drehpunkt
                d.x = ext.xmax - ( ext.xmax - ext.xmin ) / 2;
                d.y = ext.ymax - ( ext.ymax - ext.ymin ) / 2;

                if (pivotPoint) {
                    d = pivotPoint;
                }

                var rotatedPolygon = new Polygon(polygon.spatialReference);
                rotation = rotation * Math.PI / 180 * (-1);
                var f = Math.cos(rotation);
                rotation = Math.sin(rotation);
                if (void 0 !== polygon.rings) {
                    for (var h = 0; h < polygon.rings.length; h++) {
                        for (var k = polygon.rings[h], l = [], n = 0; n < k.length; n++) {
                            var p = k[n].slice(0);
                            l.push(p);
                            var t = f * (k[n][0] - d.x) - rotation * (k[n][1] - d.y) + d.x;
                            var q = rotation * (k[n][0] - d.x) + f * (k[n][1] - d.y) + d.y;
                            p[0] = t;
                            p[1] = q;
                        }
                        rotatedPolygon.addRing(l);
                    }
                }
                return rotatedPolygon;
            },

            computeAngle: function (pointA, pointB) {
                return Math.atan2(pointB[1] - pointA[1], pointB[0] - pointA[0]) * 180 / Math.PI;
            }
        }
    });