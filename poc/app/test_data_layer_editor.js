require(
  [
    "jquery",
    "rless!MapView/styles/mapview.less",
    "rless!ui/css/smoothness/jquery-ui-1.9.1.custom.css",
    "MapView/views/data_layer_editor",
    "tabble"
  ],
  function($, MapViewCSS, uiCSS, DataLayerEditor, tabble){
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

        var layer_model = new Backbone.Model({
          label: 'test data layer',
          layer_category: 'data'
        })

        var editor = new DataLayerEditor({
          model: layer_model,
          el: $('#main')
        });

      });
    });
  }
);
