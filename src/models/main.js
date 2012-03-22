define([
	'./mapview',
	'./layer',
	'./layer_collection'
], 
function(MapViewModel, LayerModel, LayerCollection){

	var models = {
		MapViewModel: MapViewModel,
		LayerModel: LayerModel,
		LayerCollection: LayerCollection,
	};

	return models;
});
