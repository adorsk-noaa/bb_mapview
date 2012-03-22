define([
	"use!backbone",
], 
function(Backbone){

var MapViewModel = Backbone.Model.extend({

	defaults: {
		layers: {},
		options: {}
	},

	initialize: function(){
	}

});

return MapViewModel;

});

