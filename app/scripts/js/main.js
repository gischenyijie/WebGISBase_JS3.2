//import EsriConfig = require("esri/config");
//import UrlUtils = require("esri/core/urlUtils");
define(["require", "exports", "dojo/_base/lang", "dojo/on", "esri/arcgis/utils", "esri/tasks/query", "esri/dijit/Search", "esri/symbols/SimpleFillSymbol", 
"esri/symbols/SimpleLineSymbol", "esri/symbols/SimpleMarkerSymbol", "esri/Color", "esri/graphic", "esri/geometry/Multipoint", "agsjs/dijit/TOC", 
"esri/dijit/BasemapToggle", "esri/dijit/HomeButton"], 
function (require, exports, lang, on, arcgisUtils, esriQuery, Search, simpleFillSym, simpleLineSym, 
    simpleMarkerSym, color, Graphic, MultiPoint, TOC, BasemapToggle, HomeButton) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var map;
    var search;
    var stateLayer;

    arcgisUtils.createMap("1ce7490c68de4871a89ff6a4c5f638d8", "mapView").then(function (response) {
        console.log("map loaded");
        map = response.map;
        initLayers();
        initTOC();
        initBaseMapToggle(); 
        initHomeButton();
        attachEventHandlers();
        initSearch(map);
    }, function (err) {
        console.log("Error loading map " + err.message);
    });

    function initTOC() {
        var toc = new TOC({
            map: map,
            layerInfos: [{
                    layer: stateLayer,
                    title: 'State Layer',
                    slider: true
                }]
        }, 'tocDiv');
        toc.startup();
    };

    function initBaseMapToggle() {
        /* Start code fix until supported by widget */
        var bmLayers = [], mapLayers = map.getLayersVisibleAtScale(map.getScale());
        if (mapLayers) {
            for (var i = 0; i < mapLayers.length; i++) {
                if (mapLayers[i]._basemapGalleryLayerType) {
                    var bmLayer = map.getLayer(mapLayers[i].id);
                    if (bmLayer) {
                        bmLayers.push(bmLayer);
                    }
                }
            }
        }
        on.once(map, 'basemap-change', lang.hitch(this, function () {
            if (bmLayers && bmLayers.length) {
                for (var i = 0; i < bmLayers.length; i++) {
                    bmLayers[i].setVisibility(false);
                }
            }
        }));
        var toggle = new BasemapToggle({
            map: map,
            basemap: "gray"
        }, "BasemapToggle");
        toggle.startup();
    };

    function initHomeButton() {
        var home = new HomeButton({
            map: map
        }, "HomeButton");
        home.startup();
    };

    function initLayers() {
        stateLayer = getLayerByKeyword('state');
        var node = stateLayer.getNode();
        node.style = "cursor: pointer;";
    };

    function initSearch(map) {
        search = new Search({
            enableButtonMode: true,
            enableLabel: false,
            enableInforWindow: false,
            enableHighlight: false,
            showInfoWindowOnSelect: false,
            map: map,
            sources: [],
            zoomScale: 25000
        }, 'searchNode');
        var sources = search.get('sources');
        var stateSearch = {
            featureLayer: stateLayer,
            name: 'State',
            searchFields: ['STATE_NAME'],
            suggestionTemplate: "${STATE_NAME}",
            exactMatch: false,
            placeholder: 'Search By State Name',
            enableSuggestions: true
        };
        sources.push(stateSearch);
        search.set('sources', sources);
        search.startup();
    };

    function attachEventHandlers() {
        on(clearBtn, 'click', clear.bind(this));
    };

    function getLayerByKeyword(key) {
        var layer;
        map.graphicsLayerIds.forEach(function (lyrId) {
            if (lyrId.toLowerCase().indexOf(key) >= 0)
                layer = map.getLayer(lyrId);
        });
        return layer;
    };

    function clear() {
        map.graphics.clear();
    };
    function updateExtent() {
        if (Object.keys(selectedBranches).length <= 0)
            return;
        var extent;
        Object.values(selectedBranches).forEach(function (item) {
            if (!item.eta)
                return;
            if (!extent) {
                extent = item.eta.geometry.getExtent();
            }
            else {
                extent = extent.union(item.eta.geometry.getExtent());
            }
        });
        if (extent) {
            map.setExtent(extent.expand(1.5));
        }
    };
});
