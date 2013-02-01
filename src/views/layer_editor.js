define([
  "jquery",
  "backbone",
  "underscore",
  "_s",
  "ui",
  "./opacity_form", 
  "text!./templates/layer_editor.html"
],
function($, Backbone, _, _s, ui, OpacityFormView, template){

  var LayerEditorView = Backbone.View.extend({
    tag: 'table',

    initialize: function(options){
      $(this.el).addClass('layer-editor');
      this.initialRender();

      this.on('remove', this.remove, this);
    },

    initialRender: function(){
      $(this.el).html(_.template(template, {model: this.model}));
      this.$title = $('.layer-editor-title', this.el);
      this.$body = $('.layer-editor-body', this.el);
      this.$layer_form = $('.layer-form', this.$body);

      // Add info if model has info.
      var info = this.formatter(this.model.get('info'));
      if (info){
        var $info = $('<div class="layer-info"></div>');
        $info.html(info);
        this.$body.prepend($info);
      }

      this.renderFormElements();
    },

    formatter: function(s){
      return s;
    },

    renderFormElements: function(){
      this.opacity_form = new OpacityFormView({
        model: this.model
      });
      this.$layer_form.append(this.opacity_form.el);
    },

    remove: function(){
      Backbone.View.prototype.remove.apply(this, arguments);
      this.opacity_form.trigger('remove');
      this.model.trigger('remove');
      this.model.off();
      this.off();
    }

  });

  return LayerEditorView;
});

