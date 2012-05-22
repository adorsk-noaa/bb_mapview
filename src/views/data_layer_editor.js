define([
	"jquery",
	"use!backbone",
	"use!underscore",
	"_s",
	"use!ui",
	"text!./templates/data_layer_editor.html"
		],
function($, Backbone, _, _s, ui, template){

	var DataLayerEditorView = Backbone.View.extend({

		initialize: function(){
			this.initialRender();
		},

		initialRender: function(){
			$(this.el).html(_.template(template));
		}
	});

	return DataLayerEditorView;
});
		
