define([
	"jquery",
	"use!backbone",
	"use!underscore",
	"use!openlayers",
	"./layer",
		],
function($, Backbone, _, ol, LayerView){

	var WMSLayerView = LayerView.extend({

		setup: function(){
			this.layer = new OpenLayers.Layer.WMS(
				this.model.get('name'),
				this.model.get('service_url'),
				this.model.get('params'),
				this.model.get('options')
			);
		},

	});

	return WMSLayerView;
});
		
