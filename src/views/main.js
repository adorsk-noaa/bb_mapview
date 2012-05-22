define([
	'./mapview',
	'./wms_layer',
	'./map_editor'
], 
function(MapViewView, WMSLayerView, MapEditorView){
	views = {
		MapViewView: MapViewView,
		WMSLayerView: WMSLayerView,
		MapEditorView: MapEditorView
	};
	
	return views;
});
