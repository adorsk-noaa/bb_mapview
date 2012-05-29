define([
	"jquery",
	"use!backbone",
	"use!underscore",
	"_s",
	"use!ui",
	"text!./templates/color_scale_form.html"
		],
function($, Backbone, _, _s, ui, template){

	var ColorScaleFormView = Backbone.View.extend({

		events: {
			'change input.minmax': 'onMinMaxChange'
		},

		initialize: function(options){
			$(this.el).addClass('color-scale-form');
			this.initialRender();
		},

		initialRender: function(){
			$(this.el).html(_.template(template, {model: this.model}));
			_.each(['min', 'max'], function(minmax){
				this.setMinMax(minmax);
			}, this);
		},
		
		onMinMaxChange: function(e){
			var $input = $(e.currentTarget);
			var minmax = $input.data('minmax');					
			var value = parseFloat($input.val());
			this.model.set(minmax, value);
		},

		setMinMax: function(minmax){
			var $input = $(_s.sprintf('input.%s', minmax), this.el);
			$input.val(this.model.get(minmax));
		}

	});

	return ColorScaleFormView;
});
		
