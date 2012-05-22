define([
	'./mapview',
	'./layer',
	'./layer_collection',
	'./map_editor'
], 
function(MapViewModel, LayerModel, LayerCollection, MapEditorModel){

	var models = {
		MapViewModel: MapViewModel,
		LayerModel: LayerModel,
		LayerCollection: LayerCollection,
		MapEditorModel: MapEditorModel
	};

	return models;
});
