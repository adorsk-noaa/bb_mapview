define([
  "jquery",
  "backbone",
  "underscore",
  "openlayers",
  "text!./templates/mapview.html",
  "./wms_layer",
  "./wmts_layer",
],
function($, Backbone, _, ol, template, WMSLayerView, WMTSLayerView){

  var MapViewView = Backbone.View.extend({

    initialize: function(options){
      $(this.el).addClass('mapview');

      this.layerRegistry = {};
      this._rendering_counter = 0;
      this._loading_placeholder = $('<div class="loading-placeholder"><div class="img"></div></div>');

      this.layers = this.model.get('layers');
      if (! this.layers){
        this.layers = new Backbone.Collection();
        this.model.set('layers', this.layers);
      }

      this.initialRender();

      // Listen for map move events.
      this.map.events.register('moveend', this, this.onMapMoveEnd);

      this.layers.on('add', this.addLayer, this);
      this.layers.on('remove', this.removeLayer, this);
      this.on('remove', this.remove, this);

      this.on('resizeView', this.resize, this);

      this.on('ready', this.onReady, this);
      if (options.ready){
        this.trigger('ready');
      }

      this.on('pagePositionChange', this.onPagePositionChange, this);

    },

    initialRender: function(){
      rendered_html = _.template(template);
      $(this.el).html(rendered_html);

      var mapOptions = JSON.parse(JSON.stringify(this.model.get('options') || {}));

      // Merge in other options stored in model attributes.
      _.each(['resolution', 'extent'], function(attr){
        var value = this.model.get(attr);
        if (typeof value != 'undefined'){
          mapOptions[attr] = value;
        }
      }, this);

      // Clean up theme option.
      // Should be null, rather than empty object.
      // This can get bargled by OpenLayers.
      if (mapOptions.theme && $.isEmptyObject(mapOptions.theme)){
        mapOptions.theme = null;
      }

      this.map = new OpenLayers.Map(mapOptions);

      // Add initial layers.
      _.each(this.layers.models, function(layerModel){
        this.addLayer(layerModel, this.layers);
      }, this);

      // Disable mouse wheel zoom.
      var nav_control = this.map.getControlsByClass('OpenLayers.Control.Navigation')[0];
      nav_control.disableZoomWheel();

      scaleline = new OpenLayers.Control.ScaleLine({
        div: $('.map-controls .scale.control', this.el)[0]
      });
      this.map.addControl(scaleline);

    },

    deactivate: function(){
      _.each(this.layerRegistry, function(layer){
        layer.deactivate();
      });
    },

    activate: function(){
      _.each(this.layerRegistry, function(layer){
        layer.activate();
      });
    },

    addLayerView: function(layerView){
      this.layerRegistry[layerView.model.id] = layerView;
      this.map.addLayer(layerView.layer);
      layerView.model.on('render:start', this.onRenderStart, this);
      layerView.model.on('render:end', this.onRenderEnd, this);
      layerView.model.on('load:start', this.onLoadStart, this);
      layerView.model.on('load:end', this.onLoadEnd, this);

      // Trigger layer add event.
      this.trigger("addLayerView");
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
        this.loading_placeholder_timeout = setTimeout(function(){_this.showLoadingPlaceholder()}, 500);
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

      // Zoom to extent if given, max extent otherwise.
      if (this.model.get('extent')){
        this.map.zoomToExtent(this.model.get('extent'));
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
        layerView = new WMSLayerView({
          model: layer_model
        });
      }
      else if (layer_model.get('layer_type') == 'WMTS'){
        layerView = new WMTSLayerView({
          model: layer_model
        });
      }

      return layerView;
    },

    addLayer: function(model, layers, options){
      var layerView = this.getLayerView(model);

      this.map.addLayer(layerView.layer);

      if (model.get('index')){
        this.map.setLayerIndex(layerView.layer, model.get('index'));
      }

      var _map = this.map;
      model.on('change:index', function(){
        _map.setLayerZIndex(layerView.layer, model.get('index'));
      });

      layerView.model.on('render:start', this.onRenderStart, this);
      layerView.model.on('render:end', this.onRenderEnd, this);
      layerView.model.on('load:start', this.onLoadStart, this);
      layerView.model.on('load:end', this.onLoadEnd, this);

      this.layerRegistry[model.id] = layerView;

    },

    removeLayer: function(layerModel, layers, options){
      var layer = this.layerRegistry[layerModel.id];
      if (layer.layer){
        this.map.removeLayer(layer.layer);
        layer.trigger('remove');
      }
      delete this.layerRegistry[layerModel.id];
      this.trigger("removeLayerView");
    },

    onMapMoveEnd: function(){
      // Update model extend and resolution after moves.
      this.model.set({
        extent: this.map.getExtent().toArray(),
        resolution: this.map.getResolution(),
      });
    },

    remove: function(){
      _.each(this.layers.models, function(layerModel){
        this.removeLayer(layerModel);
      }, this);
      this.map.destroy();
      Backbone.View.prototype.remove.apply(this, arguments);
      this.model.off();
      this.off();
    }


  });

  return MapViewView
});

