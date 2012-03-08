define([
	"jquery",
	"use!backbone",
	"use!underscore",
	"use!openlayers",
	"text!./templates/mapview.html",
		],
function($, Backbone, _, ol, template){

	var MapViewView = Backbone.View.extend({

		initialize: function(){
			this.render();
		},

		render: function(){
			rendered_html = _.template(template);
			$(this.el).html(rendered_html);

			var map = new OpenLayers.Map({
				div: $('.map', this.el).get(0)
			});

			var wms = new OpenLayers.Layer.WMS(
				"OpenLayers WMS",
				"http://vmap0.tiles.osgeo.org/wms/vmap0",
				{
					'layers': 'basic',
					'params': 'kooka'
				}
				);
			map.addLayer(wms);
			map.zoomToMaxExtent();
		}
	});

	return MapViewView
});
		
