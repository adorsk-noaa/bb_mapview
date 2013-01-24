define([
       "jquery",
       "backbone",
       "underscore",
       "openlayers",
       "./layer",
],
function($, Backbone, _, ol, LayerView){

  var geoJSON = new OpenLayers.Format.GeoJSON();

  var VectorLayerView = LayerView.extend({
    initialize: function(){
      LayerView.prototype.initialize.apply(this, arguments);
      if (! this.model.get('features')){
        this.model.set('features', new Backbone.Collection());
      }
      this.postInitialize();
    },

    postInitialize: function(){
      LayerView.prototype.postInitialize.apply(this, arguments);

      this.model.get('features').on('add', this.addFeature, this);
      this.model.get('features').on('remove', this.removeFeature, this);
      this.model.get('features').on('change', this.updateFeature, this);

      if (this.model.get('features')){
        _.each(this.model.get('features').models, function(featureModel){
          this.addFeature(featureModel);
        },this);
      }
    },

    createLayer: function(){
      this.sanitizeOptions();
      var layer = new OpenLayers.Layer.Vector(
        this.model.get('label'),
        _.extend({}, this.model.get('options'),{
          visibility: this.model.get('visible'),
          opacity: this.model.get('opacity'),
        })
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
      return layer;
    },

    parseFeatureModel: function(featureModel){
      var gjFeature = {
        type: 'Feature',
        id: featureModel.id,
        properties: featureModel.get('properties').toJSON(),
        geometry: featureModel.get('geometry')
      };
      olFeature = geoJSON.parseFeature(gjFeature);
      var styleModel = featureModel.get('style');
      if (styleModel){
        var style = styleModel.toJSON();
        if (! $.isEmptyObject(style)){
          olFeature.style = styleModel.toJSON();
        }
      }
      return olFeature;
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
      _.each(['data', 'style'], function(attr){
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
    }
  });

  return VectorLayerView;
});
