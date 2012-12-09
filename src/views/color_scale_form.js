define([
	"jquery",
	"backbone",
	"underscore",
	"_s",
	"ui",
	"text!./templates/color_scale_form.html"
		],
function($, Backbone, _, _s, ui, template){

  // @TODO: make a base class for layer option forms,
  // to share logic w/ opacity-form,
  // but not right now.
	var ColorScaleFormView = Backbone.View.extend({

		events: {
			'change input.minmax': 'onMinMaxChange'
		},

		initialize: function(options){
			$(this.el).addClass('layer-option-form color-scale-form');
			this.initialRender();

            this.on('remove', this.remove, this);
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
		},

        remove: function(){
            Backbone.View.prototype.remove.call(this, arguments);
            this.model.trigger('remove');
            this.model.off();
            this.off();
        }

	});

	return ColorScaleFormView;
});
		
