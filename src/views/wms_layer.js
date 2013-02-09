define([
       "jquery",
       "backbone",
       "underscore",
       "openlayers",
       "./layer",
],
function($, Backbone, _, ol, LayerView){

  var WMSLayerView = LayerView.extend({

    initialize: function(){

      LayerView.prototype.initialize.apply(this, arguments);

      this.model.on('change:url', this.onURLChange, this);

      this.postInitialize();
    },

    createLayer: function(){
      return new OpenLayers.Layer.WMS(
        this.model.get('label'),
        this.model.get('url'),
        this.model.get('params'),
        this.model.get('properties').toJSON()
      );
    },

    onURLChange: function(){
      var _this = this;
      if (! _this.model.get('properties').get('visibility')){
        _this.model.trigger('load:start');
        _this.layer.url = _this.model.get('url');
        _this.layer.clearGrid();
        _this.model.trigger('load:end');
      }
      else{
        // Register a temporary callback for when load end finishes.
        var tmpOnLoadEnd = function(){
          _this.model.off('load:end', tmpOnLoadEnd);
          _this.fadeIn();
        };
        _this.model.on('load:end', tmpOnLoadEnd);

        // Start with a fade.
        var promise = _this.fadeOut();
        // When the fade completes...
        promise.then(function(){
          _this.layer.clearGrid();
          _this.layer.url = _this.model.get('url');
          _this.layer.redraw();
        });
      }
    },
  });

  return WMSLayerView;
});

