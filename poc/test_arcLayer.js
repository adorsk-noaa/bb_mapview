require(
  [
    "jquery",
    "rless!MapView/styles/mapview.less",
    "MapView/views/map_editor",
  ],
  function($, MapViewCSS, MapEditorView){
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

        var resolutions = [156543.033928, 78271.5169639999, 39135.7584820001, 19567.8792409999, 9783.93962049996, 4891.96981024998, 2445.98490512499, 1222.99245256249, 611.49622628138, 305.748113140558, 152.874056570411, 76.4370282850732, 38.2185141425366, 19.1092570712683, 9.55462853563415, 4.77731426794937, 2.38865713397468];

        var overlayLayers = {
         Ocean: new Backbone.Model({
           layer_type: 'XYZ',
           label: 'foo',
           url: 'http://services.arcgisonline.com/ArcGIS/rest/services/Ocean_Basemap/MapServer/tile/${z}/${y}/${x}',
           disabled: false,
           properties: new Backbone.Model({
             visibility: true,
             isBaseLayer: true,
             sphericalMercator: true,
             serverResolutions: [156543.033928, 78271.5169639999, 39135.7584820001, 19567.8792409999, 9783.93962049996, 4891.96981024998, 2445.98490512499, 1222.99245256249, 611.49622628138, 305.748113140558, 152.874056570411, 76.4370282850732, 38.2185141425366, 19.1092570712683, 9.55462853563415, 4.77731426794937, 2.38865713397468],
             minResolution: resolutions[10],
           })
         }),
         graticule: new Backbone.Model({
           layer_type:"Graticule",
           label:"Lat/Lon Grid",
           disabled: false,
           properties: new Backbone.Model(),
         }),
         habs: new Backbone.Model({
           layer_type: "WMS",
           label:"habs",
           //url: 'http://localhost:8080/geoserver/topp/wms?',
           url: 'http://localhost:8000/georefine/projects/13/layers/substrates/wms?',
           disabled: false,
           params: {
             layers: 'substrates',
             srs:'EPSG:3857',
             transparent: true,
           },
           properties: new Backbone.Model({
             projection: 'EPSG:3857',
             serverResolutions: [4891.96981024998, 2445.98490512499, 1222.99245256249, 611.49622628138, 305.748113140558],
             visibility: true,
             tileSize: new OpenLayers.Size(512, 512),
             maxExtent: [-7792364.354444444, 3503549.8430166757, -7235766.900555555, 6446275.8401198285],
           }),
         }),
        };

        var defaultMap = new Backbone.Model({
          properties: new Backbone.Model({
            maxExtent: [-20037508.34, -20037508.34, 20037508.34, 20037508.34],
            extent: [-7792364.354444444, 3503549.8430166757, -7235766.900555555, 6446275.8401198285],
            //resolutions: resolutions,
            //resolutions: [4891.96981024998, 2445.98490512499, 1222.99245256249, 611.49622628138, 305.748113140558, 152.874056570411],
            resolutions: [4891.96981024998, 2445.98490512499, 1222.99245256249, 611.49622628138, 305.748113140558, 152.874056570411],
            //allOverlays: true,
            projection: 'EPSG:3857',
            displayProjection: 'EPSG:4326',
          }),
        });

        mapEditorModel = new Backbone.Model({
          map: defaultMap,
          layers: new Backbone.Collection(
            [
              overlayLayers.Ocean,
              overlayLayers.graticule,
              overlayLayers.habs,
          ])
        });

        mapEditor = new MapEditorView({
          model: mapEditorModel,
          el: $('#main'),
        });

        habs = window.mapEditor.mapView.map.getLayersByName('habs').pop();
        boundsCache = {};
        habs.getURL = function(bounds){
          var q = OpenLayers.Layer.WMS.prototype.getURL.apply(this, arguments);
          console.log('r: ', mapEditor.mapView.map.resolution);
          if (bounds){
            strBounds = JSON.stringify(bounds.toArray());
            if (boundsCache[strBounds]){
              console.log('hit', strBounds);
            }
            else{
              console.log('miss', strBounds);
              boundsCache[strBounds] = strBounds;
            }
            console.log(bounds.toArray());
          }
          return q;
        }

        habs.getServerResolution = function(r){
          var sr = OpenLayers.Layer.WMS.prototype.getServerResolution.apply(this, arguments);
          console.log("sr: ", sr);
          return sr;
        };

        mapEditor.trigger('ready');

      });
    });
  }
);
