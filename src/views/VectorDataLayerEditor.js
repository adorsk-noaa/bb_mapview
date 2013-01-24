define([
       "jquery",
       "backbone",
       "underscore",
       "_s",
       "ui",
       "./layer_editor",
       "./color_scale_form"
],
function($, Backbone, _, _s, ui, LayerEditorView, ColorScaleForms){

  var VectorDataLayerEditorView = LayerEditorView.extend({

    initialize: function(){
      $(this.el).addClass('vector-data-layer-editor');
      LayerEditorView.prototype.initialize.call(this);
    },

    renderFormElements: function(){
      LayerEditorView.prototype.renderFormElements.call(this);
    },

    remove: function(){
      LayerEditorView.prototype.remove.call(this, arguments);
    }
  });

  return VectorDataLayerEditorView;
});








