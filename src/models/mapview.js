define([
	"backbone",
], 
function(Backbone){

var MapViewModel = Backbone.Model.extend({

	defaults: {
		layers: {},
		options: {},
		graticule_intervals: [60, 1]
	},

	initialize: function(){
	}

});

return MapViewModel;

});

