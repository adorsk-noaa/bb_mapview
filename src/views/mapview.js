define([
	"jquery",
	"use!backbone",
	"use!underscore",
	"use!openlayers",
	"text!./templates/mapview.html",
	"./wms_layer",
		],
function($, Backbone, _, ol, template, WMSLayerView){

	var MapViewView = Backbone.View.extend({

		initialize: function(){
			this.layer_views = {};
			this.render();
		},

		render: function(){
			rendered_html = _.template(template);
			$(this.el).html(rendered_html);

			this.map = new OpenLayers.Map({
				div: $('.map', this.el).get(0)
			});

			is_first_layer = true;
			this.model.get('layers').each(function(layer){
				layer_view = this.getLayerView(layer);
				this.layer_views[layer.get('name')] = layer_view;
				this.map.addLayer(layer_view.layer);

				if (is_first_layer){
					layer_view.layer.isBaseLayer = true;
				}
				else{
					layer_view.layer.isBaseLayer = false;
				}
				is_first_layer = false;
			}, this);

			this.map.zoomToExtent(new OpenLayers.Bounds(-80, 40, -65, 45));
		},

		getLayerView: function(layer){
			if (layer.get('type') == 'WMS'){
				return new WMSLayerView({model: layer});
			}
		}
	});

	return MapViewView
});
		
