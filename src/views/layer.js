define([
	"jquery",
	"use!backbone",
	"use!underscore",
	"use!openlayers",
		],
function($, Backbone, _, ol){

	var LayerView = Backbone.View.extend({

		initialize: function(){
			this.setup();
			this.model.on('change:params', this.updateParams, this);
		},

		setup: function(){
		},

		// Update layer parameters.
		updateParams: function(){
			this.layer.mergeNewParams(this.model.get('params'));	
	    }
				
	});

	return LayerView;
});
		
