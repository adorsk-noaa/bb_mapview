define([
	"jquery",
	"use!backbone",
	"use!underscore",
	"_s",
	"use!ui",
	"./data_layer_editor",
	"./base_layer_editor",
	"./overlay_layer_editor",
	"./layer_editor",
	"text!./templates/map_editor.html"
		],
function($, Backbone, _, _s, ui, DataLayerEditorView, BaseLayerEditorView, OverlayLayerEditorView, LayerEditorView, template){

	var MapEditorView = Backbone.View.extend({

		events: {
			'click .layers-editor-container > .header': 'toggleLayerEditor',
		},

		initialize: function(options){
			this.map = this.model.get('map');
			this.layers = this.map.model.get('layers');

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
					'start_index': 100
				},
				'data': {
					'start_index': 200
				},
				'overlay': {
					'start_index': 300
				}
			};

			this.initialRender();

			this.on('ready', this.onReady, this);

			if (options.ready){
				this.trigger('ready');
			}

			this.toggleLayerEditor({currentTarget: $('.layers-editor-container > .header', this.el)});
		},

		initialRender: function(){
			$(this.el).html(_.template(template));

			// Tabify the layers editor.
			$('.layers-editor > .tabs', this.el).tabs();

			// Setup map.
			$('.map-container', this.el).append(this.model.get('map').el);

			// Setup layer categories.
			_.each(_.keys(this.category_configs), function(category){
				var category_layers = this.model.get(category + '_layers') || [];
				_.each(category_layers.models, function(layer){
					this.addLayer(layer);
				}, this);
			}, this);

		},

		setupBaseLayers: function(){

			_.each(this.model.get('base_layers').models, function(layer){
				var layer_view = new LayerEditorView({
					model: layer
				});
				$('.base-layers', this.el).append(layer_view.el);
				this.addLayer(layer);
			}, this);

		},

		render: function(){
		},

		resize: function(){
		},

		resizeStop: function(){
		},

		toggleLayerEditor: function(e){
			this.toggleAccordion(e);

			// Toggle button text.
			$header = $(e.currentTarget);
			var $toggle_button = $('button.toggle', $header);
			var button_text = ($toggle_button.html() == '\u25B2') ? '\u25BC' : '\u25B2';
			$toggle_button.html(button_text);
		},

		toggleAccordion: function(e){
			$header = $(e.currentTarget);
			$body = $header.next();
			if ($body.is(':hidden')){
				$body.slideDown('slow');
			}
			else{
				$body.slideUp('slow');
			}
		},

		addLayer: function(layer){
			var category = layer.get('layer_category');
			var layer_view = new LayerEditorView({
				model: layer
			});
			$(_s.sprintf('.%s-layers', category), this.el).append(layer_view.el);
			layer.set('index', this.computeLayerIndex(layer));
			this.layers.add(layer);
		},

		removeLayer: function(layer){
			this.layers.remove([layer]);
		},

		onLayerCategoryIndexChange: function(layer){
			layer.set('index', this.computeLayerIndex(layer));
			this.layers.sort();
		},

		computeLayerIndex: function(layer){
			var category_start_index = this.category_configs[layer.get('layer_category')]['start_index'] || 0;
			var category_index = layer.get('category_index') || 0;
			return category_start_index + category_index;
		},

		onReady: function(){
			this.map.trigger('ready');
		}
	});

	return MapEditorView;
});
		
