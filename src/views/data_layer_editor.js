define([
	"jquery",
	"use!backbone",
	"use!underscore",
	"_s",
	"use!ui",
	"./layer_editor",
	"./color_scale_form"
		],
function($, Backbone, _, _s, ui, LayerEditorView, ColorScaleFormView){

	var DataLayerEditorView = LayerEditorView.extend({

		initialize: function(){
			$(this.el).addClass('data-layer-editor');
			this.entity = this.model.get('entity');
			if (this.entity){
				this.entity.on('change', function(){this.model.trigger('change:entity')}, this);
			}
			LayerEditorView.prototype.initialize.call(this);
		},

		renderFormElements: function(){
			LayerEditorView.prototype.renderFormElements.call(this);

			var color_scale_form = new ColorScaleFormView({
				model: this.entity
			});

			this.$layer_form.append(color_scale_form.el);

		}
	});

	return DataLayerEditorView;
});
		






		
