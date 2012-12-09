define([
    "jquery",
    "backbone",
    "underscore",
    "_s",
    "ui",
    "./layer_option_form",
    "text!./templates/mono_color_scale_form.html",
    "text!./templates/bi_color_scale_form.html"
    ],
    function($, Backbone, _, _s, ui, LayerOptionFormView, mono_template, bi_template){
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
        },

        initialRender: function(){
          LayerOptionFormView.prototype.initialRender.apply(this, arguments);
          this.$body.html(this.renderBody());
          _.each(this.input_attrs, function(attr){
            this.setInput(attr);
          }, this);
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
        }
      });

      var MonoColorScaleFormView = ColorScaleFormView.extend({
        input_attrs: ['min', 'max'],
        css_classes: ['mono'],
        renderBody: function(){
          return (_.template(mono_template, {model: this.model}));
        }
      });

      var BiColorScaleFormView = ColorScaleFormView.extend({
        input_attrs: ['center', 'radius'],
        css_classes: ['bi'],
        renderBody: function(){
          return (_.template(bi_template, {model: this.model}));
        }
      });

      return {
        Mono: MonoColorScaleFormView,
        Bi: BiColorScaleFormView
      }
    });

