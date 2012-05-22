define([
	"jquery",
	"use!backbone",
	"use!underscore",
	"use!ui",
	"_s",
		],
function($, Backbone, _, ui, _s){

	var DataLayerFormView = Backbone.View.extend({

		initialize: function(opts){
			$(this.el).addClass('layer-form data-layer-form');
		}
	});

	return DataLayerFormView;
});
		
