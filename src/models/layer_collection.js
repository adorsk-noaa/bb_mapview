define([
	"backbone",
	"./layer",
], 
function(Backbone, LayerModel){

var LayerCollection = Backbone.Collection.extend({
	model: LayerModel,

	initialize: function(){
	},

});

return LayerCollection;

});

