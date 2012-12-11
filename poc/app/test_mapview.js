require(
  [
    "jquery",
    "rless!MapView/styles/mapview.less",
    "rless!ui/css/smoothness/jquery-ui-1.9.1.custom.css",
    "MapView",
    "tabble"
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
        _.each(['data', 'base', 'overlay'], function(category){
          var layer_set = new Backbone.Collection();
          for (var i=0; i < 3; i++){
            var layer_model = new Backbone.Model({
              label: category + "_" + i,
              layer_type: 'WMS'
            })
            if (category == 'data'){
              layer_model.set('layer_category', 'data');
              if (i % 2){
                layer_model.set('data_entity', new Backbone.Model({
                  'color_scale_type': 'bi',
                  'center': 0,
                  'radius': 1
                }));
              }
            }
            layer_set.add(layer_model);
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
