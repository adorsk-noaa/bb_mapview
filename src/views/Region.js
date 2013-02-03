define(
  [
    "jquery",
    "backbone",
    "underscore",
    "_s",
    "ui",
    "openlayers",
],
function($, Backbone, _, _s, ui, ol){

  var gj = new OpenLayers.Format.GeoJSON();

  var RegionView = Backbone.View.extend({

    initialize: function(opts){
      opts = _.extend({
        map: null
      }, opts);

      $(this.el).addClass('region-view');
      this.map = opts.map;
      this.selectedFeatures = {};
      this.initialRender();
      this.postInitialize();
    },

    initialRender: function(){
      if (this.model.get('geometry')){
        this.feature = gj.read({
          type: 'Feature',
          id: this.model.cid,
          geometry: this.model.get('geometry'),
          properties: {},
        }, 'Feature');
      }
    },

    postInitialize: function(){
      this.on('remove', this.remove, this);
      this.updateSelectedFeatures();
    },

    updateSelectedFeatures: function(){
      this.selectedFeatures = {};

      if (! this.feature){return;}

      var observedLayerModel = this.model.get('observed_layer');
      if (! observedLayerModel){return;}

      var observedLayer = this.map.getLayersBy('id', observedLayerModel.cid).pop();
      if (! observedLayer){return;}

      _.each(observedLayer.features, function(feature){
        if (feature.geometry.intersects(this.feature.geometry)){
          this.selectedFeatures[feature.id] = feature;
        }
      }, this);
      console.log("sf: ", this.selectedFeatures);
    },

    updateData: function(){
    },

  });

  return RegionView;
});

