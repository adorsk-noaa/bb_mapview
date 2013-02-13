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
  "Util/views/MinMaxForm",
  "Util/views/PlusMinusForm",
],
function($, Backbone, _, _s, ui, LayerOptionFormView, sequential_template, diverging_template, Colormap, MinMaxFormView, PlusMinusFormView){
  var label = 'Color Scale';
  var css_class = 'color-scale-form';

  var ColorScaleFormView = LayerOptionFormView.extend({
    initialize: function(options){
      options.label = 'Color Scale';
      LayerOptionFormView.prototype.initialize.apply(this, arguments);
      $(this.el).addClass([css_class].concat(this.css_classes).join(' '));

      this.formatter = options.formatter || _s.sprintf;
      this.format = options.format || '%.3e';

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
        },
        formatter: this.formatter,
      });
    },
  });

  var DivergingColorScaleFormView = ColorScaleFormView.extend({
    input_attrs: ['vmid', 'vr'],
    css_classes: ['diverging'],
    renderBody: function(){
      return (_.template(diverging_template, {view: this}));
    },
    initialize: function(options){
      ColorScaleFormView.prototype.initialize.apply(this, arguments);
      if (typeof this.model.get('vmid') == 'undefined'){
        this.model.set('vmid', 0);
      }
      if (typeof this.model.get('vr') == 'undefined'){
        this.model.set('vr', 1);
      }
    },
    postInitialize: function(){
      ColorScaleFormView.prototype.postInitialize.apply(this, arguments);
      this.labels = {};
      _.each(['vmin', 'vmax'], function(vminmax){
        this.labels[vminmax] = $('.' + vminmax + '-label', this.el);
      }, this);

      this.$vminLabel = ''
      this.plusMinusForm = new PlusMinusFormView({
        el: this.el,
        model: this.model,
        attrs: {
          mid: 'vmid',
          r: 'vr',
          rAuto: 'vrAuto',
        },
        selectors:{
          mid: '.vmid-text',
          r: '.vr-text',
          rAuto: '.vr-auto-cb',
        },
        formatter: this.formatter,
      });
      this.model.on('change:vmid change:vr', _.throttle(this.setVMinMax, 100), this);
      this.setVMinMax();
    },
    setVMinMax: function(){
      var vmid = this.model.get('vmid');
      var vr = this.model.get('vr');
      if (vmid != null && vr != null){
        this.model.set({
          vmin: vmid - vr,
          vmax: vmid + vr,
        });
        _.each(this.labels, function($label, vminmax){
          var formattedMinMax = this.formatter(this.format, this.model.get(vminmax));
          $label.html(formattedMinMax);
        }, this);
      }
    }
  });

  return {
    Sequential: SequentialColorScaleFormView,
    Diverging: DivergingColorScaleFormView
  }
});

