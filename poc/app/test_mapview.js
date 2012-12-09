require(
  [
    "jquery",
    "rless!MapView/styles/mapview.less",
    "MapView",
    "tabble"
  ],
  function($, MapViewCSS, MapView){
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
        var editor_m = new Backbone.Model();
        _.each(['data', 'base', 'overlay'], function(category){
          var layer_set = new Backbone.Collection();
          for (var i=0; i < 3; i++){
            layer_set.add(new Backbone.Model({
              label: category + "_" + i,
              layer_type: 'WMS'
            }));
          }
          editor_m.set(category + '_layers', layer_set);
        });

        var editor = new MapView.views.MapEditorView({
          model: editor_m,
          el: $('#main')
        });
      });
    });
  }
);
