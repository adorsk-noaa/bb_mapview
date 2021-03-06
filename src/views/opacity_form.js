define([
    "jquery",
    "backbone",
    "underscore",
    "_s",
    "ui",
    "./layer_option_form"
    ],
    function($, Backbone, _, _s, ui, LayerOptionFormView){

      var OpacityFormView = LayerOptionFormView.extend({
        initialize: function(options){
          options.label = 'Opacity';
          LayerOptionFormView.prototype.initialize.apply(this, arguments);
          $(this.el).addClass('opacity-form');

          if (! this.model.get('properties')){
            this.model.set('properties', new Backbone.Model())
          }

          this.initialRender();
        },

      initialRender: function(){
        LayerOptionFormView.prototype.initialRender.apply(this, arguments);
        this.$slider = $('<div class="slider"></div>').appendTo(this.$body);
        var _this = this;
        var initial_opacity = (this.model.get('properties').get('opacity') != null) ? (this.model.get('properties').get('opacity') + 0) * 100 : 100;
        this.$slider.slider({
          min: 10,
          max: 100,
          value: initial_opacity,
          slide: function(e, ui){
            _this.model.get('properties').set('opacity', ui.value/100);
          }
        });
      },
      });

      return OpacityFormView;
    });

