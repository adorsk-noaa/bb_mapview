define([
	"jquery",
	"backbone",
	"underscore",
	"_s",
	"ui",
	"./layer_editor",
	"./color_scale_form"
		],
function($, Backbone, _, _s, ui, LayerEditorView, ColorScaleFormView){

	var DataLayerEditorView = LayerEditorView.extend({

		initialize: function(){
			$(this.el).addClass('data-layer-editor');
            _.each(['data_entity', 'geom_entity', 'grouping_entities'], function(entity_attr){
                entity_model = this.model.get(entity_attr);
                if (entity_model){
                    entity_model.on('change', function(){
                        this.model.trigger(_s.sprintf('change:%s' , entity_attr));
                    }, this);
                }
            }, this);
			LayerEditorView.prototype.initialize.call(this);
		},

		renderFormElements: function(){
			LayerEditorView.prototype.renderFormElements.call(this);

			this.color_scale_form = new ColorScaleFormView({
				model: this.model.get('data_entity')
			});

			this.$layer_form.append(this.color_scale_form.el);

		},

        remove: function(){
            this.color_scale_form.trigger('remove'); 
            LayerEditorView.prototype.remove.call(this, arguments);
        }
	});

	return DataLayerEditorView;
});
		






		
