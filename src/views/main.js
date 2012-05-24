define([
	'./mapview',
	'./wms_layer',
	'./map_editor',
	'./layer_editor'
], 
function(MapViewView, WMSLayerView, MapEditorView, LayerEditorView){
	views = {
		MapViewView: MapViewView,
		WMSLayerView: WMSLayerView,
		MapEditorView: MapEditorView,
		LayerEditorView: LayerEditorView
	};
	
	return views;
});
