define([
       "jquery",
       "backbone",
       "underscore",
       "openlayers",
],
function($, Backbone, _, ol){

  var LayerView = Backbone.View.extend({

    initialize: function(){
      var opts = this.model.get('options');
      if (! opts){
        this.model.set('options', {});
      }

      if (typeof this.model.get('opacity') == 'undefined'){
        this.model.set('opacity', 1);
      }

      this.layer = this.createLayer();
      this.model.on('change:params', this.updateParams, this);
      this.model.on('change:visibility', this.onVisibilityChange, this);
      this.model.on('change:disabled', this.onDisabledChange, this);
      this.model.on('change:opacity', this.onOpacityChange, this);
      this.on('remove', this.remove, this);
    },

    createLayer: function(){
      return {};
    },

    sanitizeOptions: function(){
      var options = this.model.get('options');
      if (options.tileSize){
        options.tileSize = new OpenLayers.Size(options.tileSize.w, options.tileSize.h)
      }
    },

    postInitialize: function(){
      this.layer.events.register("loadstart", this, this.onLoadStart);
      this.layer.events.register("loadend", this, this.onLoadEnd);
      this.onDisabledChange();
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
      this.model.trigger('load:start');
    },

    onLoadEnd: function(){
      this.model.trigger('load:end');
    },

    // Update layer parameters.
    updateParams: function(){
      var _this = this;
      _this.model.trigger('load:start');

      var promise = _this.fadeOut();
      promise.then(function(){
        // Temporary callback for load:end.
        var tmpOnLoadEnd = function(){
          _this.model.off('load:end', tmpOnLoadEnd);
          _this.fadeIn();
        };
        _this.model.on('load:end', tmpOnLoadEnd);

        // Clear grid and merge params, this will trigger a redraw and load.
        _this.layer.clearGrid();
        _this.layer.mergeNewParams(_this.model.get('params'));
      });
    },

    onVisibilityChange: function(){
      this.layer.setVisibility(this.model.get('visibility'));
    },

    onOpacityChange: function(){
      this.layer.setOpacity(this.model.get('opacity'));
    },

    onDisabledChange: function(){
      this.model.set('visibility', ! this.model.get('disabled'));
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

