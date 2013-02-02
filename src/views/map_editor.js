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
  "./MapInfo",
],
function($, Backbone, _, _s, ui, Util, MapViewView, LayerCollectionEditorView, template, qtip, MapInfoView){

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
      _.each(this.categoryConfigs, function(config, category){
        var layers = this.model.get(category + '_layers') || [];

        // Create layer collection editor.
        var LayerCollectionEditorClass = this.getLayerCollectionEditorClass();
        var layerCollectionEditor = new LayerCollectionEditorClass(_.extend({
          model: new Backbone.Model({
            layers: layers,
          }),
          el: $(_s.sprintf('.%s-layers-editor', category), this.el)
        }, config));

        this.layerCollectionEditors[category] = layerCollectionEditor;

        // Add layers to overall map layer collection.
        _.each(layers.models, function(layer){
          this.layers.add(layer);
        }, this);
      }, this);

      this.setupLayersControl();
      this.setupMapInfoControl();

    },

    setupControl: function(opts){
      var $control = opts.$control;
      var $controlBody = $('> .control-body', $control);
      var $controlLauncher = $('> .launcher', $control);
      var $toggleIcon = $('> .toggleIcon', $controlLauncher);

      var qtipOpts = {
        content: {
          text: $controlBody,
        },
        position: {
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
              x: parseInt($('> .launcher', $control).css('paddingRight')),
              y: -1 * parseInt($('> .launcher', $control).css('paddingBottom'))
            },
          },
        }
      });
    },

    setupMapInfoControl: function(){

      this.mapInfo = new MapInfoView({
        model: new Backbone.Model({
          layers: this.layers,
        }),
        el: $('.map-info', this.el)
      });

      var $control = $('.map-info-control', this.el);
      this.setupControl({
        $control: $control,
        qtip: {
          position: {
            my: 'bottom left',
            at: 'top left',
            adjust: {
              x: -1 * parseInt($('> .launcher', $control).css('paddingRight')),
              y: parseInt($('> .launcher', $control).css('paddingBottom'))
            },
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

