define([
	"jquery",
	"use!backbone",
	"use!underscore",
	"_s",
	"use!ui",
	"./layer_collection_editor",
	"text!./templates/map_editor.html"
		],
function($, Backbone, _, _s, ui, LayerCollectionEditorView, template){

	var MapEditorView = Backbone.View.extend({

		events: {
			'click .layers-editor-container > .header': 'toggleLayerEditor',
		},

		initialize: function(options){
			this.map_view = this.model.get('map_view');
			this.layers = this.map_view.model.get('layers');

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
			this.$table = $(this.el).children('table.body');
			this.$map_container = $('.map-container', this.el);

			// Tabify the layers editor.
			$('.layers-editor > .tabs', this.el).tabs();

			// Setup map.
			this.$map_container.append(this.map_view.el);

			// Setup layer categories.
			_.each(_.keys(this.category_configs), function(category){
				var category_layers = this.model.get(category + '_layers') || [];

				// Create layer collection editor.
				new LayerCollectionEditorView({
					model: new Backbone.Model({
						layers: category_layers,
						start_index: this.category_configs[category]['start_index']
					}),
					el: $(_s.sprintf('.%s-layers', category), this.el)
				});
				
				// Add layers to overall map layer collection.
				_.each(category_layers.models, function(layer){
					this.layers.add(layer);
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
			var $c = this.$table.parent();
			this.$table.css('width', $c.css('width'));
			this.$table.css('height', $c.css('height'));
		},

		resizeStop: function(){
			// Size map view as if layers editor was minimized.
			var table_height = parseFloat(this.$table.css('height'));
			var layers_editor_minimized_height = parseFloat($('.layers-editor-row', this.el).css('minHeight'));
			var new_map_height = table_height - layers_editor_minimized_height;
			this.$map_container.css('height', new_map_height);
			this.map_view.resize();
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

		onReady: function(){
			this.resize();
			this.resizeStop();
			this.map_view.trigger('ready');
		}
	});

	return MapEditorView;
});
		
