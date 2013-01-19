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

      var vector_data_layer = new Backbone.Model({
        label: 'Test Vector Layer',
        layer_type: 'Vector',
      });
      editor_m.set('data_layers', new Backbone.Collection([vector_data_layer]));

      var editor = new MapView.views.MapEditorView({
        model: editor_m,
        el: $('#main')
      });
      window.e = editor;
      editor.trigger('ready');
      editor.mapView.map.zoomToExtent([-45, -45, 45, 45]);
    });
  });
}
);
