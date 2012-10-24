
define([
	"backbone",
], 
function(Backbone){

var MapEditorModel = Backbone.Model.extend({

	defaults: {
		data_layer_definitions: [],
		overlay_layer_definitions: [],
		base_layer_definitions: []
	},

	initialize: function(){
	}

});

return MapEditorModel;

});

