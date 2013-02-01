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

        var baseLayerModel = new Backbone.Model({
          layer_type:"WMS",
          label:"Base label",
          disabled: false,
          service_url: 'http://vmap0.tiles.osgeo.org/wms/vmap0',
          params: {"layers": 'basic'},
          options: {isBaseLayer: true},
        });

        var overlayLayerModel = new Backbone.Model({
          layer_type:"WMS",
          label:"Overlay Label",
          disabled:false,
          service_url: 'http://vmap0.tiles.osgeo.org/wms/vmap0',
          params: {"layers": 'basic'},
          expanded: true
        });

        var defaultMap = new Backbone.Model({
          extent: [-70, 30, -65, 50],
          graticule_intervals:[2],
          default_layer_options: {
            transitionEffect:"resize",
          },
          default_layer_attributes:{
            disabled: true,
            reorderable: true
          },
          resolutions:[0.025,0.0125,0.00625,0.003125,0.0015625,0.00078125],
        });

        mapEditorModel = new Backbone.Model({
          map: defaultMap.clone(),
          base_layers: new Backbone.Collection(
            [baseLayerModel.clone(), baseLayerModel.clone()]
          ) ,
          overlay_layers: new Backbone.Collection(
            [overlayLayerModel.clone(), overlayLayerModel.clone()]
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
