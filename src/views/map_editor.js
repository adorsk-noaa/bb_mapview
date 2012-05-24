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
			'click .layers-editor > .layers-editor-section > .header': 'toggleAccordion'
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

			// Set index namespaces for ordering layer categories.
			this.category_index_namespaces = {
				'base': 100,
				'data': 200,
				'overlay': 300
			};

			this.initialRender();

			this.on('ready', this.onReady, this);

			if (options.ready){
				this.trigger('ready');
			}

			//this.toggleLayerEditor({currentTarget: $('.layers-editor-container > .header', this.el)});
			window.m = this.map;
		},

		initialRender: function(){
			$(this.el).html(_.template(template));

			this.setupMap();

			this.setupBaseLayers();
			
			this.setupDataLayers();

			this.setupOverlayLayers();

		},

		setupMap: function(){
			$('.map-container', this.el).append(this.model.get('map').el);
		},


		setupBaseLayers: function(){

			/*
			base_layer_editor_m = new Backbone.Model({
				layers: this.model.get('base_layers')
			});

			base_layer_editor_m.on('change:selected_layer', this.onSelectedBaseLayerChange, this);

			this.base_layer_editor = new BaseLayerEditorView({
				el: $('.base-layer-editor', this.el),
				model: base_layer_editor_m
			});

			this.base_layer_editor.postInitialize();
			*/
			_.each(this.model.get('base_layers').models, function(layer){
				var layer_view = new LayerEditorView({
					model: layer
				});
				$('.base-layers', this.el).append(layer_view.el);
				this.addLayer(layer);
			}, this);

		},

		setupDataLayers: function(){

			data_layer_editor_m = new Backbone.Model({
				layers: this.model.get('data_layers')
			});

			data_layer_editor_m.on('change:selected_layer', this.onSelectedDataLayerChange, this);

			this.data_layer_editor = new DataLayerEditorView({
				el: $('.data-layer-editor', this.el),
				model: data_layer_editor_m
			});

			this.data_layer_editor.postInitialize();

		},

		setupOverlayLayers: function(){
			var overlay_layers = this.model.get('overlay_layers');

			overlay_layer_editor_m = new Backbone.Model({
				layers: this.model.get('overlay_layers')
			});

			this.overlay_layer_editor = new OverlayLayerEditorView({
				el: $('.overlay-layer-editor', this.el),
				model: overlay_layer_editor_m
			});

			this.overlay_layer_editor.postInitialize();

			_.each(overlay_layers.models, function(layer){
				this.addLayer(layer);
			}, this);

		},

		onSelectedBaseLayerChange: function(){
			if (this.selected_base_layer){
				this.removeLayer(this.selected_base_layer);
			}
			this.selected_base_layer = this.base_layer_editor.model.get('selected_layer');
			this.addLayer(this.selected_base_layer);
		},

		onSelectedDataLayerChange: function(){
			if (this.selected_data_layer){
				this.removeLayer(this.selected_data_layer);
			}
			this.selected_data_layer = this.data_layer_editor.model.get('selected_layer');
			this.addLayer(this.selected_data_layer);
		},

		onOverlayLayersChange: function(){
			console.log('overlay layers change');
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
			var cat_idx_ns = this.category_index_namespaces[layer.get('layer_category')] || 0;
			var cat_idx = layer.get('category_index') || 0;
			return cat_idx_ns+ cat_idx;
		},

		onReady: function(){
			this.map.trigger('ready');
		}
	});

	return MapEditorView;
});
		
