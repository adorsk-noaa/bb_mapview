define([
	"jquery",
	"use!backbone",
	"use!underscore",
	"text!./templates/mapview.html",
		],
function($, Backbone, _, template){

	var MapViewView = Backbone.View.extend({

		initialize: function(){
						console.log('yo');
			this.render();
		},

		render: function(){
			rendered_html = _.template(template);
			$(this.el).html(rendered_html);
		}
	});

	return MapViewView
});
		
