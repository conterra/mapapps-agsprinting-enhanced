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
    "ct/array",
    "ct/_Connect",
    "agsprinting/PrintPreviewWidgetController"
], function (declare,
             ct_array,
             _Connect,
             PrintPreviewWidgetController) {
    return declare([_Connect], {
        activate: function () {
            this.inherited(arguments);
            var printPreviewWidgetController = PrintPreviewWidgetController;
            printPreviewWidgetController.prototype.activate = this.newActivate;
            printPreviewWidgetController.prototype.showWidget = this.showWidget;
            printPreviewWidgetController.prototype.hideWidget = this.hideWidget;
            printPreviewWidgetController.prototype._getPrintSize = this._getPrintSize;
            printPreviewWidgetController.prototype.drawTemplateDimensions = this.drawTemplateDimensions;
        },
        newActivate: function (componentContext) {
            this.inherited(arguments);
            this._bundleContext = componentContext.getBundleContext();

            this.connect(this._printDialog.Layout_Template, "onChange", this.drawTemplateDimensions);
            this.connect(this._printDialog.scaleNode, "onChange", this.drawTemplateDimensions);
            this.connect(this._printDialog.rotationSpinner, "onChange", this.changeRotation);
            this.connect(this._printDialog.templateCheckbox, "onChange", this.drawTemplateDimensions);
            this.connect(this._printDialog.scaleSelect, "onChange", this.drawTemplateDimensions);
            this.connect(this._printDialog, "populateGUI", this.drawTemplateDimensions);
            this.connect(this._agsPrintTool, "onActivate", this.drawTemplateDimensions);
            this.connect(this._agsPrintTool, "onDeactivate", this.hideWidget);
        },
        showWidget: function () {
        },
        hideWidget: function () {
        },
        changeRotation: function () {
        },
        _getPrintSize: function (template, templateInfos) {
            var printSize = {};

            var defaultUnit = this._printController._properties.defaultUnit;
            var unitTemplatesMapping = this._printController._properties.unitTemplatesMapping;
            var printWidth = templateInfos.activeDataFrameSize[0];
            var printHeight = templateInfos.activeDataFrameSize[1];
            var mapSize = this._mapState.getSize();
            var mapWidth = mapSize.width;
            var mapHeight = mapSize.height;
            if (this._printDialog.scaleNode.checked) {
                var factor = this._getFactor(defaultUnit);
                for (var unit in unitTemplatesMapping) {
                    var search = ct_array.arrayFirstIndexOf(unitTemplatesMapping[unit], template);
                    if (search !== -1)
                        factor = this._getFactor(unit);
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
        drawTemplateDimensions: function () {
            var printDialog = this._printDialog;
            if (!this._printController._templateInfos) {
                return;
            }
            var template = printDialog.Layout_Template.get("value");
            if (template.indexOf("MAP_ONLY") !== -1) {
                this.hideWidget();
                return;
            }

            var scale = printDialog.scaleSelect.get("value");
            var templateInfos = ct_array.arraySearchFirst(this._printController._templateInfos, {
                layoutTemplate: template
            });
            var printSize = this._getPrintSize(template, templateInfos);
            var width = printSize.width;
            var height = printSize.height;

            var widgetParams = {
                width: width,
                height: height,
                rotation: 0,
                scale: scale
            };

            this.showWidget(widgetParams);
        }
    });
});