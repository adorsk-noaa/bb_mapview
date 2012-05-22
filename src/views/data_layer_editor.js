define([
	"jquery",
	"use!backbone",
	"use!underscore",
	"_s",
	"use!ui",
	"./data_layer_form",
	"text!./templates/data_layer_editor.html"
		],
function($, Backbone, _, _s, ui, DataLayerFormView, template){

	var DataLayerEditorView = Backbone.View.extend({

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
			this.clearLayerDefinitions();
			$(this.el).html(_.template(template));
			_.each(this.model.get('layer_definitions'), function(layer_definition){
				this.addLayerDefinition(layer_definition);
			}, this);
		},

		addLayerDefinition: function(definition){
			if (! this.layerRegistry.hasOwnProperty(definition['layer_id'])){

				var option = $(_s.sprintf('<option value="%s">%s</option>', definition['layer_id'], definition['label']));
				$('.layer-select', this.el).append(option);

				var model = new Backbone.Model(definition);
				var view = this.getLayerView(model);
				$('.layer-options', this.el).append(view.el);

				this.layerRegistry[definition['layer_id']] = {
					'layer_id': definition['layer_id'],
					'option': option,
					'model': model,
					'view': view
				};
			}
		},

		removeLayerDefinition: function(definition){
			if (this.layerRegistry.hasOwnProperty(definition['layer_id'])){
				layer = this.layerRegistry[definition['layer_id']];
				layer.option.remove();
				layer.view.remove();
				layer.model = null;
				delete this.layerRegistry[definition['layer_id']];
				layer = null;
			}
		},

		clearLayerDefinitions: function(){
			_.each(this.layerRegistry, function(layer){
				this.removeLayerDefinition({layer_id: layer.get('layer_id')});
			}, this);
		},

		getLayerView: function(model){
			var layer_type = model.get('layer_type');

			var viewClass = DataLayerFormView;

			return new viewClass({
				model: model
			});
		},

		onLayerSelectChange: function(e){
			if (this.model.get('selected_layer')){
				var previously_selected_id = this.model.get('selected_layer').get('layer_id');
				$(this.layerRegistry[previously_selected_id].view.el).removeClass('selected');
			}
			var selected_id = $('.layer-select option:selected', this.el).val();
			var selected_view = this.layerRegistry[selected_id].view;
			$(selected_view.el).addClass('selected');
			this.model.set({'selected_layer': this.layerRegistry[selected_id].model});
		},

		setSelectedLayer: function(layer_id){
			$('.layer-select', this.el).val(layer_id).change();
		}

	});

	return DataLayerEditorView;
});
		






		
