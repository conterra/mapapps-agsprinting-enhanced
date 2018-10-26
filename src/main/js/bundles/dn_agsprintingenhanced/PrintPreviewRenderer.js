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
                    this._graphicsRenderer.get("graphicsNode").set("renderPriority", 100);
                    this._graphicsRenderer2 = GraphicsRenderer.createForGraphicsNode("printPreview2", this.mapModel);
                    this._graphicsRenderer2.get("graphicsNode").set("renderPriority", 10);
                    this.mapModel.fireModelStructureChanged({
                        source: this
                    });
                },

                showDefaultGraphics: function (printPreview) {
                    var graphics = this._getGraphicsBuilder(printPreview).buildDefaultGraphics(this._properties.enableUprightDirectionIndicatorGraphic);
                    return this._showGraphics(printPreview, graphics);
                },

                showEditingGraphics: function () {
                    var graphicsRenderer2 = this._graphicsRenderer2;

                    if (!this.printPreview) {
                        return;
                    }
                    graphicsRenderer2.erase(this.renderedGraphics[1]);
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
                    var graphicsRenderer2 = this._graphicsRenderer2;

                    if (!this.printPreview) {
                        return;
                    }
                    graphicsRenderer.erase(this.renderedGraphics[0]);
                    graphicsRenderer2.erase(this.renderedGraphics[1]);
                    this.renderedGraphics = [];
                },

                _renderGraphics: function (graphics) {
                    var graphicsRenderer = this._graphicsRenderer;
                    var graphicsRenderer2 = this._graphicsRenderer2;
                    var graphicResults = [];
                    if (graphics[0]) {
                        graphicResults.push(graphicsRenderer.draw(graphics[0]));
                    } else {
                        graphicResults.push(graphicsRenderer2.draw(graphics[1]));
                    }
                    return graphicResults;
                },

                _getGraphicsBuilder: function (printPreview) {
                    return this.printPreviewGraphicsBuilderFactory.createInstance(printPreview);
                }
            });
    });