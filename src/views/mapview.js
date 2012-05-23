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

			this.layerRegistry = {};
			this.layer_views = {};
			this.render();
			this._rendering_counter = 0;
			this._loading_placeholder = $('<div></div>').addClass("loading-placeholder");

			this.layers = this.model.get('layers');

			this.layers.on('add', this.onAddLayer, this);
			this.layers.on('remove', this.onRemoveLayer, this);

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
				//$('.map', this.el).get(0),
				this.model.get('options')
			);

			// Disable mouse wheel zoom.
			var nav_control = this.map.getControlsByClass('OpenLayers.Control.Navigation')[0];
			nav_control.disableZoomWheel();

			scaleline = new OpenLayers.Control.ScaleLine({
				div: $('.map-controls .scale.control', this.el)[0]
			});
			this.map.addControl(scaleline);

		},


		addLayerView: function(layer_view){
			this.layer_views[layer_view.model.id] = layer_view;
			this.map.addLayer(layer_view.layer);
			layer_view.on('render:start', this.onRenderStart, this);
			layer_view.on('render:end', this.onRenderEnd, this);
			layer_view.on('load:start', this.onLoadStart, this);
			layer_view.on('load:end', this.onLoadEnd, this);
		},

		onLoadStart: function(){
			this.onRenderStart();
		},
		onLoadEnd: function(){
			this.onRenderEnd();
		},

		onRenderStart: function(){
			if (this._rendering_counter == 0){
				var _this = this;
				this.loading_placeholder_timeout = setTimeout(function(){_this.showLoadingPlaceholder()}, 600);
			}
			this._rendering_counter += 1;
		},

		onRenderEnd: function(){
			this._rendering_counter -= 1;
			if (this._rendering_counter == 0){
				clearTimeout(this.loading_placeholder_timeout);
				this.hideLoadingPlaceholder();
			}
		},

		showLoadingPlaceholder: function(){
			viewport_el = $('.olMapViewport', this.el);
			viewport_el.append(this._loading_placeholder);
			$(this._loading_placeholder).css('left', viewport_el.width()/2 - this._loading_placeholder.width()/2);
			$(this._loading_placeholder).css('top', viewport_el.height()/2 - this._loading_placeholder.height()/2);

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
			this.map.render($('.map', this.el).get(0));

			// Add graticule.
			var graticule = new OpenLayers.Control.Graticule({
				intervals: this.model.get('graticule_intervals'),
				numPoints: 2, 
				labelled: true,
				labelFormat: 'dd'
			});
			this.map.addControl(graticule);
		},


		getLayerView: function(layer_model){
			var layer_view;
			if (layer_model.get('layer_type') == 'WMS'){
				layer_view = new WMSLayerView({
					model: layer_model
				});
			}

			return layer_view;
		},

		onAddLayer: function(model, layers, options){
			var layer_view = this.getLayerView(model);

			this.map.addLayer(layer_view.layer);

			layer_view.on('render:start', this.onRenderStart, this);
			layer_view.on('render:end', this.onRenderEnd, this);
			layer_view.on('load:start', this.onLoadStart, this);
			layer_view.on('load:end', this.onLoadEnd, this);


			this.layerRegistry[model.cid] = {
				model: model,
				view: layer_view,
			};

			this.syncLayerOrder();
			
		},

		onRemoveLayer: function(model, layers, options){
			var layer = this.layerRegistry[model.cid];
			this.map.removeLayer(layer.view.layer);
			layer.view.remove();
			delete this.layerRegistry[model.cid];
			this.syncLayerOrder();
		},

		syncLayerOrder: function(){
			_.each(this.layers.models, function(model, idx){
				var layer_view = this.layerRegistry[model.cid].view;
				this.map.setLayerIndex(layer_view.layer, idx);
			}, this);
		},

	});

	return MapViewView
});
		
