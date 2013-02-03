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

      if (! this.model.get('features')){
        this.model.set('features', new Backbone.Collection());
      }

      if (! this.model.get('colormap')){
        var colormapId = this.model.get('colormapId');
        if (! colormapId){
          colormapId = 'ColorBrewer:PiG';
        }
        this.model.set('colormap', Colormap.COLORMAPS[colormapId]);
      }

      if (! this.model.get('styleMap')){
        this.model.set('styleMap', new Backbone.Collection());
      }

      LayerEditorView.prototype.initialize.call(this);
      this.postInitialize();
    },

    postInitialize: function(){
      // Listen for style changes.
      this.model.on('change', function(){
        var attrs = ['dataProp', 'colormap', 'vmin', 'vmax'];
        var changed = false;
        for (var i = 0; i < attrs.length; i++){
          var attr = attrs[i];
          var attrChanged = this.model.changed[attr];
          if (typeof attrChanged != 'undefined'){
            changed = true;
          }
        }
        if (changed){
          this.updateStyleRules();
        }
      }, this);

      // Listen for changes to auto attributes.
      var scaleType = this.model.get('scale_type');
      if (scaleType == 'diverging'){
        this.model.on('change:vrAuto', this.updateVr, this);
      }
      else if (scaleType == 'sequential'){
        _.each(['min', 'max'], function(minmax){
          this.model.on('change:v' + minmax+ 'Auto', function(model, value){
            if (value){
              this.updateVMinMax(minmax);
            }
          }, this);
        }, this);
      }

      // Listen for property changes, and throttle changes.
      // Otherwise mass updates of features will trigger a lot of
      // unecessary computation.
      this._onPropertiesChange = _.bind(function(){
        this.onPropertiesChange();
        this.onPropertiesChangeTimer = null;
      }, this);
      this.model.get('features').on('change:properties', function(){
        var _this = this;
        if (this._onPropertiesChangeTimer){
          clearTimeout(this._onPropertiesChangeTimer);
        }
        this._onPropertiesChangeTimer = setTimeout(
          this._onPropertiesChange, 50);
      }, this);

      this.updateStyleRules();
    },

    updateVr: function(){
      var minMaxValues = {};
      var minmaxAttrs = ['min', 'max'];
      for (var i in minmaxAttrs){
        var minmax = minmaxAttrs[i];
        var value = this.getVMinMax(minmax);
        if (! $.isNumeric(value)){
          return;
        }
        minMaxValues[minmax] = this.getVMinMax(minmax);
      }

      var vmid = this.model.get('vmid');
      if (! $.isNumeric(vmid)){
        return;
      }
      var minDist = Math.abs(minMaxValues.min - vmid);
      var maxDist = Math.abs(minMaxValues.max - vmid);
      var dist = Math.max(minDist, maxDist);
      this.model.set('vr', dist);
    },

    updateVMinMax: function(minmax){
      var minmaxValue = this.getVMinMax(minmax);
      this.model.set('v' + minmax, minmaxValue);
    },

    getVMinMax: function(minmax){
      var features = this.model.get('features');
      if (! features || ! features.length ){
        return;
      }
      var dataProp = this.model.get('dataProp');
      if (typeof dataProp == 'undefined'){
        return;
      }
      var minmaxFunc = _[minmax];
      var extremeModel = minmaxFunc(features.models, function(featureModel){
        var properties = featureModel.get('properties');
        if (! properties){
          return;
        }
        return properties.get(dataProp);
      });
      if (extremeModel && extremeModel.get('properties')){
        return extremeModel.get('properties').get(dataProp);
      }
    },

    updateStyleRules: function(){
      var attrs = ['dataProp', 'colormap', 'vmin', 'vmax'];
      var attrValues = {};
      for (var i = 0; i < attrs.length; i++){
        var attr = attrs[i];
        var value = this.model.get(attr);
        if (typeof value == 'undefined'){
          return;
        }
        attrValues[attr] = value;
      }

      // Generate color bins.
      var colorBins = Colormap.generateColoredBins({
        vmin: attrValues.vmin,
        vmax: attrValues.vmax,
        colormap: attrValues.colormap,
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
        prop: attrValues.dataProp
      });

      // Update model's default styleMap.
      var defaultStyle = this.model.get('styleMap').get('default');
      if (! defaultStyle){
        defaultStyle = new Backbone.Model({
          id: 'default'
        });
        this.model.get('styleMap').add(defaultStyle, {silent: true});
      }
      defaultStyle.set('rules', rules);
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

    onPropertiesChange: function(){
      var scaleType = this.model.get('scale_type');

      if (scaleType == 'diverging'){
        if (this.model.get('vrAuto')){
          this.updateVr();
        }
      }
      else if (scaleType == 'sequential'){
        var setObj = {};
        _.each(['min', 'max'], function(minmax){
          if (this.model.get('v' + minmax + 'Auto')){
            setObj['v' + minmax] = this.getVMinMax(minmax);
          }
        }, this);
        this.model.set(setObj);
      }
    },

    renderFormElements: function(){
      LayerEditorView.prototype.renderFormElements.call(this);
      var scale_type = this.model.get('scale_type') || 'sequential';
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
