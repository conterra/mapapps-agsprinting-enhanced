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
        "dojo/_base/array",
        "ct/array",
        "dojo/on",
        "ct/mapping/edit/GraphicsRenderer"
    ],
    function (declare, d_array, ct_array, on, GraphicsRenderer) {
        return declare([],
            {
                _graphicsRenderer: null,
                mapModel: null,
                printPreviewGraphicsBuilderFactory: null,

                constructor: function () {
                    this.printPreview = null;
                    this.renderedGraphics = [];
                },

                activate: function () {
                    this._graphicsRenderer = GraphicsRenderer.createForGraphicsNode("printPreview", this.mapModel);
                    this.mapModel.fireModelStructureChanged({
                        source: this
                    });
                },

                showDefaultGraphics: function (printPreview) {
                    var graphics = this._getGraphicsBuilder(printPreview).buildDefaultGraphics(this._properties.enableUprightDirectionIndicatorGraphic);
                    return this._showGraphics(printPreview, graphics);
                },

                showEditingGraphics: function () {
                    var graphicsRenderer = this._graphicsRenderer;

                    if (!this.printPreview) {
                        return;
                    }

                    // Only keep the first graphic
                    for (var i = 1; i < this.renderedGraphics.length; i++) {
                        graphicsRenderer.erase(this.renderedGraphics[i]);
                    }
                },

                showInactiveGraphics: function (printPreview) {
                    var graphics = this._getGraphicsBuilder(printPreview).buildInactiveStateGraphics(this._properties.enableUprightDirectionIndicatorGraphic);
                    return this._showGraphics(printPreview, graphics);
                },

                remove: function () {
                    this._removeGraphics();
                    this.printPreview = null;
                    this.renderedGraphics = [];
                },

                hide: function () {
                    this._removeGraphics(this.printPreview);
                },

                _showGraphics: function (printPreview, graphics) {
                    this._removeGraphics(printPreview);
                    this.printPreview = printPreview;
                    return this.renderedGraphics = this._renderGraphics(graphics);
                },

                _removeGraphics: function () {
                    var graphicsRenderer = this._graphicsRenderer;

                    if (!this.printPreview) {
                        return;
                    }
                    d_array.forEach(this.renderedGraphics, function (graphic) {
                        graphicsRenderer.erase(graphic);
                    });
                    this.renderedGraphics = [];
                },

                _renderGraphics: function (graphics) {
                    var graphicsRenderer = this._graphicsRenderer;

                    return d_array.map(graphics, function (graphic) {
                        return graphicsRenderer.draw(graphic);
                    });
                },

                _getGraphicsBuilder: function (printPreview) {
                    return this.printPreviewGraphicsBuilderFactory.createInstance(printPreview);
                }
            });
    });