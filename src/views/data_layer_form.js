define([
	"jquery",
	"use!backbone",
	"use!underscore",
	"use!ui",
	"_s",
	"text!./templates/data_form_view.html",
		],
function($, Backbone, _, ui, _s, template){

	var DataLayerFormView = Backbone.View.extend({

		events: {
			'change .minmax input[type="text"]': 'onMinMaxTextChange',
		},

		initialize: function(opts){
			$(this.el).addClass('layer-form data-layer-form');
			this.template = template;
			this.render();

			// Set initial properties on inputs.
			_.each(['min', 'max'], function(minmax){
				this.setMinMaxText(minmax);
			},this);


			this.model.on('change:min', function(){this.setMinMaxText('min')}, this);
			this.model.on('change:max', function(){this.setMinMaxText('max')}, this);
		},

		render: function(){
			$(this.el).html(_.template(this.template, {model: this.model}));
		},

		onMinMaxTextChange: function(e){
			var minmax = $(e.target).data('minmax');
			var raw_val = this.getMinMaxElements(minmax).$text.val();
			var val = parseFloat(raw_val);
			this.model.set(minmax, val);
		},

		setMinMaxText: function(minmax){
			var minmax_els = this.getMinMaxElements(minmax);
			minmax_els.$text.val(this.model.get(minmax));
		},

		getMinMaxElements: function(minmax){
			var $minmax_el = $('.' + minmax, this.el);
			var $t = $('input[type="text"]', $minmax_el);
			return {
				$text: $t
			};
		},

	});

	return DataLayerFormView;
});
		
