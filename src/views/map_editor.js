define([
	"jquery",
	"use!backbone",
	"use!underscore",
	"_s",
	"use!ui",
	"text!./templates/map_editor.html"
		],
function($, Backbone, _, _s, ui, template){

	var MapEditorView = Backbone.View.extend({

		initialize: function(options){
			$(this.el).addClass('map-editor');
			this.initialRender();
		},

		initialRender: function(){
			$(this.el).html(_.template(template));
		},

		render: function(){
		}
	});

	return MapEditorView;
});
		
