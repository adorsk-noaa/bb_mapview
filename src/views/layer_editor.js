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
			'click .layer-editor-header .title': 'toggleLayerForm',
			'change .disabled-toggle': 'onDisabledToggleChange'
		},

		initialize: function(options){
			$(this.el).addClass('layer-editor');
			this.initialRender();
			this.setDisabled();

			this.model.on('change:disabled', this.setDisabled, this);
            this.on('remove', this.remove, this);
		},

		initialRender: function(){
			$(this.el).html(_.template(template, {model: this.model}));
			this.$body = $('.layer-editor-body', this.el);
			this.$arrow = $('.layer-editor-header .title .arrow', this.el);
			this.$disabled_toggle = $('.disabled-toggle-cb', this.el);
			this.$layer_form = $('.layer-form', this.el);

            // Add info if model has info.
            var info = this.model.get('info');
            if (info){
                var $info = $('.info-container > .info-button', this.el);
                $('> .content', $info).html(info);
                $info.removeClass('disabled');
            }

            // Add drag handle if layer is reordable.
            if (this.model.get('reorderable')){
                var $dh = $('.drag-handle-container > .layer-editor-drag-handle', this.el);
                $dh.removeClass('disabled');
            }

			this.renderFormElements();
		},

		renderFormElements: function(){
			this.opacity_form = new OpacityFormView({
				model: this.model
			});

			this.$layer_form.append(this.opacity_form.el);

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

			this.$disabled_toggle.attr('checked', ! this.model.get('disabled'));
		},
		
		onDisabledToggleChange: function(e){
			this.model.set('disabled', ! this.$disabled_toggle.is(':checked'));
		},

        remove: function(){
	        Backbone.View.prototype.remove.apply(this, arguments);
            this.opacity_form.trigger('remove');
            this.model.trigger('remove');
            this.model.off();
            this.off();
        }

	});

	return LayerEditorView;
});
		
