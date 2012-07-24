define([
	"jquery",
	"use!backbone",
	"use!underscore",
	"use!openlayers",
	"text!./templates/mapview.html",
	"./wms_layer",
	"./wmts_layer",
		],
function($, Backbone, _, ol, template, WMSLayerView, WMTSLayerView){

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

			this.on('pagePositionChange', this.onPagePositionChange, this);

		},

		render: function(){
			rendered_html = _.template(template);
			$(this.el).html(rendered_html);

			this.map = new OpenLayers.Map(
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

		deactivate: function(){
			_.each(this.layer_views, function(layer_view){
				layer_view.deactivate();
			});
		},

		activate: function(){
			_.each(this.layer_views, function(layer_view){
				layer_view.activate();
			});
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
                if (this.loading_placeholder_timeout){
                    clearTimeout(this.loading_placeholder_timeout);
                }
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
            if (this.map){
                this.map.updateSize();
            }
            // Some browsers require the graticule to be refreshed on resize.
            if (this.graticule){
                this.graticule.deactivate();
                this.graticule.activate();
            }
		},

		onReady: function(){
			this.map.render($('.map', this.el).get(0));

			// Add graticule.
			this.graticule = new OpenLayers.Control.Graticule({
				intervals: this.model.get('graticule_intervals'),
				numPoints: 2, 
				labelled: true,
				labelFormat: 'dd'
			});
			this.map.addControl(this.graticule);

			// Zoom to initial extent if given, max extent otherwise.
			if (this.model.get('initial_extent')){
				this.map.zoomToExtent(this.model.get('initial_extent'));
			}
			else{
				this.map.zoomToMaxExtent();
			}
		},

		// Clear mouse cache when position changes.  Otherwise can get incorrect mouse positions inside the map.
		onPagePositionChange: function(){
			this.map.events.clearMouseCache();
		},

		getLayerView: function(layer_model){
			if (layer_model.get('layer_type') == 'WMS'){
				layer_view = new WMSLayerView({
					model: layer_model
				});
			}
            else if (layer_model.get('layer_type') == 'WMTS'){
				layer_view = new WMTSLayerView({
					model: layer_model
				});
            }

			return layer_view;
		},

		onAddLayer: function(model, layers, options){
			var layer_view = this.getLayerView(model);

			this.map.addLayer(layer_view.layer);

            if (model.get('index')){
                this.map.setLayerIndex(layer_view.layer, model.get('index'));
            }

            var _map = this.map;
            model.on('change:index', function(){
                _map.setLayerZIndex(layer_view.layer, model.get('index'));
            });

			layer_view.on('render:start', this.onRenderStart, this);
			layer_view.on('render:end', this.onRenderEnd, this);
			layer_view.on('load:start', this.onLoadStart, this);
			layer_view.on('load:end', this.onLoadEnd, this);


			this.layerRegistry[model.cid] = {
				model: model,
				view: layer_view,
			};

		},

		onRemoveLayer: function(model, layers, options){
			var layer = this.layerRegistry[model.cid];
			this.map.removeLayer(layer.view.layer);
			layer.view.remove();
			delete this.layerRegistry[model.cid];
		},

        remove: function(){
            this.map.destroy();
	        Backbone.View.prototype.remove.apply(this, arguments);
        }


	});

	return MapViewView
});
		
