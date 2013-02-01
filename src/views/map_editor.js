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
  "qtip",
],
function($, Backbone, _, _s, ui, Util, MapViewView, LayerCollectionEditorView, template, qtip){

  var MapEditorView = Backbone.View.extend({

    events: {},

    initialize: function(options){

      // Create the map view.
      this.mapView = new MapViewView({
        model: this.model.get('map') || new Backbone.Model()
      });
      this.layers = this.mapView.model.get('layers');

      // Sort layers by index.
      this.layers.comparator = function(layer){
        return layer.get('index');
      };

      // Listen for changes in layer category indices.
      this.layers.on('change:category_index', this.onLayerCategoryIndexChange, this);

      $(this.el).addClass('map-editor');

      // Iniitialize configs for layers categories.
      this.category_configs = {
        'base': {
          'start_index': 1
        },
        'data': {
          'start_index': 20
        },
        'overlay': {
          'start_index': 40
        }
      };

      this.initialRender();

      this.on('ready', this.onReady, this);
      this.on('resize', this.resize, this);
      this.on('resizeStop', this.resizeStop, this);
      this.on('activate', this.activate, this);
      this.on('deactivate', this.deactivate, this);
      this.on('pagePositionChange', this.onPagePositionChange, this);
      this.on('remove', this.remove, this);

      if (options.ready){
        this.trigger('ready');
      }

    },

    initialRender: function(){
      $(this.el).html(_.template(template, {view: this}));

      this.$table = $(this.el).children('table.body');
      this.$map_container = $('.map-container', this.el);

      // Accordionize the layer editor sections
      $('.layers-editor > .accordions > .accordion', this.el).each(function(i, el){
        $(el).accordion({
          collapsible: true,
          heightStyle: 'content'
        });
      });

      // Setup map.
      this.$map_container.append(this.mapView.el);

      // Setup layer categories and editors.
      this.layerCollectionEditors = {};
      _.each(_.keys(this.category_configs), function(category){
        var category_layers = this.model.get(category + '_layers') || [];

        // Create layer collection editor.
        var LayerCollectionEditorClass = this.getLayerCollectionEditorClass();
        var layerCollectionEditor = new LayerCollectionEditorClass({
          model: new Backbone.Model({
            layers: category_layers,
            start_index: this.category_configs[category]['start_index']
          }),
          el: $(_s.sprintf('.%s-layers-editor', category), this.el)
        });

        this.layerCollectionEditors[category] = layerCollectionEditor;

        // Add layers to overall map layer collection.
        _.each(category_layers.models, function(layer){
          this.layers.add(layer);
        }, this);

      }, this);

      var $layersControl = $('.layers-control', this.el);
      var $layersControlBody = $('> .control-body', $layersControl);
      var $layersControlLauncher = $('> .launcher', $layersControl);
      var $toggleIcon = $('> .toggleIcon', $layersControlLauncher);
      $layersControl.qtip({
        content: {
          text: $layersControlBody,
        },
        position: {
          my: 'top right',
          at: 'bottom right',
          adjust: {
            y: -1 * parseInt($('> .launcher', $layersControl).css('paddingBottom'))
          },
          container: $('> .inner', this.el)
        },
        show: {
          event: 'click'
        },
        hide: {
          fixed: true,
          event: null,
        },
        style: {
          classes: 'control-body-qtip',
          tip: false
        },
        events: {
          render: function(event, api){
            $layersControlBody.css('min-width', $layersControl.outerWidth());
            $layersControlBody.removeClass('uninitialized');
            // Toggle when target is clicked.
            $(api.elements.target).on('click', function(clickEvent){
              clickEvent.preventDefault();
              api.toggle();
            });
          },
          show: function(event, api){
            if ($toggleIcon){$toggleIcon.html('-');}
          },
          hide: function(event, api){
            if ($toggleIcon){$toggleIcon.html('+');}
          },
        }
      });


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
      this.mapView.resize();
    },

    deactivate: function(){
      this.mapView.deactivate();
    },

    activate: function(){
      this.mapView.activate();
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

