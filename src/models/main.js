define([
	'./mapview',
	'./wms_layer',
	'./layer_collection'
], 
function(MapViewModel, WMSLayerModel, LayerCollection){

	var models = {
		MapViewModel: MapViewModel,
		WMSLayerModel: WMSLayerModel,
		LayerCollection: LayerCollection,
	};

	return models;
});
