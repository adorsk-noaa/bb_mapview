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

		initialize: function(options){
			$(this.el).addClass('mapview');
			this.layer_views = {};
			this.render();
			this._rendering_counter = 0;
			this._loading_placeholder = $('<div></div>').addClass("loading-placeholder");
			var _this = this;

			this.on('resizeView', this.resize, this);
			this.on('ready', this.onReady, this);

			if (options.ready){
				this.trigger('ready');
			}

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
			layer_view.on('render:start', this.onRenderStart, this);
			layer_view.on('render:end', this.onRenderEnd, this);
		},

		onRenderStart: function(){
			if (this._rendering_counter == 0){
				this.showLoadingPlaceholder();
			}
			this._rendering_counter += 1;
		},

		onRenderEnd: function(){
			this._rendering_counter -= 1;
			if (this._rendering_counter == 0){
				this.hideLoadingPlaceholder();
			}
		},

		showLoadingPlaceholder: function(){
			$('.olMapViewport', $(this.el)).append(this._loading_placeholder);
			this._loading_placeholder.animate({opacity: 1}, 500);
		},

		hideLoadingPlaceholder: function(){
			_this = this;
			this._loading_placeholder.animate({opacity: 0}, 750, function(){
				_this._loading_placeholder.remove();
			});
		},

		resize: function(){
			this.map.updateSize();
		},

		onReady: function(){
			this.map.zoomToMaxExtent();
		}
		

	});

	return MapViewView
});
		
