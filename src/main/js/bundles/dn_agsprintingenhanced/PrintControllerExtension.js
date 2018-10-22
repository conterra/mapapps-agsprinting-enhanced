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
        "dojo/_base/lang",
        "esri/tasks/PrintTask"
    ],
    function (declare, d_lang, PrintTask) {
        return declare([],
            {
                constructor: function () {
                    this._latestPrintPreview = null;
                },

                activate: function () {
                    var that = this;
                    var getPrintDefinition = PrintTask.prototype._getPrintDefinition;
                    PrintTask.prototype._getPrintDefinition = function () {
                        var mapPrintDef = getPrintDefinition.apply(this, arguments);
                        var latestPrintPreview = that.mapConnector.getLatestPrintPreview();
                        if (latestPrintPreview) {
                            mapPrintDef.mapOptions.extent = latestPrintPreview.extent;
                            mapPrintDef.mapOptions.scale = latestPrintPreview.scale;
                            mapPrintDef.mapOptions.rotation = latestPrintPreview.rotation;
                        }
                        return mapPrintDef;
                    };
                },

                setMapConnector: function (mapConnector) {
                    this.mapConnector = mapConnector
                }
            });
    });