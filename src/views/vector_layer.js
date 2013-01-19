define([
       "jquery",
       "backbone",
       "underscore",
       "openlayers",
       "./layer",
],
function($, Backbone, _, ol, LayerView){

  var VectorLayerView = LayerView.extend({

    initialize: function(){
      LayerView.prototype.initialize.apply(this, arguments);
      this.postInitialize();
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
  });

  return VectorLayerView;
});
