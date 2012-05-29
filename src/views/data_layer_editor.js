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
			this.field = this.model.get('field');
			if (this.field){
				this.field.on('change', function(){this.model.trigger('change:field')}, this);
			}
			LayerEditorView.prototype.initialize.call(this);
		},

		renderFormElements: function(){
			LayerEditorView.prototype.renderFormElements.call(this);

			var color_scale_form = new ColorScaleFormView({
				model: this.field
			});

			this.$layer_form.append(color_scale_form.el);

		}
	});

	return DataLayerEditorView;
});
		






		
