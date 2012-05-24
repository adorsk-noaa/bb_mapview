define([
	"jquery",
	"use!backbone",
	"use!underscore",
	"_s",
	"use!ui",
	"text!./templates/layer_editor.html"
		],
function($, Backbone, _, _s, ui, template){

	var LayerEditorView = Backbone.View.extend({

		events: {
		},

		initialize: function(options){
			$(this.el).addClass('layer-editor');
			this.initialRender();
		},

		initialRender: function(){
			$(this.el).html(_.template(template, this.model));
		},

		toggleLayerForm: function(){
			var $lefc = $(this.el).children('.body');
			if (! $lefc.hasClass('changing')){
				this.expandContractTabContainer({
					expand: ! $lefc.hasClass('expanded'),
					container: $lefc,
					dimension: 'height'
				});
			}
		},

		expandContractLayerForm: function(opts){
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
		
