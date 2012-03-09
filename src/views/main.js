define([
	'./mapview',
	'./wms_layer'
], 
function(MapViewView, WMSLayerView){
	views = {
		MapViewView: MapViewView,
		WMSLayerView: WMSLayerView
	};
	
	return views;
});
