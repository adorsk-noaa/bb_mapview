define([
	'./mapview',
	'./wms_layer',
	'./wmts_layer',
	'./map_editor',
	'./layer_editor',
	'./layer_collection_editor'
], 
function(MapViewView, WMSLayerView, WMTSLayerView, MapEditorView, LayerEditorView, LayerCollectionEditorView){
	views = {
		MapViewView: MapViewView,
		WMSLayerView: WMSLayerView,
		WMTSLayerView: WMTSLayerView,
		MapEditorView: MapEditorView,
		LayerEditorView: LayerEditorView,
		LayerCollectionEditorView: LayerCollectionEditorView
	};
	
	return views;
});
