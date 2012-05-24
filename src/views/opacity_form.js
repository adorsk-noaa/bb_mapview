define([
	"jquery",
	"use!backbone",
	"use!underscore",
	"_s",
	"use!ui",
	"text!./templates/opacity_form.html"
		],
function($, Backbone, _, _s, ui, template){

	var OpacityFormView = Backbone.View.extend({

		events: {
		},

		initialize: function(options){
			$(this.el).addClass('opacity-form');
			this.initialRender();
		},

		initialRender: function(){
			$(this.el).html(_.template(template, {model: this.model}));
			this.$slider = $('.slider', this.el);

			var _this = this;
			this.$slider.slider({
				min: 10,
				max: 100,
				value: (this.model.get('opacity') + 0) * 100 || 10, 
				slide: function(e, ui){
					_this.model.set('opacity', ui.value/100);
				}
			});
		}

	});

	return OpacityFormView;
});
		
