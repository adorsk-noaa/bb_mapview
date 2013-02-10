define([
  "jquery",
  "backbone",
  "underscore",
  "_s",
  "ui",
  "Util",
  "./mapview",
  "./layer_collection_editor",
  "text!./templates/map_editor.html",
  "tabble",
],
function($, Backbone, _, _s, ui, Util, MapViewView, LayerCollectionEditorView, template, tabble){

  var MapEditorView = Backbone.View.extend({

    events: {},

    initialize: function(options){

      // Create the map view.
      this.mapView = new MapViewView({
        model: this.model.get('map') || new Backbone.Model(),
        noMousePos: true,
      });
      this.mapViewLayers = this.mapView.model.get('layers');

      // Sort layers by index.
      this.mapViewLayers.comparator = function(layerModel){
        return layerModel.get('properties').get('index');
      };

      $(this.el).addClass('map-editor');

      // Iniitialize configs for layers categories.
      this.categoryConfigs = {
        base: {
          startIndex: 100,
          selectable: 'single',
          sortable: false,
        },
        overlay: {
          startIndex: 200,
          selectable: 'multiple',
          sortable: true,
        }
      };

      this.initialRender();

      this.on('ready', this.onReady, this);
      this.on('resize', this.resize, this);
      this.on('resizeStop', this.resizeStop, this);
      this.on('pagePositionChange', this.onPagePositionChange, this);
      this.on('remove', this.remove, this);

      if (options.ready){
        this.trigger('ready');
      }

    },

    initialRender: function(){
      $(this.el).html(_.template(template, {view: this}));

      this.$table = $(this.el).children('table');

      this.$cells = {
        map: $('.map-cell', this.$table),
        layersEditor: $('.layers-editor-cell', this.$table),
      };

      this.$table.tabble({
        stretchTable: true,
        resize: _.bind(this.onTabbleResize, this),
      });
      this.$map_container = $('.map-container', this.el);

      // Setup map.
      this.$map_container.append(this.mapView.el);

      // Setup layer collection editor.
      var layers = this.model.get('layers');
      var LayerCollectionEditorClass = this.getLayerCollectionEditorClass();
      this.layerCollectionEditor = new LayerCollectionEditorClass({
        startIndex: 100,
        selectable: 'multiple',
        sortable: true,
        model: new Backbone.Model({
          layers: layers,
        }),
        el: $('.layers-editor', this.el),
      });

      // Add layers to overall map layer collection.
      _.each(layers.models, function(layer){
        this.mapViewLayers.add(layer);
      }, this);

    },

    getLayerCollectionEditorClass: function(){
      return LayerCollectionEditorView;
    },

    render: function(){
    },

    resize: function(){
      Util.util.fillParent(this.$table);
    },

    resizeStop: function(){
      this.$table.tabble('resize');
      this.mapView.resize();
    },

    onTabbleResize: function(){
      var minDims = this.getMinDims();
      this.$table.css({
        'minWidth': minDims.w,
        'minHeight': minDims.h,
      });
    },

    getMinDims: function(){
      var mapCellDims = {
        h: parseInt(this.$cells.map.css('min-height')),
        w: parseInt(this.$cells.map.css('min-width')),
      };
      var layersEditorDims = {
        w: this.$cells.layersEditor.width(),
      }
      return {
        w: mapCellDims.w + layersEditorDims.w,
        h: mapCellDims.h,
      };
    },

    onReady: function(){
      this.resize();
      this.resizeStop();
      this.mapView.trigger('ready');
    },

    onPagePositionChange: function(){
      this.mapView.trigger('pagePositionChange');
    },

    remove: function(){
      Backbone.View.prototype.remove.apply(this, arguments);
      this.mapView.trigger('remove');
      _.each(this.layerCollectionEditors, function(layerCollectionEditor){
        layerCollectionEditor.trigger("remove");
      });
      this.model.off();
      this.off();
    },

    togglerLayersControl: {

    }

  });

  return MapEditorView;
});

