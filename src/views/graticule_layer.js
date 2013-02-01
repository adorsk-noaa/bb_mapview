define(
  [
    "jquery",
    "backbone",
    "underscore",
    "openlayers",
    "./layer",
],
function($, Backbone, _, ol, LayerView){

  var GraticuleLayerView = LayerView.extend({

    initialize: function(){
      if (! this.model.get('options')){
        this.model.set('options', new Backbone.Model());
      }
      LayerView.prototype.initialize.apply(this, arguments);
      this.postInitialize();
    },
    createLayer: function(){
      var lineSymbolizer = {
        strokeColor: "#333",
        strokeWidth: 1,
        strokeOpacity: 0.5
      };

      var labelSymbolizer = {
        stroke: false,
        fill: false,
        label: "${label}",
        labelAlign: "${labelAlign}",
        labelXOffset: "${xOffset}",
        labelYOffset: "${yOffset}",
      };

      var gratStyle = new OpenLayers.Style({}, {
        rules: [new OpenLayers.Rule(
          {'symbolizer': {"Point": labelSymbolizer, "Line": lineSymbolizer}}
        )]
      });

      var gratLayer = new OpenLayers.Layer.Vector(this.model.cid, {
        styleMap: new OpenLayers.StyleMap({'default':gratStyle}),
      });

      var graticuleOpts = {gratLayer: gratLayer};
      $.extend(true, graticuleOpts, this.model.get('options').toJSON());
      this.graticuleControl = new OpenLayers.Control.Graticule(graticuleOpts);

      return this.graticuleControl.gratLayer;
    },
  });

  return GraticuleLayerView;
});

