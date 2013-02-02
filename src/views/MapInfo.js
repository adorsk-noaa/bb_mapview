define([
  "jquery",
  "backbone",
  "underscore",
  "_s",
  "ui",
  "Util",
  "text!./templates/MapInfo.html",
],
function($, Backbone, _, _s, ui, Util, MapInfoTemplate){

  var MapInfoView = Backbone.View.extend({

    initialize: function(options){
      this.layers = this.model.get('layers');
      if (! this.layers){
        this.layers = new Backbone.Collection();
        this.model.set('layers', this.layers);
      }

      this.legendRegistry = {};
      this.initialRender();

      this.postInitialize();
    },

    initialRender: function(){
      $(this.el).html(_.template(MapInfoTemplate, {view: this}));
      this.$legendTable = $('.legend-table', this.el);

      _.each(this.layers.models, function(layerModel){
        this.addLayer(layerModel);
      }, this);
      this.sortLegendRows();
    },

    postInitialize: function(){
      this.layers.on('change:visibility change:legend', this.updateLayerLegendRow, this);
      this.layers.on('change:index change:visibility', _.throttle(this.sortLegendRows, 100), this);
    },

    onLayerLegendChange: function(layerModel){
      this.updateLayerLegendRow(layerModel);
    },

    addLayer: function(layerModel){
      this.updateLayerLegendRow(layerModel);
    },

    updateLayerLegendRow: function(layerModel){
      var registryItem = this.legendRegistry[layerModel.cid];
      if (registryItem){
        registryItem.$legendRow.remove();
        delete this.legendRegistry[layerModel.cid];
      }
      if (! layerModel.get('visibility') || !  layerModel.get('legend')){
        return;
      }
      var $legendRow = $(_s.sprintf(
        '<tr><td>%s</td><td>%s</td></tr>', 
        layerModel.get('label'), layerModel.get('legend'))
      );
      this.legendRegistry[layerModel.cid] = {
        $legendRow: $legendRow,
        model: layerModel,
      }
      this.$legendTable.append($legendRow);
    },

    sortLegendRows: function(){
      var sortedItems = _.sortBy(this.legendRegistry, function(registryItem){
        return registryItem.model.get('index');
      }, this);
      sortedItems.reverse();
      _.each(sortedItems, function(registryItem){
        this.$legendTable.append(registryItem.$legendRow);
      }, this);
    },

  });

  return MapInfoView;
});

