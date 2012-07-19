define([
	"jquery",
	"use!backbone",
	"use!underscore",
	"use!openlayers",
	"./layer",
		],
function($, Backbone, _, ol, LayerView){

	var WMTSLayerView = LayerView.extend({

		initialize: function(){

			LayerView.prototype.initialize.apply(this, arguments);
            this.postInitialize();

		},

        // @TODO! REPLACE THIS WITH ACTUAL PARMS.
        createLayer: function(){
            var GIBS_WMTS_GEO_ENDPOINT = "http://map1.vis.earthdata.nasa.gov/wmts-geo/wmts.cgi";
            return new OpenLayers.Layer.WMTS({
                name: "Terra / MODIS Corrected Reflectance (True Color), 2012-06-08",
                url: GIBS_WMTS_GEO_ENDPOINT,
                layer: "MODIS_Terra_CorrectedReflectance_TrueColor",
                matrixSet: "EPSG4326_2km",
                format: "image/jpeg",
                style: "",
                transitionEffect: "resize",
                projection: "EPSG:4326",
                numZoomLevels: 9,
                maxResolution: 0.5625,
                'tileSize': new OpenLayers.Size(512, 512),
                isBaseLayer: true
            });
        },
        
        postInitialize: function(){
			LayerView.prototype.postInitialize.apply(this, arguments);
        },


	});

	return WMTSLayerView;
});
		
