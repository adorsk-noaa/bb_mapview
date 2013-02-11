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
      this.mapViewLayers = this.mapView.model.get('layers');

      $(this.el).addClass('map-editor');

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

      this.setupLayersControl();
    },

    setupControl: function(opts){
      var $control = opts.$control;
      var $controlBody = $('> .control-body', $control);
      var $controlLauncher = $('> .launcher', $control);
      var $toggleIcon = $('> .toggleIcon', $controlLauncher);
      var $container = $('> .inner', this.el);
      var qtipOpts = {
        content: {
          text: $controlBody,
        },
        position: {
          container: $container,
          viewport: $container,
          effect: null,
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
            $controlBody.css('min-width', $control.outerWidth());
            $controlBody.removeClass('uninitialized');
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
      };
      $.extend(true, qtipOpts, opts.qtip);
      $control.qtip(qtipOpts);

    },

    setupLayersControl: function(){
      var $control = $('.layers-control', this.el);
      this.setupControl({
        $control: $control,
        qtip: {
          position: {
            my: 'top right',
            at: 'bottom right',
            adjust: {
              x: parseInt($('> .launcher', $control).css('paddingRight')) || null,
              y: -1 * parseInt($('> .launcher', $control).css('paddingBottom')) || null,
            },
          },
          style: {
            classes: 'control-body-qtip layers-control-qtip'
          },
        }
      });
      var api = $control.qtip('api');
      var origShowCallback = api.get('events.show');
      var decoratedShowCallback = function(event, api){
        origShowCallback(arguments);
        $(api.elements.tooltip).css('bottom', 5);
      }
      api.set('events.show', decoratedShowCallback);

      this.$layersControl = $control;
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

    onReady: function(){
      this.resize();
      this.resizeStop();
      this.mapView.trigger('ready');
      this.$layersControl.qtip('show');
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

  });

  return MapEditorView;
});

