define([
  "jquery",
  "backbone",
  "underscore",
  "_s",
  "ui"
],
function($, Backbone, _, _s, ui){

  var LayerOptionFormView = Backbone.View.extend({
    initialize: function(options){
      this.options = $.extend({
        label: null
      }, options);
      $(this.el).addClass('layer-option-form');
      this.on('remove', this.remove, this);
    },

    initialRender: function(){
      this.$fieldset = $('<fieldset></fieldset>').appendTo(this.el);
      if (this.options.label){
        this.$label = $('<legend></legend>').appendTo(this.$fieldset);
        this.$label.html(this.options.label);
      }
      this.$body = $('<div class="body"></div>').appendTo(this.$fieldset);
    },

    postInitialize: function(options){
    },

    remove: function(){
      Backbone.View.prototype.remove.call(this, arguments);
      this.model.trigger('remove');
      this.model.off();
      this.off();
    }
  });

  return LayerOptionFormView;
});
