define([
	"jquery",
	"use!backbone",
	"use!underscore",
	"use!openlayers",
		],
function($, Backbone, _, ol){

	var LayerView = Backbone.View.extend({

		initialize: function(){
			this.model.on('change:params', this.updateParams, this);
		},

		// Update layer parameters.
		updateParams: function(){
			this.layer.mergeNewParams(this.model.get('params'));	
	    },

		deactivate: function(){
			this.layer.setVisibility(false);
		},

		activate: function(){
			this.layer.setVisibility(! this.model.get('disabled'));
		},
				
	});

	return LayerView;
});
		
