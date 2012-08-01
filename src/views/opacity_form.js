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
            this.on('remove', this.remove, this);
		},

		initialRender: function(){
			$(this.el).html(_.template(template, {model: this.model}));
			this.$slider = $('.slider', this.el);

			var _this = this;
			var initial_opacity = (this.model.get('opacity') != null) ? (this.model.get('opacity') + 0) * 100 : 100;
			this.$slider.slider({
				min: 10,
				max: 100,
				value: initial_opacity,
				slide: function(e, ui){
					_this.model.set('opacity', ui.value/100);
				}
			});
		},

        remove: function(){
            Backbone.View.prototype.remove.call(this, arguments);
            this.model.trigger('remove');
            this.model.off();
            this.off();
        }

	});

	return OpacityFormView;
});
		
