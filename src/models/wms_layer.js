define([
	"use!underscore",
	"use!backbone",
	"./layer"
], 
function(_, Backbone, LayerModel){

var WMSLayerModel = LayerModel.extend({

	defaults: _.extend({}, LayerModel.prototype.defaults, {
		type: 'WMS',
		service_url: '',
		params: ''
	}),

	initialize: function(){
	}
	

});

return WMSLayerModel;

});

