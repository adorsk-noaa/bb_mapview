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
      this.model.on('change', this.updateStyleRules, this);
    },

    updateStyleRules: function(){
      var dataProp = this.model.get('dataProp');
      var colormap = this.model.get('colormap');
      var vmin = this.model.get('vmin') || -1;
      var vmax = this.model.get('vmax') || 1;

      // Generate color bins.
      var colorBins = Colormap.generateColoredBins({
        vmin: vmin,
        vmax: vmax,
        colormap: colormap,
        schema: 'hex'
      });

      // Add bins for values outside of bounds.
      var lastIdx = colorBins.length - 1;
      var minBin = [[null, colorBins[0][0][0]], colorBins[0][1]];
      var maxBin = [[colorBins[lastIdx][0][1], null], colorBins[lastIdx][1]];
      colorBins.unshift(minBin);
      colorBins.push(maxBin);

      // Generate rules from color classes.
      var rules = this.colorBinsToRules({
        colorBins: colorBins,
        prop: dataProp
      });

      // Update model's default styleMap.
      var defaultStyleMap = this.model.get('styleMap').get('default');
      if (! defaultStyleMap){
        this.model.get('styleMap').add(new Backbone.Model({
          id: 'default',
          rules: rules
        }));
      }
      else{
        defaultStyleMap.set('rules', rules);
      }
    },

    colorBinsToRules: function(opts){
      var colorBins = opts.colorBins;
      var prop = opts.prop;
      var rules = [];

      _.each(colorBins, function(colorBin){
        var bMin = colorBin[0][0];
        var bMax = colorBin[0][1];
        var color = colorBin[1];
        var filter = '';
        if (bMin == null && bMax != null){
          filter = _s.sprintf("%s < %s", prop, bMax);
        }
        else if ( bMin != null && bMax == null){
          filter = _s.sprintf("%s >= %s", prop, bMin);
        }
        else if ( bMin != null && bMax != null){
          filter = _s.sprintf("%s >= %s AND %s < %s", prop, bMin, prop, bMax);
        }

        if (filter){
          rule = {
            filter: filter,
            symbolizer: {
              fillColor: '#' + color
            }
          };
          rules.push(rule);
        }
      });
      return rules;
    },

    onDataChange: function(){
      // Set color scale min/max if auto.
    },

    renderFormElements: function(){
      LayerEditorView.prototype.renderFormElements.call(this);
      var scale_type = this.model.get('color_scale_type') || 'sequential';
      var scale_class;
      if (scale_type == 'sequential'){
        scale_class = ColorScaleForms.Sequential;
      }
      else if (scale_type == 'diverging'){
        scale_class = ColorScaleForms.Diverging;
      }
      this.colorScaleForm = new scale_class({
        model: this.model
      });
      this.$layer_form.append(this.colorScaleForm.el);

    },

    remove: function(){
      LayerEditorView.prototype.remove.call(this, arguments);
    }
  });

  return VectorDataLayerEditorView;
});








