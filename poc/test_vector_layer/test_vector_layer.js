require(
  [
    "jquery",
    "rless!MapView/styles/mapview.less",
    "rless!ui/css/smoothness/jquery-ui-1.9.1.custom.css",
    "MapView",
    "MapView/models/Feature",
],
function($, MapViewCSS, uiCSS, MapView, FeatureModel){
  $(document).ready(function(){
    $(document.body).append('<p id="stylesLoaded" style="display: none;"></p>');
    cssEl = document.createElement('style');
    cssEl.id = 'rless';
    cssEl.type = 'text/css';
    cssText = uiCSS + MapViewCSS + "\n#stylesLoaded {position: fixed;}\n";
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
      var editor_m = new Backbone.Model();
      var base_layer = new Backbone.Model({
        label: 'Base Layer',
        layer_type: 'WMS',
        service_url: 'http://vmap0.tiles.osgeo.org/wms/vmap0',
        params: {layers: 'basic'}
      });
      editor_m.set('base_layers', new Backbone.Collection([base_layer]));

      var createGrid = function(xMin, xMax, yMin, yMax, dx, dy){
        var geoms = {};
        var featureCounter = 0;
        for (var x=xMin; x < xMax; x += dx){
          for (var y=yMin; y < yMax; y += dy){
            featureCounter += 1;
            var coords = [[x, y],[x,y+dy],[x+dx,y+dy],[x+dx,y],[x,y]];
            var hex = (featureCounter % 255).toString(16);
            var color = '#' + hex + hex + hex;
            geoms[featureCounter] = {
              "type": "Polygon",
              "coordinates": [coords]
            };
          }
        }
        return geoms;
      };

      var xMin = -40;
      var xMax = 40;
      var dx = 20;
      var yMin = -40;
      var yMax = 40;
      var dy = 20;
      var geoms = createGrid(xMin, xMax, yMin, yMax, dx, dy);

      var features = new Backbone.Collection();
      for (var i in geoms){
        var feature = new FeatureModel({
          id: parseInt(i),
          geometry: geoms[i],
          properties: {
            p1: parseInt(i)
          }
        });
        features.add(feature);
      }

      var vector_model = new Backbone.Model({
        label: 'Test Vector Layer',
        layer_type: 'Vector',
        features: features,
        styleMap: new Backbone.Collection(
          [
            new Backbone.Model({
          id: 'default', 
          strokeColor: 'blue', 
          rules: [
            {
            filter: 'p1 > 2 AND p1 < 4',
            symbolizer: {fillColor: 'green'}
          },
          {
            filter: 'p1 >= 4',
            symbolizer: {fillColor: 'red'}
          }
          ]})
        ])
      });

      window.vm = vector_model;
      editor_m.set('data_layers', new Backbone.Collection([vector_model]));

      var editor = new MapView.views.MapEditorView({
        model: editor_m,
        el: $('#main')
      });
      window.e = editor;
      editor.trigger('ready');
      editor.mapView.map.zoomToExtent([xMin, yMin, xMax, yMax]);
    });
  });
}
);
