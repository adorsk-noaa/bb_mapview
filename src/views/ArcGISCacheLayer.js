define([
       "jquery",
       "backbone",
       "underscore",
       "openlayers",
       "./layer",
],
function($, Backbone, _, ol, LayerView){

  var ArcGISCacheLayerView = LayerView.extend({

    initialize: function(){

      LayerView.prototype.initialize.apply(this, arguments);

      this.model.on('change:url', this.updateURL, this);
      this.postInitialize();
    },

    createLayer: function(){
      this.sanitizeOptions();
      return new OpenLayers.Layer.ArcGISCache(
        this.model.get('label'),
        this.model.get('url'),
        _.extend({}, this.model.get('options'),{
          visibility: this.model.get('visible'),
          opacity: this.model.get('opacity'),
        })
      );
    },

    updateURL: function(){
      var _this = this;
      if (! _this.model.get('visible')){
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

  return ArcGISCacheLayerView;
});

