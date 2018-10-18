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
    "dojo/_base/array",
    "dojo/aspect",
    "dojo/dom-construct",
    "dojo/store/Memory",
    "dojo/number",
    "ct/_Connect",
    "ct/array",
    "ct/_when",
    "apprt-request",
    "dijit/form/Button",
    "dijit/form/TextBox",
    "dijit/form/Select",
    "ct/util/css"
], function (declare,
             d_lang,
             d_array,
             d_aspect,
             domConstruct,
             Memory,
             d_number,
             _Connect,
             ct_array,
             ct_when,
             apprt_request,
             Button,
             TextBox,
             Select,
             ct_css) {
    return declare([_Connect], {
        activate: function () {
            var printDialog = this._printDialog;
            printDialog._generateSelectOptions = d_lang.hitch(this, this._generateSelectOptions);

            this.addScaleSelect();

            ct_when(this._getBaseMapServiceInfos(), function (serviceInfos) {
                var lods = serviceInfos && serviceInfos.tileInfo && serviceInfos.tileInfo.lods;
                var lodOptions = d_array.map(lods, function (lod) {
                    return {
                        label: "1:" + d_number.format(lod.scale, {places: 0}),
                        value: lod.scale
                    };
                });
                var options = this._properties.printScaleSelectOptions || lodOptions || defaultPrintScaleSelectOptions || [];
                var select = this._printDialog.scaleSelect;
                d_array.forEach(options, function (option) {
                    select.addOption(option);
                })
            }, function (error) {
                var options = this._properties.printScaleSelectOptions || defaultPrintScaleSelectOptions || [];
                var select = this._printDialog.scaleSelect;
                d_array.forEach(options, function (option) {
                    select.addOption(option);
                });
                console.log(error);
            }, this);

            var properties = this._properties;
            // hide unwanted properties
            ct_css.switchVisibility(printDialog["DpiSelection"].domNode.parentNode, !properties.hideDpiSelection);
            ct_css.switchVisibility(printDialog["scaleNode"].domNode.parentNode, !properties.hideScaleCheckbox);
            ct_css.switchVisibility(printDialog["rotationSpinner"].domNode, false);
            ct_css.switchVisibility(printDialog["previewNode"], false);
            printDialog.templateCheckbox.set("disabled", true);

            d_aspect.after(printDialog, "populateGUI", d_lang.hitch(this, function (evt) {
                var template = this._printDialog.Layout_Template.value;
                if (template.indexOf("MAP_ONLY") !== -1) {
                    ct_css.switchVisibility(printDialog["scaleNode"].domNode.parentNode, !properties.hideScaleCheckbox);
                    ct_css.switchVisibility(printDialog["scaleSelect"].domNode.parentNode, false);
                } else {
                    ct_css.switchVisibility(printDialog["scaleNode"].domNode.parentNode, false);
                    ct_css.switchVisibility(printDialog["scaleSelect"].domNode.parentNode, true);
                }
            }));

            this.connect(printDialog.Layout_Template, "onChange", function (template) {
                if (template.indexOf("MAP_ONLY") !== -1) {
                    ct_css.switchVisibility(printDialog["scaleNode"].domNode.parentNode, !properties.hideScaleCheckbox);
                    ct_css.switchVisibility(printDialog["scaleSelect"].domNode.parentNode, false);
                    printDialog.templateCheckbox.set("checked", false);
                } else {
                    ct_css.switchVisibility(printDialog["scaleNode"].domNode.parentNode, false);
                    ct_css.switchVisibility(printDialog["scaleSelect"].domNode.parentNode, true);
                    printDialog["scaleNode"].setValue(true);
                }
            });

            if (properties.addHelpButton) {
                // add button for help widget
                this.addHelpButton();
            }
            if (properties.addAuthorField) {
                // add author field
                this.addAuthorField();
            }

            d_aspect.before(printDialog, "onPrintClicked", d_lang.hitch(this, function (evt) {
                var author = printDialog["Author"];
                evt.template.layoutOptions.authorText = author.value;
            }));
        },
        deactivate: function () {
            this.disconnect();
        },
        addAuthorField: function () {
            var i18n = this._i18n.get();
            var domNode = this._printDialog.Title.domNode.parentNode;
            var node = domConstruct.create("div", {
                innerHTML: "<label>" + i18n.ui.author + "</label>",
                class: "form-row"
            });
            var textbox = this._printDialog.Author = new TextBox({
                name: "authorName",
                value: "",
                //placeHolder: i18n.ui.authorPlaceholder,
                class: "titleInput",
                style: "margin-left: 2px;"
            });

            domConstruct.place(node, domNode, "after");
            domConstruct.place(textbox.domNode, node, "last");
        },
        addScaleSelect: function () {
            var i18n = this._i18n.get();
            var domNode = this._printDialog.previewNode;
            var node = domConstruct.create("div", {
                innerHTML: "<label>" + i18n.ui.printScale + "</label>",
                class: "form-row"
            });
            var select = this._printDialog.scaleSelect = new Select({
                options: [{
                    label: i18n.ui.currentScale,
                    value: -1,
                    selected: true
                }],
                name: "scaleSelect",
                style: "margin-left: 2px;"
            });

            domConstruct.place(node, domNode, "after");
            domConstruct.place(select.domNode, node, "last");
        },
        addHelpButton: function () {
            var i18n = this._i18n.get();
            var domNode = this._printDialog.BtnSubmit.domNode.parentNode;
            var helpTool = this._helpTool;
            new Button({
                label: i18n.ui.helpBtnLabel,
                onClick: function () {
                    helpTool.click();
                }
            }, "help").placeAt(domNode, "first");
        },
        _getBaseMapServiceInfos: function () {
            var baselayers = this._mapModel.getBaseLayer().children;
            var baselayer = ct_array.arraySearchFirst(baselayers, {
                visibleInMap: true
            });
            var baseMapUrl = baselayer && baselayer.service && baselayer.service.serviceUrl;
            if (!baseMapUrl) {
                return null;
            }
            return apprt_request(baseMapUrl, {
                "query": {
                    "f": "json"
                }
            });
        },
        _generateSelectOptions: function (arr, defaultValue) {
            // change template layout names
            var templateLabels = this._properties.templateLabels;

            var optionsArr = [];
            d_array.forEach(arr, function (item) {
                var option = {
                    "label": item,
                    "value": item
                };
                if (templateLabels[item])
                    option.label = templateLabels[item];

                if (item === defaultValue) {
                    option["selected"] = true;
                }

                optionsArr.push(option);
            });
            return optionsArr;
        }
    });
});