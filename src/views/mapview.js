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

			this.map = new OpenLayers.Map(
				$('.map', this.el).get(0),
				this.model.get('options')
			);

			scaleline = new OpenLayers.Control.ScaleLine();
			this.map.addControl(scaleline);

			scale= new OpenLayers.Control.Scale();
			this.map.addControl(scale);
		},

		addLayerView: function(layer_view){
			this.layer_views[layer_view.model.id] = layer_view;
			this.map.addLayer(layer_view.layer);
		}

	});

	return MapViewView
});
		
