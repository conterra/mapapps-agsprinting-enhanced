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
    "ct/array",
    "ct/_when",
    "ct/_Connect",
    "agsprinting/PrintPreviewWidgetController"
], function (declare, ct_array, ct_when, _Connect, PrintPreviewWidgetController) {
    return declare([_Connect], {
        activate: function () {
            this.inherited(arguments);
            var printPreviewWidgetController = PrintPreviewWidgetController;
            printPreviewWidgetController.prototype.activate = this.newActivate;
            printPreviewWidgetController.prototype.showWidget = this.showWidget;
            printPreviewWidgetController.prototype.hideWidget = this.hideWidget;
            printPreviewWidgetController.prototype.drawTemplateDimensions = this.drawTemplateDimensions;
            printPreviewWidgetController.prototype._getTemplateInfos = this._getTemplateInfos;
            printPreviewWidgetController.prototype._getPrintSize = this._getPrintSize;
            printPreviewWidgetController.prototype._connectToMethods = this._connectToMethods;
            printPreviewWidgetController.prototype._connectToZoom = this._connectToZoom;
            printPreviewWidgetController.prototype._disconnectFromZoom = this._disconnectFromZoom;
        },

        newActivate: function (componentContext) {
            var that = this;
            this.inherited(arguments);
            this._bundleContext = componentContext.getBundleContext();
            that._connectToMethods();

            this.connect(that._agsPrintTool, "onActivate", function () {
                if (that._printDialog.scaleSelect.value === -1) {
                    that.drawTemplateDimensions(true);
                } else {
                    that.drawTemplateDimensions(false);
                }
                that._connectToMethods();
            });
            this.connect(that._agsPrintTool, "onDeactivate", function () {
                that.hideWidget();
                that.con.disconnect();
                that.con = null;
                that._disconnectFromZoom();
            });
        },

        _connectToMethods: function () {
            var that = this;
            if (this.con) {
                return;
            }
            this.con = new _Connect();
            if (that._printDialog.scaleSelect.value === -1) {
                that._connectToZoom();
            }

            that.con.connect(that._printDialog.Layout_Template, "onChange", function () {
                that.drawTemplateDimensions(false);
            });
            that.con.connect(that._printDialog.scaleNode, "onChange", function () {
                that.drawTemplateDimensions(false);
            });
            that.con.connect(that._printDialog.rotationSpinner, "onChange", function (rotation) {
                that.changeRotation(rotation);
            });
            that.con.connect(that._printDialog.templateCheckbox, "onChange", function () {
                that.drawTemplateDimensions(false);
            });
            that.con.connect(that._printDialog.scaleSelect, "onChange", function (value) {
                if (value === -1) {
                    that._disconnectFromZoom();
                    that._connectToZoom();
                    that.drawTemplateDimensions(true);
                } else {
                    that._disconnectFromZoom();
                    that.drawTemplateDimensions(false);
                }
            });
            that.con.connect(that._printDialog, "populateGUI", function () {
                if (that._printDialog.scaleSelect.value === -1) {
                    that.drawTemplateDimensions(true);
                } else {
                    that.drawTemplateDimensions(false);
                }
            });
        },

        showWidget: function () {
        },

        hideWidget: function () {
        },

        changeRotation: function (rotation) {
        },

        _getPrintSize: function (template, templateInfos) {
            var printSize = {};

            var defaultUnit = this._printController._properties.defaultUnit;
            var unitTemplatesMapping = this._printController._properties.unitTemplatesMapping;
            var frameSize = templateInfos.activeDataFrameSize || templateInfos.webMapFrameSize;
            var printWidth = frameSize[0];
            var printHeight = frameSize[1];
            var mapSize = this._mapState.getSize();
            var mapWidth = mapSize.width;
            var mapHeight = mapSize.height;
            if (this._printDialog.scaleNode.checked) {
                var factor = this._getFactor(defaultUnit);
                for (var unit in unitTemplatesMapping) {
                    var search = ct_array.arrayFirstIndexOf(unitTemplatesMapping[unit], template);
                    if (search !== -1) {
                        factor = this._getFactor(unit);
                    }
                }
                printSize.width = (printWidth / factor);
                printSize.height = (printHeight / factor);
            } else {
                var printRatio = printWidth / printHeight;
                var mapRatio = mapWidth / mapHeight;
                if (mapRatio <= 1) {
                    printSize.height = mapHeight;
                    printSize.width = mapHeight * printRatio;
                } else {
                    printSize.width = mapWidth;
                    printSize.height = mapWidth / printRatio;
                }
            }

            return printSize;
        },

        drawTemplateDimensions: function (noZoom) {
            var printDialog = this._printDialog;
            if (!this._getTemplateInfos()) {
                return;
            }
            var template = printDialog.Layout_Template.get("value");
            if (template.indexOf("MAP_ONLY") !== -1) {
                this.hideWidget();
                return;
            }

            var that = this;
            var scale = printDialog.scaleSelect.get("value");
            ct_when(that._getTemplateInfos(), function (infos) {
                var templateInfos = ct_array.arraySearchFirst(infos, {
                    layoutTemplate: template
                });
                if (!templateInfos) {
                    return;
                }
                var printSize = that._getPrintSize(template, templateInfos);
                var width = printSize.width;
                var height = printSize.height;

                var widgetParams = {
                    width: width,
                    height: height,
                    rotation: 0,
                    scale: scale
                };

                that.showWidget(widgetParams, noZoom);
            });
        },

        _getTemplateInfos: function () {
            if (this._printController.getTemplateInfos) {
                return this._printController.getTemplateInfos();
            } else {
                return this._printController.getPrintInfos().templateInfos;
            }
        },

        _connectToZoom: function () {
            if (this.zoomCon) {
                return;
            }
            this.zoomCon = new _Connect();
            var that = this;
            this.zoomCon.connect(this._mapState, "onZoomEnd", function (scale) {
                setTimeout(function () {
                    that.drawTemplateDimensions(true);
                }, 100);
            });
        },

        _disconnectFromZoom: function () {
            if (this.zoomCon) {
                this.zoomCon.disconnect();
                this.zoomCon = null;
            }
        }
    });
});