define([
	'./mapview',
	'./wms_layer',
	'./map_editor',
	'./layer_editor',
	'./layer_collection_editor'
], 
function(MapViewView, WMSLayerView, MapEditorView, LayerEditorView, LayerCollectionEditorView){
	views = {
		MapViewView: MapViewView,
		WMSLayerView: WMSLayerView,
		MapEditorView: MapEditorView,
		LayerEditorView: LayerEditorView,
		LayerCollectionEditorView: LayerCollectionEditorView
	};
	
	return views;
});
