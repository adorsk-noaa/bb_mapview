define(
  [
    "backbone",
    "underscore",
],
function(Backbone, _){

  var FeatureModel = Backbone.Model.extend({
    defaults: function(){
      return {
        fid: null,
        geometry: null,
        properties: null,
        style: null,
      };
    },
    initialize: function (){
      if (this.id === undefined){
        this.id = this.cid;
      }
      _.each(['properties', 'style'], function(attr){
        if (! (this.get(attr) instanceof Backbone.Model)){
          this.set(attr, new Backbone.Model(this.get(attr)));
        }
        this.get(attr).on('change', function(){this.trigger('change change:' + attr, this, attr)}, this);
      }, this);
    },
  });
  return FeatureModel;
});

