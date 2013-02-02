define([
  "jquery",
  "backbone",
  "underscore",
  "_s",
  "ui",
  "./layer_option_form",
  "text!./templates/sequential_color_scale_form.html",
  "text!./templates/diverging_color_scale_form.html",
  "../util/Colormap",
  "Util/views/MinMaxForm"
],
function($, Backbone, _, _s, ui, LayerOptionFormView, sequential_template, diverging_template, Colormap, MinMaxFormView){
  var label = 'Color Scale';
  var css_class = 'color-scale-form';

  var ColorScaleFormView = LayerOptionFormView.extend({
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
      this.$cbContainer = $('.slider', this.el);
    },

    postInitialize: function(){
      this.model.on('change:colormap', this.updateColorBar, this);
      this.updateColorBar();
    },

    updateColorBar: function(){
      var colormap = this.model.get('colormap');
      var $cb = Colormap.generateColorBarDiv({
        colormap: colormap
      });
      this.$cbContainer.empty();
      this.$cbContainer.append($cb);
    },
  });

  var SequentialColorScaleFormView = ColorScaleFormView.extend({
    input_attrs: ['vmin', 'vmax'],
    css_classes: ['sequential'],
    renderBody: function(){
      return (_.template(sequential_template, {view: this}));
    },
    postInitialize: function(){
      ColorScaleFormView.prototype.postInitialize.apply(this, arguments);
      this.minMaxForm = new MinMaxFormView({
        el: this.el,
        model: this.model,
        attrs: {
          min: 'vmin',
          max: 'vmax',
          minAuto: 'vminAuto',
          maxAuto: 'vmaxAuto',
        },
        selectors:{
          min: '.vmin input[type="text"]',
          minAuto: '.vmin input[type="checkbox"]',
          max: '.vmax input[type="text"]',
          maxAuto: '.vmax input[type="checkbox"]',
        }
      });
    },
  });

  var DivergingColorScaleFormView = ColorScaleFormView.extend({
    input_attrs: ['vmiddle', 'vradius'],
    css_classes: ['diverging'],
    renderBody: function(){
      return (_.template(diverging_template, {view: this}));
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

