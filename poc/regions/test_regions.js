require(
  [
    "jquery",
    "rless!MapView/styles/mapview.less",
    "openlayers",
    "MapView/models/Feature",
    "MapView/views/vector_layer",
  ],
  function($, MapViewCSS, ol, FeatureModel, VectorLayerView){
    $(document).ready(function(){
      $(document.body).append('<p id="stylesLoaded" style="display: none;"></p>');
      cssEl = document.createElement('style');
      cssEl.id = 'rless';
      cssEl.type = 'text/css';
      cssText = MapViewCSS + "\n#stylesLoaded {position: fixed;}\n";
      if (cssEl.styleSheet){
        cssEl.styleSheet.cssText = cssText;
      }
      else{
        cssEl.appendChild(document.createTextNode(cssText));
      }
      document.getElementsByTagName("head")[0].appendChild(cssEl);

      var cssDeferred = $.Deferred();
      var cssInterval = setInterval(function(){
        $testEl = $('#stylesLoaded');
        var pos = $testEl.css('position');
        if (pos == 'fixed'){
          clearInterval(cssInterval);
          cssDeferred.resolve();
        }
        else{
          console.log('loading styles...', pos);
        }
      }, 500);

      cssDeferred.done(function(){
        console.log('styles loaded');

        var createFeatures = function(xMin, xMax, yMin, yMax, dx, dy){
          var features = new Backbone.Collection();
          var featureCounter = 0;
          for (var x=xMin; x < xMax; x += dx){
            for (var y=yMin; y < yMax; y += dy){
              featureCounter += 1;
              var coords = [[x, y],[x,y+dy],[x+dx,y+dy],[x+dx,y],[x,y]];
              var feature = new FeatureModel({
                id: featureCounter,
                geometry: {
                  type: "Polygon",
                  coordinates: [coords],
                },
                properties: {
                  p1: featureCounter
                }
              });
              features.add(feature);
            }
          }
          return features;
        };

        var xMin = -40;
        var xMax = 40;
        var dx = 1;
        var yMin = -40;
        var yMax = 40;
        var dy = 1;
        var features = createFeatures(xMin, xMax, yMin, yMax, dx, dy);

        var vLayerModel = new Backbone.Model({
          label: 'Test Vector Layer',
          layer_category: 'data',
          layer_type: 'Vector',
          features: features,
          dataProp: 'p1',
        });
        var vLayer = new VectorLayerView({
          model: vLayerModel
        });

        var region = {};
        var rbox = {
          x0: 0,
          x1: 2,
          y0: 0,
          y1: 2,
        };
        var rgj = {
          type: "Polygon",
          coordinates: [[[rbox.x0, rbox.y0], [rbox.x0, rbox.y1], [rbox.x1, rbox.y1], [rbox.x1, rbox.y0], [rbox.x0, rbox.y0]]]
        }
        var gj = new OpenLayers.Format.GeoJSON();
        region.geometry = gj.read(rgj, 'Geometry');

        var features = vLayer.layer.features;

        /*
        var s = new Date().getTime();
        var featuresInRegion = [];
        for (var i = 0; i < features.length; i++){
          var feature = features[i];
          if (feature.geometry.intersects(region.geometry)){
            featuresInRegion.push(feature);
          }
        }
        var e = new Date().getTime();
        console.log(featuresInRegion.length, e - s);

        var fn = function(features){
          var sum = 0;
          for (var i = 0; i < features.length; i++){
            var feature = features[i];
            sum += feature.data.p1;
          }
          return sum;
        };

        var sum = fn(featuresInRegion);
        console.log("s is: ", sum);
        */

      });
    });
  }
);
