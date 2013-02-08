define([
       "jquery",
       "backbone",
       "underscore",
       "openlayers",
       "./layer",
],
function($, Backbone, _, ol, LayerView){

  var GeoJSON = new OpenLayers.Format.GeoJSON();
  var CQL = new OpenLayers.Format.CQL();

  var VectorLayerView = LayerView.extend({
    initialize: function(){
      LayerView.prototype.initialize.apply(this, arguments);
      if (! this.model.get('features')){
        this.model.set('features', new Backbone.Collection());
      }

      if (! this.model.get('styleMap')){
        this.model.set('styleMap', new Backbone.Collection());
      }
      if (this.model.get('styleMap').length){
        this.updateStyleMap({silent: true});
      }

      this.postInitialize();
    },

    postInitialize: function(){
      LayerView.prototype.postInitialize.apply(this, arguments);

      this.model.get('features').on('add', this.addFeature, this);
      this.model.get('features').on('remove', this.removeFeature, this);
      this.model.get('features').on('change', this.updateFeature, this);
      this.model.get('styleMap').on('change', this.updateStyleMap, this);
      this.on('redraw', this.redraw, this);

      if (this.model.get('features')){
        _.each(this.model.get('features').models, function(featureModel){
          this.addFeature(featureModel);
        },this);
      }

    },

    createLayer: function(){
      // Parse event callbacks.
      var callbacks = {};
      _.each(['onFeatureInsert', 'preFeatureInsert'], function(callbackId){
        var callback = this.model.get('properties').get(callbackId);
        if (callback){
          if (typeof callback != 'function'){
            callback = eval(callback);
          }
          callbacks[callbackId] = callback;
        }
      }, this);

      var layer = new OpenLayers.Layer.Vector(
        this.model.get('label'),
        _.extend({}, this.model.get('properties').toJSON(), callbacks)
      );



      // Customize moveByPx for smoother panning.
      layer.moveByPx = function(dx, dy){
        var ps = ['left', 'top'];
        for (var i in ps){
          var p = ps[i];
          var oldPos = parseFloat(this.div.style[p]);
          var newPos = oldPos + arguments[i];
          this.div.style[p] = newPos + 'px';
        }
        var extent = this.map.getExtent().scale(this.ratio);
        coordSysUnchanged = this.renderer.setExtent(extent, false);
      };


      window.vl = layer;
      return layer;
    },

    parseFeatureModel: function(featureModel){
      var gjFeature = {
        type: 'Feature',
        id: featureModel.id,
        properties: featureModel.get('properties').toJSON(),
        geometry: featureModel.get('geometry')
      };
      olFeature = GeoJSON.parseFeature(gjFeature);
      if (featureModel.id == 0){
        olFeature.fid = 0;
      }
      var styleModel = featureModel.get('style');
      if (styleModel){
        var style = styleModel.toJSON();
        if (! $.isEmptyObject(style)){
          olFeature.style = styleModel.toJSON();
        }
      }
      return olFeature;
    },

    updateStyleMap: function(opts){
      opts = opts || {};
      this.layer.styleMap = this.parseStyleMap(this.model.get('styleMap'));
      if (! opts.silent){
        this.trigger('redraw');
      }
    },

    parseStyleMap: function(styleMapModel){
      var _this = this;
      var olStyleMap = {};
      _.each(styleMapModel.models, function(styleModel){
        var styleObj = styleModel.toJSON();
        var olStyle = new OpenLayers.Style(styleObj);
        if (styleObj.rules){
          var olRules = _this.parseStyleRules(styleObj.rules);
          olStyle.addRules(olRules);
        }
        olStyleMap[styleModel.id] = olStyle;
      });
      return new OpenLayers.StyleMap(olStyleMap);
    },

    parseStyleRules: function(rules){
      var olRules = [];
      _.each(rules, function(rule){
        var olRule = new OpenLayers.Rule({
          filter: CQL.read(rule.filter),
          symbolizer: rule.symbolizer
        });
        olRules.push(olRule);
      });
      return olRules;
    },

    addFeature: function(featureModel){
      var olFeature = this.parseFeatureModel(featureModel);
      this.layer.addFeatures([olFeature]);
    },

    removeFeature: function(featureModelOrId){
      var featureModel = featureModelOrId;
      if (! typeof(featureModelOrId) == 'object'){
        featureModel = this.model.get('features').get(featureModelOrId);
        if (! featureModel){
          return;
        }
      }
      var olFeature = this.layer.getFeatureByFid(featureModel.id);
      if (! olFeature){
        return;
      }
      this.layer.removeFeatures([olFeature]);
    },

    updateFeature: function(featureModel, changeAttr){
      var olFeature = this.layer.getFeatureByFid(featureModel.id);
      var updatedOlFeature = this.parseFeatureModel(featureModel);
      _.each(['attributes', 'style'], function(attr){
        olFeature[attr] = updatedOlFeature[attr];
      });
      if (changeAttr == 'geometry'){
        this.layer.removeFeatures(olFeature);
        olFeature['geometry'] = updatedOlFeature['geometry'];
        this.layer.addFeature(olFeature);
      }
      else{
        this.layer.drawFeature(olFeature);
      }
    },

    redraw: function(){
      this.layer.redraw();
    }
  });

  return VectorLayerView;
});
