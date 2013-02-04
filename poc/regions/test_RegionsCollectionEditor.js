require(
  [
    "jquery",
    "rless!MapView/styles/mapview.less",
    "openlayers",
    "MapView/models/Feature",
    "MapView/views/vector_layer",
    "MapView/views/RegionsCollectionEditor",
  ],
  function($, MapViewCSS, ol, FeatureModel, VectorLayerView, RegionsCollectionEditor){
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

        var map = new OpenLayers.Map('map');

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
        //var features = createFeatures(xMin, xMax, yMin, yMax, dx, dy);

        features = new Backbone.Collection();
        $.ajax({
          url: '/sa.json',
          dataType: 'json',
          success: function(data){
            _.each(data.features, function(feature){
              features.add(new FeatureModel(feature));
            });
          },
          async: false
        });


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
        map.addLayer(vLayer.layer);

        var wms = new OpenLayers.Layer.WMS(
          "OpenLayers WMS",
          "http://vmap0.tiles.osgeo.org/wms/vmap0",
          {'layers':'basic'} 
        );
        map.addLayer(wms);
        map.zoomToMaxExtent();

        regionsEditorModel = new Backbone.Model({
          regions: new Backbone.Collection(),
          observed_layer: vLayerModel,
          getData: '(function(features){return features.length;})'
        });

        regionsEditor = new RegionsCollectionEditor({
          model: regionsEditorModel,
          el: $("#regionsEditor"),
          map: map,
        });

      });
    });
  }
);
