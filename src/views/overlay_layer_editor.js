define([
	"jquery",
	"use!backbone",
	"use!underscore",
	"_s",
	"use!ui",
	"text!./templates/overlay_layer_editor.html"
		],
function($, Backbone, _, _s, ui, template){

	var OverlayLayerEditorView = Backbone.View.extend({

		events: {
		},

		initialize: function(){

			this.layers = this.model.get('layers');
			this.layers.on('change', function(){this.model.trigger('change:layers')}, this);

			// Keep layers sorted by category index.
			this.layers.comparator = function(layer){
				return layer.get('category_index');
			};

			this.layerRegistry = {};
			this.initialRender();
			this.render();
		},

		initialRender: function(){
		},

		render: function(){
			this.clearLayers();
			$(this.el).html(_.template(template));


			var _this = this;
			this.$layers = $('.layers', this.el);
			this.$layers.sortable({
				containment: $('.layers-container', this.el),
				scroll: false,
				placeholder: "ui-state-highlight",
				stop: function(e, ui){
					_this.onSortStop.call(_this, e, ui);
				}
			});
	
			_.each(this.layers.models, function(layer){
				this.addLayer(layer);
			}, this);

		},

		postInitialize: function(){
		},

		onSortStop: function(e, ui){
			var ordered_cids = this.$layers.sortable('toArray');
			_.each(ordered_cids, function(cid, idx){
				this.layerRegistry[cid].model.set('category_index', idx);
			}, this);
			this.layers.sort();
		},

		addLayer: function(layer){
			if (! this.layerRegistry.hasOwnProperty(layer.cid)){

				var option = $(_s.sprintf('<option value="%s">%s</option>', layer.cid, layer.get('name')));
				$('.layer-select', this.el).append(option);

				var view = this.getLayerFormView(layer);
				var $sortable = $(_s.sprintf('<li id="%s" class="layer-container"></li>', layer.cid));
				$sortable.append(view.el);

				this.$layers.append($sortable);

				this.$layers.sortable('refresh');

				this.layerRegistry[layer.cid] = {
					'sortable': $sortable,
					'model': layer,
					'view': view
				};

				this.onSortStop();

			}
		},

		removeLayer: function(layer){
			if (this.layerRegistry.hasOwnProperty(layer.cid)){
				layer_record = this.layerRegistry[layer.cid];
				layer_record.sortable.remove();
				layer_record.view.remove();
				this.$layers.sortable('refresh');
				this.onSortStop();
				delete this.layerRegistry[layer.cid];
			}
		},

		clearLayers: function(){
			_.each(this.layerRegistry, function(layer_record){
				this.removeLayer(layer_record.model)
			}, this);
		},

		getLayerFormView: function(layer){

			var SimpleLayerFormView = Backbone.View.extend({
				initialize: function(){this.render()},
				render: function(){
					$(this.el).html(this.model.get('name') + ',' + this.model.get('disabled'));
				}
			});
			return new SimpleLayerFormView({
				model: layer
			});
		}

	});

	return OverlayLayerEditorView;
});
		






		
