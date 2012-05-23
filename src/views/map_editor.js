define([
	"jquery",
	"use!backbone",
	"use!underscore",
	"_s",
	"use!ui",
	"./data_layer_editor",
	"./base_layer_editor",
	"text!./templates/map_editor.html"
		],
function($, Backbone, _, _s, ui, DataLayerEditorView, BaseLayerEditorView, template){

	var MapEditorView = Backbone.View.extend({

		events: {
			'click .layer-editor-tab .title': 'toggleLayerEditor',
		},

		initialize: function(options){
			this.map = this.model.get('map');
			this.layers = this.map.model.get('layers');
			$(this.el).addClass('map-editor');
			this.initialRender();

			this.on('ready', this.onReady, this);

			if (options.ready){
				this.trigger('ready');
			}
		},

		initialRender: function(){
			$(this.el).html(_.template(template));

			this.setupMap();

			this.setupBaseLayerEditor();
			
			this.setupDataLayerEditor();

		},

		setupMap: function(){
			$('.map-container', this.el).append(this.model.get('map').el);
		},

		setupDataLayerEditor: function(){
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

		setupBaseLayerEditor: function(){
			base_layer_editor_m = new Backbone.Model({
				layers: this.model.get('base_layers')
			});

			base_layer_editor_m.on('change:selected_layer', this.onSelectedBaseLayerChange, this);

			this.base_layer_editor = new BaseLayerEditorView({
				el: $('.base-layer-editor', this.el),
				model: base_layer_editor_m
			});

			this.base_layer_editor.postInitialize();

		},

		onSelectedDataLayerChange: function(){
			if (this.selected_data_layer){
				this.removeLayer(this.selected_data_layer);
			}
			this.selected_data_layer = this.data_layer_editor.model.get('selected_layer');
			this.addDataLayer(this.selected_data_layer);
		},

		onSelectedBaseLayerChange: function(){
			if (this.selected_base_layer){
				this.removeLayer(this.selected_base_layer);
			}
			this.selected_base_layer = this.base_layer_editor.model.get('selected_layer');
			this.addBaseLayer(this.selected_base_layer);
		},

		render: function(){
		},

		resize: function(){
		},

		resizeStop: function(){
		},

		toggleLayerEditor: function(){
			var $letc = $('.layer-editor-container', this.el);
			if (! $letc.hasClass('changing')){
				this.expandContractTabContainer({
					expand: ! $letc.hasClass('expanded'),
					tab_container: $letc,
					dimension: 'height'
				});
			}
		},

		expandContractTabContainer: function(opts){
			var _this = this;
			var expand = opts.expand;
			var $tc = opts.tab_container;
			var dim = opts.dimension;

			// Calculate how much to change dimension.
			var delta = parseInt($tc.css('max' + _s.capitalize(dim)), 10) - parseInt($tc.css('min' + _s.capitalize(dim)), 10);
			if (! expand){
				delta = -1 * delta;
			}

			// Animate field container dimension.
			$tc.addClass('changing');

			// Toggle button text
			var button_text = ($('button.toggle', $tc).html() == '\u25B2') ? '\u25BC' : '\u25B2';
			$('button.toggle', $tc).html(button_text);

			// Execute the animation.
			var fc_dim_opts = {};
			fc_dim_opts[dim] = parseInt($tc.css(dim),10) + delta;
			$tc.animate(
					fc_dim_opts,
					{
						complete: function(){
							$tc.removeClass('changing');

							if (expand){
								$tc.addClass('expanded')
							}
							else{
								$tc.removeClass('expanded')
								_this.resize();
								_this.resizeStop();
							}
						}
					}
			);
		},

		addDataLayer: function(layer){
			// Get index of last base layer.
			var last_base_idx = -1;
			_.each(this.layers.models, function(l, idx){
				if (l.get('layer_category') == 'base'){
					last_base_idx = idx;
				}
			}, this);

			// Add data layer after the base layer.
			this.layers.add(layer, {at: last_base_idx + 1});
		},

		addBaseLayer: function(layer){
			// Get index of last base layer.
			var last_base_idx = -1;
			_.each(this.layers.models, function(l, idx){
				if (l.get('layer_category') == 'base'){
					last_base_idx = idx;
				}
			}, this);

			// Add data layer after the base layer.
			this.layers.add(layer, {at: last_base_idx + 1});
			console.log("l, is", this.layers);
		},

		removeLayer: function(layer){
			this.layers.remove([layer]);
		},

		onReady: function(){
			this.map.trigger('ready');
		}
	});

	return MapEditorView;
});
		
