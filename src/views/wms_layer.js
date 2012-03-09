define([
	"jquery",
	"use!backbone",
	"use!underscore",
	"use!openlayers",
		],
function($, Backbone, _, ol){

	var WMSLayerView = Backbone.View.extend({

		initialize: function(){
			this.setup();

			this.model.on('change:params', this.updateParams, this);
		},

		setup: function(){

			this.layer = new OpenLayers.Layer.WMS(
				this.model.get('name'),
				this.model.get('service_url'),
				this.model.get('params'),
				{
					singleTile: true
				}
			);
		},

		// Update layer parameters.
		updateParams: function(){
			this.layer.mergeNewParams(this.model.get('params'));	
	    }
				
	});

	return WMSLayerView;
});
		
