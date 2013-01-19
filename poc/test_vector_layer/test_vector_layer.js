require(
  [
    "jquery",
    "rless!MapView/styles/mapview.less",
    "rless!ui/css/smoothness/jquery-ui-1.9.1.custom.css",
    "MapView",
],
function($, MapViewCSS, uiCSS, MapView){
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
        var features = [];
        var featureCounter = 0;
        for (var x=xMin; x < xMax; x += dx){
          for (var y=yMin; y < yMax; y += dy){
            featureCounter += 1;
            var coords = [[x, y],[x,y+dy],[x+dx,y+dy],[x+dx,y],[x,y]];
            var hex = (featureCounter % 255).toString(16);
            var color = '#' + hex + hex + hex;
            features.push({
              "type": "Feature",
              "geometry": {
                "type": "Polygon",
                "coordinates": [coords]
              },
              "properties": {
                "fid": featureCounter,
                "color": color
              }
            });
          }
        }
        return features;
      };

      var xMin = -30;
      var xMax = 30;
      var dx = 1;
      var yMin = -30;
      var yMax = 30;
      var dy = 1;
      var vector_data_layer = new Backbone.Model({
        label: 'Test Vector Layer',
        layer_type: 'Vector',
        features: createGrid(xMin, xMax, yMin, yMax, dx, dy)
      });
      editor_m.set('data_layers', new Backbone.Collection([vector_data_layer]));

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
