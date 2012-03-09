define([
	"use!backbone",
], 
function(Backbone){

var LayerModel = Backbone.Model.extend({

	defaults: {
		name: '',
		type: ''
	},

	initialize: function(){
	}
	

});

return LayerModel;

});

