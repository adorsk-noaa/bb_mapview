define([
	"jquery",
	"use!backbone",
	"use!underscore",
	"_s",
	"use!ui",
	"./opacity_form", 
	"text!./templates/layer_editor.html"
		],
function($, Backbone, _, _s, ui, OpacityFormView, template){

	var LayerEditorView = Backbone.View.extend({

		events: {
			'click .header .title': 'toggleLayerForm',
		},

		initialize: function(options){
			$(this.el).addClass('layer-editor');
			this.initialRender();
			this.setDisabled();

			this.model.on('change:disabled', this.setDisabled, this);
		},

		initialRender: function(){
			$(this.el).html(_.template(template, {model: this.model}));
			this.$body = $('.body', this.el);
			this.$arrow = $('.header .title .arrow', this.el);

			this.$layer_form = $('.layer-form', this.el);

			this.renderFormElements();
		},

		renderFormElements: function(){
			opacity_form = new OpacityFormView({
				model: this.model
			});

			this.$layer_form.append(opacity_form.el);

		},

		toggleLayerForm: function(e){
			var arrow_text;
			if (this.$body.is(':hidden')){
				this.$body.slideDown();
				arrow_text = '\u25B2';
			}
			else{
				this.$body.slideUp();
				arrow_text = '\u25BC';
			}

			this.$arrow.html(arrow_text);
		},

		setDisabled: function(){
			if (this.model.get('disabled')){
				$(this.el).addClass('disabled');
				if (! this.$body.is(':hidden')){
					this.toggleLayerForm();
				}
			}
			else{
				$(this.el).removeClass('disabled');
			}
		},


	});

	return LayerEditorView;
});
		
