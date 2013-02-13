define([
  "jquery",
  "backbone",
  "underscore",
  "openlayers",
  "text!./templates/mapview.html",
  "./wms_layer",
  "./wmts_layer",
  "./vector_layer",
  "./graticule_layer",
  "./XYZLayer",
  "./ArcGISCacheLayer",
],
function($, Backbone, _, ol, template, WMSLayerView, WMTSLayerView, VectorLayerView, GraticuleLayerView, XYZLayerView, ArcGISCacheLayerView){

  var MapViewView = Backbone.View.extend({

    initialize: function(opts){
      this.opts = opts;
      $(this.el).addClass('mapview');

      if (! this.model.get('properties')){
        this.model.set('properties', new Backbone.Model())
      }

      this.layerViewClasses = {
        WMS: WMSLayerView,
        WMTS: WMTSLayerView,
        Vector: VectorLayerView,
        Graticule: GraticuleLayerView,
        XYZ: XYZLayerView,
        ArcGISCache: ArcGISCacheLayerView,
      };

      this.controlsRegistry = {};
      this.layerRegistry = {};
      this._rendering_counter = 0;

      this.layers = this.model.get('layers');
      if (! this.layers){
        this.layers = new Backbone.Collection();
        this.model.set('layers', this.layers);
      }

      this.initialRender();

      // Listen for map move events.
      this.map.events.register('moveend', this, this.onMapMoveEnd);

      this.model.get('properties').on('change:extent', this.updateExtent, this);

      this.layers.on('add', this.addLayer, this);
      this.layers.on('remove', this.removeLayer, this);
      this.on('remove', this.remove, this);

      this.on('resizeView', this.resize, this);

      this.on('ready', this.onReady, this);
      if (opts.ready){
        this.trigger('ready');
      }

      this.on('pagePositionChange', this.onPagePositionChange, this);

    },

    initialRender: function(){
      $(this.el).html(_.template(template));


      // Default theme should be null, rather than empty object.
      // This can get bargled by OpenLayers.
      var mapProperties = {
        theme: null,
      };
      $.extend(true, mapProperties, this.model.get('properties').toJSON());

      this.map = new OpenLayers.Map(mapProperties);

      if (! this.opts.noMousePos){
        this.map.addControl(new OpenLayers.Control.MousePosition({
          prefix: 'Lon: ',
          separator: ' , Lat:',
          numDigits: 2,
          emptyString: ''
        }));
      }

      // Add initial layers.
      _.each(this.layers.models, function(layerModel){
        this.addLayer(layerModel, this.layers);
      }, this);

      // Disable mouse wheel zoom.
      if (this.opts.noWheel){
        var nav_control = this.map.getControlsByClass('OpenLayers.Control.Navigation')[0];
        nav_control.disableZoomWheel();
      }

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

    onLoadStart: function(){
      this.onRenderStart();
    },
    onLoadEnd: function(){
      this.onRenderEnd();
    },

    onRenderStart: function(){
      if (this._rendering_counter == 0){
        var _this = this;
        this.loading_placeholder_timeout = setTimeout(function(){_this.showLoadingPlaceholder()}, 750);
      }
      this._rendering_counter += 1;
    },

    onRenderEnd: function(){
      this._rendering_counter -= 1;
      if (this._rendering_counter == 0){
        if (this.loading_placeholder_timeout){
          clearTimeout(this.loading_placeholder_timeout);
        }
        if (this.$loadingPlaceholder){
          this.$loadingPlaceholder.fadeOut('slow');
        }
      }
    },

    showLoadingPlaceholder: function(){
      if (this.$loadingPlaceholder){
        this.$loadingPlaceholder.css('left', this.$viewport.width()/2 - this.$loadingPlaceholder.width()/2);
        this.$loadingPlaceholder.css('top', this.$viewport.height()/2 - this.$loadingPlaceholder.height()/2);
        this.$loadingPlaceholder.fadeIn('slow');
      }
    },

    resize: function(){
      if (this.map){
        this.map.updateSize();
      }
    },

    onReady: function(){
      this.map.render($('.map', this.el).get(0));
      this.$viewport = $('.olMapViewport', this.el);
      this.$loadingPlaceholder = $('<div class="loading-placeholder" style="display: none;"><div class="img"></div></div>');
      this.$loadingPlaceholder.appendTo(this.$viewport);

      this.mapRendered = true;

      // Zoom to extent if given, max extent otherwise.
      if (this.model.get('properties').get('extent')){
        this.updateExtent();
      }
    },

    updateExtent: function(){
      if (this.mapRendered){
        var extent = this.model.get('properties').get('extent');
        this.map.zoomToExtent(extent);
      }
    },

    // Clear mouse cache when position changes.  Otherwise can get incorrect mouse positions inside the map.
    onPagePositionChange: function(){
      this.map.events.clearMouseCache();
    },

    getLayerView: function(layer_model){
      var layerViewClass = this.layerViewClasses[layer_model.get('layer_type')];
      layerView = new layerViewClass({
        model: layer_model
      });
      return layerView;
    },

    addLayer: function(model, layers, options){
      var layerView = this.getLayerView(model);

      if (model.get('layer_type') == 'Graticule'){
        this.controlsRegistry[model.cid] = layerView.graticuleControl;
        this.map.addControl(layerView.graticuleControl);
      }

      this.map.addLayer(layerView.layer);

      var zIndex = model.get('zIndex');
      if (typeof zIndex != 'undefined'){
        this.map.setLayerZIndex(layerView.layer, zIndex);
      }

      model.on('change:zIndex', function(){
        this.map.setLayerZIndex(layerView.layer, model.get('zIndex'));
      }, this);

      layerView.on('render:start', this.onRenderStart, this);
      layerView.on('render:end', this.onRenderEnd, this);
      layerView.on('load:start', this.onLoadStart, this);
      layerView.on('load:end', this.onLoadEnd, this);

      this.layerRegistry[model.id] = layerView;

    },

    removeLayer: function(layerModel, layers, options){
      var layer = this.layerRegistry[layerModel.id];
      if (layer.layer){
        this.map.removeLayer(layer.layer);
        delete this.layerRegistry[layerModel.id];
      }
      if (layerModel.get('layer_type') == 'Graticule'){
        this.map.removeControl(layer.graticuleControl);
        delete this.controlsRegistry[layerModel.cid];
      }
      layer.trigger('remove');
      this.trigger("removeLayerView");
    },

    onMapMoveEnd: function(){
      this.model.get('properties').set({
        resolution: this.map.getResolution(),
        extent: this.map.getExtent().toArray(),
      }, {silent: true});
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

