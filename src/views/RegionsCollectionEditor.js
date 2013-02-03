define(
  [
    "jquery",
    "backbone",
    "underscore",
    "_s",
    "ui",
    "openlayers",
    "text!./templates/RegionsCollectionEditor.html"
],
function($, Backbone, _, _s, ui, ol, RegionsCollectionEditorTemplate){

  var gj = new OpenLayers.Format.GeoJSON();

  var RegionsCollectionEditorView = Backbone.View.extend({

    events: {
      'click .add-feature-button': 'activateDrawControl',
    },

    initialize: function(opts){
      opts = _.extend({
      }, opts);

      $(this.el).addClass('regions-collection-editor');
      this.regions = this.model.get('regions');

      this.registry = {};
      this.initialRender();

      this.postInitialize();
    },

    initialRender: function(){
      $(this.el).html(_.template(RegionsCollectionEditorTemplate, {view: this}));
      this.$regionsContainer = $('.regions', this.el);
      this.regionsLayer = new OpenLayers.Layer.Vector("Regions Layers");

      var rbox = {
        x0: 0,
        x1: 20,
        y0: 0,
        y1: 20,
      };
      var dummyFeature = gj.read({
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [[[rbox.x0, rbox.y0], [rbox.x0, rbox.y1], [rbox.x1, rbox.y1], [rbox.x1, rbox.y0], [rbox.x0, rbox.y0]]]
        }
      });
      this.regionsLayer.addFeatures(dummyFeature);

      this.drawControl = new OpenLayers.Control.DrawFeature(this.regionsLayer, OpenLayers.Handler.Polygon);
      this.drawControl.featureAdded = _.bind(this.onDrawFeatureFinish, this);

      this.renderRegionViews();

    },

    postInitialize: function(){
      this.on('remove', this.remove, this);
      this.regions.on('add', this.addRegion, this);
      this.regions.on('remove', this.removeRegion, this);
    },

    renderRegionViews: function(){
      this.$regionsContainer.empty();
      var _this = this;
      _.each(this.regions.models, function(regionModel){
        var $regionView = $('<div></div>');
        $regionView.append($('<div>' + regionModel.cid + '</div>'));
        var $removeLink = $('<div>remove</div>');
        $removeLink.on('click', function(){
          _this.regions.remove(regionModel);
        });
        $regionView.append($removeLink);
        this.$regionsContainer.append($regionView);
        if (! this.registry[regionModel.cid]){
          this.registry[regionModel.cid] = {};
        }
        this.registry[regionModel.cid].$regionView = $regionView;
      }, this);
    },

    addRegion: function(regionModel){
      this.renderRegionViews();
      if (! this.registry[regionModel.cid]){
        this.registry[regionModel.cid] = {};
      }
      var registryItem = this.registry[regionModel.cid];
      if (! registryItem.feature){
        console.log('render feature');
      }
    },

    removeRegion: function(regionModel){
      var registryItem = this.registry[regionModel.cid];
      if (registryItem){
        if (registryItem.feature){
          this.regionsLayer.removeFeatures(registryItem.feature);
        }
        if (registryItem.$regionView){
          registryItem.$regionView.remove();
        }
        delete this.registry[regionModel.cid];
      }
    },

    activateDrawControl: function(){
      this.drawControl.activate();
    },

    onDrawFeatureFinish: function(feature){
      console.log("feature added");
      this.drawControl.deactivate();
      var regionModel = new Backbone.Model({
      });
      this.registry[regionModel.cid] = {
        feature: feature
      };
      this.regions.add(regionModel);
    },

    remove: function(){
      Backbone.View.prototype.remove.apply(this, arguments);
      _.each(this.registry, function(item, id){
      }, this);
    }

  });

  return RegionsCollectionEditorView;
});

