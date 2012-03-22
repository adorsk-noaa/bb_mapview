define([
	"use!backbone",
], 
function(Backbone){

var LayerModel = Backbone.Model.extend({

	defaults: {
		type: '',
		name: '',
	},

	initialize: function(){
	}
	

});

return LayerModel;

});

