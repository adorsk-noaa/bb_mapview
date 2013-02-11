define([
       "jquery",
       "backbone",
       "underscore",
       "openlayers",
],
function($, Backbone, _, ol){

  var LayerView = Backbone.View.extend({

    initialize: function(){
      if (! this.model.get('properties')){
        this.model.set('properties', new Backbone.Model())
      }

      if (typeof this.model.get('properties').get('opacity') == 'undefined'){
        this.model.get('properties').set('opacity', 1);
      }

      this.layer = this.createLayer();
      this.model.on('change:params', this.updateParams, this);
      this.model.get('properties').on('change:visibility', this.onVisibilityChange, this);
      this.model.get('properties').on('change:opacity', this.onOpacityChange, this);
      this.on('remove', this.remove, this);
    },

    sanitizeProperties: function(properties){
      var tileSize = properties.tileSize;
      if (tileSize){
        properties.tileSize = new OpenLayers.Size(tileSize.w, tileSize.h);
      }
      return properties;
    },

    createLayer: function(){
      return {};
    },

    postInitialize: function(){
      this.layer.events.register("loadstart", this, this.onLoadStart);
      this.layer.events.register("loadend", this, this.onLoadEnd);
      this.onVisibilityChange();
    },

    // These functions trigger a fade animation,
    // and return a promise object that will resolve
    // when the animation completes.
    fadeOut: function(){
      var anim = $(this.layer.div).animate({opacity: .5},500);
      return anim.promise();
    },

    fadeIn: function(){
      var anim = $(this.layer.div).animate({opacity: 1}, 500);
      return anim.promise();
    },

    onLoadStart: function(){
      this.trigger('load:start');
    },

    onLoadEnd: function(){
      this.trigger('load:end');
    },

    // Update layer parameters.
    updateParams: function(){
      var _this = this;
      this.trigger('load:start');

      var promise = _this.fadeOut();
      promise.then(function(){
        // Temporary callback for load:end.
        var tmpOnLoadEnd = function(){
          _this.off('load:end', tmpOnLoadEnd);
          _this.fadeIn();
        };
        _this.on('load:end', tmpOnLoadEnd);

        // Clear grid and merge params, this will trigger a redraw and load.
        _this.layer.clearGrid();
        _this.layer.mergeNewParams(_this.model.get('params'));
      });
    },

    onVisibilityChange: function(){
      this.layer.setVisibility(this.model.get('properties').get('visibility'));
    },

    onOpacityChange: function(){
      this.layer.setOpacity(this.model.get('properties').get('opacity'));
    },

    remove: function(){
      Backbone.View.prototype.remove.call(this, arguments);
      this.layer.destroy();
      this.model.trigger('remove');
      this.model.off();
      this.off();
    }

  });

  return LayerView;
});

