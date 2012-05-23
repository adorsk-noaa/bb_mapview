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
			this.layerRegistry = {};
			this.initialRender();
			this.render();
		},

		initialRender: function(){
		},

		render: function(){
			this.clearLayers();
			$(this.el).html(_.template(template));

			_.each(this.model.get('layers').models, function(layer){
				this.addLayer(layer);
			}, this);

		},

		postInitialize: function(){
		},

		addLayer: function(layer){
			if (! this.layerRegistry.hasOwnProperty(layer.cid)){

				var option = $(_s.sprintf('<option value="%s">%s</option>', layer.cid, layer.get('name')));
				$('.layer-select', this.el).append(option);

				var view = this.getLayerFormView(layer);
				$('.layer-options', this.el).append(view.el);

				this.layerRegistry[layer.cid] = {
					'option': option,
					'model': layer,
					'view': view
				};
			}
		},

		removeLayer: function(layer){
			if (this.layerRegistry.hasOwnProperty(layer.cid)){
				layer_record = this.layerRegistry[layer.cid];
				layer_record.option.remove();
				layer_record.view.remove();
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
				render: function(){$(this.el).html(this.model.get('name'));}
			});
			return new SimpleLayerFormView({
				model: layer
			});
		}

	});

	return OverlayLayerEditorView;
});
		






		
