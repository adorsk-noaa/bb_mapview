define([
	"jquery",
	"use!backbone",
	"use!underscore",
	"_s",
	"use!ui",
	"text!./templates/base_layer_editor.html"
		],
function($, Backbone, _, _s, ui, template){

	var BaseLayerEditorView = Backbone.View.extend({

		events: {
			'change .layer-select': 'onLayerSelectChange'
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
			if (this.model.get('layers').length > 0){
				this.setSelectedLayer(this.model.get('layers').at(0));
			}
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
		},

		onLayerSelectChange: function(e){
			if (this.model.get('selected_layer')){
				var previously_selected_cid = this.model.get('selected_layer').cid;
				$(this.layerRegistry[previously_selected_cid].view.el).removeClass('selected');
			}
			var selected_cid = $('.layer-select option:selected', this.el).val();
			var selected_view = this.layerRegistry[selected_cid].view;
			$(selected_view.el).addClass('selected');
			this.model.set({'selected_layer': this.layerRegistry[selected_cid].model});
		},

		setSelectedLayer: function(layer){
			$('.layer-select', this.el).val(layer.cid).change();
			this.onLayerSelectChange();
		}

	});

	return BaseLayerEditorView;
});
		






		
