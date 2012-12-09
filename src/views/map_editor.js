define([
    "jquery",
    "backbone",
    "underscore",
    "_s",
    "ui",
    "Util",
    "./mapview",
    "./layer_collection_editor",
    "text!./templates/map_editor.html"
    ],
    function($, Backbone, _, _s, ui, Util, MapViewView, LayerCollectionEditorView, template){

      var MapEditorView = Backbone.View.extend({

        events: {
          'click .layers-editor-container > .header': 'toggleLayerEditor',
        },

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

        // Tabify the layers editor.
        $('.layers-editor > .tabs', this.el).tabs();

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
              el: $(_s.sprintf('.%s-layers', category), this.el)
          });

          this.layerCollectionEditors[category] = layerCollectionEditor;

          // Add layers to overall map layer collection.
          _.each(category_layers.models, function(layer){
            this.layers.add(layer);
          }, this);

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
        this.mapView.resize();
      },

      deactivate: function(){
        this.mapView.deactivate();
      },

      activate: function(){
        this.mapView.activate();
      },

      toggleLayerEditor: function(e){
        var $header = $(e.currentTarget);
        var $body = $header.next();

        var $container = $($header.parent());

        expand = true;
        if ($container.hasClass('expanded')){
          expand = false;
        }
        var dim = 'height';

        // Calculate how much to change dimension.
        var delta = parseInt($container.css('max' + _s.capitalize(dim)), 10) - parseInt($container.css('min' + _s.capitalize(dim)), 10);
        if (! expand){
          delta = -1 * delta;
        }

        // Animate field container dimension.
        $container.addClass('changing');

        // Toggle button text
        var button_text = ($('button.toggle', $header).html() == '\u25B2') ? '\u25BC' : '\u25B2';
        $('button.toggle', $container).html(button_text);

        // Execute the animation.
        var _this = this;
        var container_dim_opts = {};
        container_dim_opts[dim] = parseInt($container.css(dim),10) + delta;
        $container.animate(
            container_dim_opts,
            {
              complete: function(){
                $container.removeClass('changing');

                if (expand){
                  $container.addClass('expanded')
                }
                else{
                  $container.removeClass('expanded')
          _this.resize();
        _this.resizeStop();
                }
              }
            }
            );

        // Animate container cell dimension.
        $container.parent().animate(container_dim_opts);

        // Animate container table dimension.
        var table_dim_opts = {};
        table_dim_opts[dim] = parseInt(this.$table.css(dim),10) + delta;
        this.$table.animate(table_dim_opts);

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
      }
      });

      return MapEditorView;
    });

