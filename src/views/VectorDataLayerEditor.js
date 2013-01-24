define([
       "jquery",
       "backbone",
       "underscore",
       "_s",
       "ui",
       "./layer_editor",
       "./color_scale_form",
       "../util/Colormap"
],
function($, Backbone, _, _s, ui, LayerEditorView, ColorScaleForms, Colormap){

  var VectorDataLayerEditorView = LayerEditorView.extend({

    initialize: function(){
      $(this.el).addClass('vector-data-layer-editor');
      LayerEditorView.prototype.initialize.call(this);
      this.postInitialize();
    },

    postInitialize: function(){
      this.model.on('change', this.chango, this);
    },

    chango: function(){
      var dataProp = this.model.get('dataProp');

      var colorMap = this.model.get('colorMap');

      var vMin = this.colorScaleForm.model.get('min');
      var vMax = this.colorScaleForm.model.get('max');

      // Generate color classes.
      var colorClasses = this.generateColorClasses({
        vMin: vMin,
        vMax: vMax,
        colorMap: colorMap
      });

      // Generate rules from color classes.
      var rules = this.colorClassesToRules([]);

      // Update model's styleMap.
      var styleModel = this.model.get('styleMap').get('default').set('rules', rules);
    },

    generateColorClasses: function(opts){
    },

    colorClassesToRules: function(colorClasses){
    },

    onDataChange: function(){
      // Set color scale min/max if auto.
    },

    renderFormElements: function(){
      LayerEditorView.prototype.renderFormElements.call(this);
      var scale_type = 'sequential';
      var scale_class;
      if (scale_type == 'sequential'){
        scale_class = ColorScaleForms.Sequential;
      }
      else if (scale_type == 'diverging'){
        scale_class = ColorScaleForms.Diverging;
      }
      this.colorScaleForm = new scale_class({
        model: new Backbone.Model()
      });
      this.$layer_form.append(this.colorScaleForm.el);

    },

    remove: function(){
      LayerEditorView.prototype.remove.call(this, arguments);
    }
  });

  return VectorDataLayerEditorView;
});








