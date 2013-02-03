define(
  [
    "jquery",
    "backbone",
    "underscore",
    "_s",
    "ui",
    "openlayers",
    "./Region",
    "text!./templates/RegionsCollectionEditor.html"
],
function($, Backbone, _, _s, ui, ol, RegionView, RegionsCollectionEditorTemplate){

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
      this.map = opts.map;

      this.registry = {};
      this.initialRender();

      this.postInitialize();
    },

    initialRender: function(){
      $(this.el).html(_.template(RegionsCollectionEditorTemplate, {view: this}));
      this.$regionsContainer = $('.regions', this.el);
      this.regionsLayer = new OpenLayers.Layer.Vector("Regions Layers");
      this.map.addLayer(this.regionsLayer);

      var rbox = {
        x0: 0,
        x1: 20,
        y0: 0,
        y1: 20,
      };

      this.drawControl = new OpenLayers.Control.DrawFeature(this.regionsLayer, OpenLayers.Handler.Polygon);
      this.drawControl.featureAdded = _.bind(this.onDrawFeatureFinish, this);
      this.map.addControl(this.drawControl);

    },

    postInitialize: function(){
      this.on('remove', this.remove, this);
      this.regions.on('add', this.addRegion, this);
      this.regions.on('remove', this.removeRegion, this);

      _.each(this.regions.models, this.addRegion, this);
    },

    addRegion: function(regionModel){
      regionModel.set('observed_layer', this.model.get('observed_layer'));
      var regionView = new RegionView({
        model: regionModel,
        map: this.map,
      });
      this.regionsLayer.addFeatures(regionView.feature);
      var $listItem = this.renderListItem(regionModel);
      this.$regionsContainer.append($listItem);
      this.registry[regionModel.cid] = {
        regionView: regionView,
        $listItem: $listItem,
      }
    },

    renderListItem: function(regionModel){
      var _this = this;
      var $listItem = $('<div></div>');
      $listItem.append($('<div>' + regionModel.cid + '</div>'));
      var $removeLink = $('<div>remove</div>');
      $removeLink.on('click', function(){
        _this.regions.remove(regionModel);
      });
      $listItem.append($removeLink);
      return $listItem;
    },

    removeRegion: function(regionModel){
      var registryItem = this.registry[regionModel.cid];
      if (registryItem){
        if (registryItem.regionView.feature){
          this.regionsLayer.removeFeatures(registryItem.regionView.feature);
        }
        if (registryItem.$listItem){
          registryItem.$listItem.remove();
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
        geometry: JSON.parse(gj.write(feature.geometry)),
      });
      this.regions.add(regionModel);
      this.regionsLayer.removeFeatures(feature);
    },

    remove: function(){
      Backbone.View.prototype.remove.apply(this, arguments);
      _.each(this.registry, function(item, id){
      }, this);
    }

  });

  return RegionsCollectionEditorView;
});

