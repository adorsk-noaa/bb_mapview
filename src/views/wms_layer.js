define([
	"jquery",
	"use!backbone",
	"use!underscore",
	"use!openlayers",
	"./layer",
		],
function($, Backbone, _, ol, LayerView){

	var WMSLayerView = LayerView.extend({

		initialize: function(){

			LayerView.prototype.initialize.apply(this, arguments);

			this.model.on('change:service_url', this.onServiceURLChange, this);

            this.postInitialize();
		},
        
        createLayer: function(){
		    return new OpenLayers.Layer.WMS(
				this.model.get('label'),
				this.model.get('service_url'),
				this.model.get('params'),
				_.extend({}, this.model.get('options'),{
					visibility: this.model.get('visible'),
					opacity: this.model.get('opacity'),
				})
			);
        },

		onServiceURLChange: function(){
			var _this = this;
            if (! _this.model.get('visible')){
                _this.model.trigger('load:start');
                _this.layer.url = _this.model.get('service_url');	
                _this.layer.clearGrid();
                _this.model.trigger('load:end');
            }
            else{
                // Register a temporary callback for when load end finishes.
                var tmpOnLoadEnd = function(){
                    _this.model.off('load:end', tmpOnLoadEnd);
                    _this.fadeIn();
                };
                _this.model.on('load:end', tmpOnLoadEnd);

                // Start with a fade.
                var promise = _this.fadeOut();
                // When the fade completes...
                promise.then(function(){
                    _this.layer.clearGrid();
                    _this.layer.url = _this.model.get('service_url');	
                    _this.layer.redraw();
                });
            }
	    },
	});

	return WMSLayerView;
});
		
