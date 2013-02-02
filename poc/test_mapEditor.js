require(
  [
    "jquery",
    "rless!MapView/styles/mapview.less",
    "MapView/views/map_editor",
    "MapView/util/Colormap",
    "MapView/models/Feature",
  ],
  function($, MapViewCSS, MapEditorView, Colormap, FeatureModel){
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

        baseLayerModel = new Backbone.Model({
          layer_type:"WMS",
          label:"Base label",
          disabled: false,
          service_url: 'http://vmap0.tiles.osgeo.org/wms/vmap0',
          params: {"layers": 'basic'},
          options: {},
          legend: 'bl legend',
        });
        var bm2 = baseLayerModel.clone();
        bm2.set('label', 'bm2');
        bm2.set('legend', 'bm2');

        var overlayLayerModel = new Backbone.Model({
          layer_type:"WMS",
          label:"Overlay Label",
          disabled: false,
          service_url: 'http://vmap0.tiles.osgeo.org/wms/vmap0',
          params: {"layers": 'basic'},
          expanded: true,
          legend: 'ovlery legend',
        });

        var graticuleLayerModel = new Backbone.Model({
          layer_type:"Graticule",
          label:"Graticule Label",
          disabled: false,
          legend: 'grid legend',
        });

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

        var vectorLayerModel = new Backbone.Model({
          label: 'Test Vector Layer',
          layer_category: 'data',
          layer_type: 'Vector',
          features: features,
          dataProp: 'p1',
          vmin: 0,
          vmax: features.length,
          colormap: Colormap.COLORMAPS['ColorBrewer:RdBu'],
          expanded: true,
          scale_type: 'diverging',
        });

        var defaultMap = new Backbone.Model({
          maxExtent: [-180, -90, 180, 90],
          extent: [-70, 30, -65, 50],
          resolutions:[0.025,0.0125,0.00625,0.003125,0.0015625,0.00078125],
          options: {
            allOverlays: true
          }
        });

        mapEditorModel = new Backbone.Model({
          map: defaultMap.clone(),
          base_layers: new Backbone.Collection(
            [baseLayerModel.clone(), bm2]
          ) ,
          overlay_layers: new Backbone.Collection(
            [overlayLayerModel.clone(), graticuleLayerModel, vectorLayerModel]
          )
        });

        mapEditor = new MapEditorView({
          model: mapEditorModel,
          el: $('#main'),
        });

        mapEditor.trigger('ready');

      });
    });
  }
);
