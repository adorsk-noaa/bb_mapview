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
			'change .visibility-toggle-cb' : 'onVisibilityToggleChange'
		},

		initialize: function(options){
			$(this.el).addClass('layer-editor');
			this.initialRender();

			this.setVisibilityToggle();
		},

		initialRender: function(){
			$(this.el).html(_.template(template, {model: this.model}));

			this.$layer_form = $('.layer-form', this.el);

			this.renderFormElements();
		},

		resize: function(){
		},

		resizeStop: function(){
		},

		renderFormElements: function(){
			opacity_form = new OpacityFormView({
				model: this.model
			});

			this.$layer_form.append(opacity_form.el);

		},

		onVisibilityToggleChange: function(){
			var is_disabled =  $('.visibility-toggle-cb', this.el).is(':checked');
			this.model.set('disabled', is_disabled);
			$(this.el).toggleClass('disabled');
		},

		setVisibilityToggle: function(){
			var $visibility_cb =  $('.visibility-toggle-cb', this.el);
			$visibility_cb.attr('checked', ! this.model.get('disabled'));
		},

		toggleLayerForm: function(){
			$body = $('.body', this.el);
			if ($body.is(':hidden')){
				$body.slideDown('slow');
			}
			else{
				$body.slideUp('slow');
			}
		},

		expandContractContainer: function(opts){
			var _this = this;
			var expand = opts.expand;
			var $c = opts.container;
			var dim = opts.dimension;

			// Calculate how much to change dimension.
			var delta = parseInt($c.css('max' + _s.capitalize(dim)), 10) - parseInt($c.css('min' + _s.capitalize(dim)), 10);
			if (! expand){
				delta = -1 * delta;
			}

			// Animate field container dimension.
			$c.addClass('changing');

			// Toggle button text
			var button_text = ($('button.toggle', $c).html() == '\u25B2') ? '\u25BC' : '\u25B2';
			$('button.toggle', $c).html(button_text);

			// Execute the animation.
			var dim_opts = {};
			dim_opts[dim] = parseInt($c.css(dim),10) + delta;
			$c.animate(
					dim_opts,
					{
						complete: function(){
							$c.removeClass('changing');

							if (expand){
								$c.addClass('expanded')
							}
							else{
								$c.removeClass('expanded')
								_this.resize();
								_this.resizeStop();
							}
						}
					}
			);
		}

	});

	return LayerEditorView;
});
		
