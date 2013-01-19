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
      this.postInitialize();
    },

    postInitialize: function(){
      LayerView.prototype.postInitialize.apply(this, arguments);
      if (this.model.get('features')){
        this.setFeatures();
      }

      // TEST STYLE.
      window.gc = function(feature){
        console.log(feature.attributes);
        var hex = (feature.data.fid % 255).toString(16);
        var color = '#' + hex + hex + hex;
        return color;
      };
      var context = {
        getColor: function(feature){return window.gc(feature)}
      };
      var template = {
        //fillColor: '${getColor}'
        fillColor: '${color}'
      };
      //var style = new OpenLayers.Style(template, {context: context});
      var style = new OpenLayers.Style(template);
      this.layer.styleMap = new OpenLayers.StyleMap(style);
      window.l = this.layer;
    },

    createLayer: function(){
      console.log("creating vector");
      this.sanitizeOptions();
      return new OpenLayers.Layer.Vector(
        this.model.get('label'),
        _.extend({}, this.model.get('options'),{
          visibility: this.model.get('visible'),
          opacity: this.model.get('opacity'),
        })
      );

    },

    setFeatures: function(){
      var olFeatures = geoJSON.read({
        type: "FeatureCollection",
        features: this.model.get('features')
      });
      this.layer.removeAllFeatures();
      this.layer.addFeatures(olFeatures);
    },
  });

  return VectorLayerView;
});
