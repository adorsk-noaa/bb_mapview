define([
  "jquery",
  "backbone",
  "underscore",
  "_s",
  "ui",
  "./layer_option_form",
  "text!./templates/sequential_color_scale_form.html",
  "text!./templates/diverging_color_scale_form.html"
],
function($, Backbone, _, _s, ui, LayerOptionFormView, sequential_template, diverging_template){
  var label = 'Color Scale';
  var css_class = 'color-scale-form';

  var ColorScaleFormView = LayerOptionFormView.extend({
    events: {
      'change input': 'onInputChange'
    },
    initialize: function(options){
      options.label = 'Color Scale';
      LayerOptionFormView.prototype.initialize.apply(this, arguments);
      $(this.el).addClass([css_class].concat(this.css_classes).join(' '));
      this.initialRender();
      this.postInitialize();
    },

    initialRender: function(){
      LayerOptionFormView.prototype.initialRender.apply(this, arguments);
      this.$body.html(this.renderBody());
      _.each(this.input_attrs, function(attr){
        this.setInput(attr);
      }, this);
      if (this.model.get('colorbar_url')){
        this.setColorbarUrl();
      }
    },

    postInitialize: function(){
      this.model.on('change:colorbar_url', this.setColorbarUrl, this);
    },

    onInputChange: function(e){
      var $input = $(e.currentTarget);
      var attr = $input.data('attr');
      var value = parseFloat($input.val());
      this.model.set(attr, value);
    },

    setInput: function(attr){
      var $input = $(_s.sprintf('input.%s', attr), this.el);
      $input.val(this.model.get(attr));
    },

    setColorbarUrl: function(attr){
      $('.slider', this.el).css(
        'background-image', 
        'url(' + this.model.get('colorbar_url') + ')'
      );
    }
  });

  var SequentialColorScaleFormView = ColorScaleFormView.extend({
    input_attrs: ['vmin', 'vmax'],
    css_classes: ['sequential'],
    renderBody: function(){
      return (_.template(sequential_template, {model: this.model}));
    }
  });

  var DivergingColorScaleFormView = ColorScaleFormView.extend({
    input_attrs: ['vmiddle', 'vradius'],
    css_classes: ['diverging'],
    renderBody: function(){
      return (_.template(diverging_template, {model: this.model}));
    },
    postInitialize: function(){
      ColorScaleFormView.prototype.postInitialize.apply(this, arguments);
      this.model.on('change:vmiddle', this.setVminVmax, this);
    },
    setVminVmax: function(){
      var vmiddle = this.model.get('vmiddle');
      var vradius = this.model.get('vradius');
      if (vmiddle != null && vradius != null){
        this.model.set({
          vmin: vmiddle - vradius,
          vmax: vmiddle + vradius
        });
      }
    }
  });

  return {
    Sequential: SequentialColorScaleFormView,
    Diverging: DivergingColorScaleFormView
  }
});

