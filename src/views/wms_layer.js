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
				this.model.get('name'),
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
                _this.model.trigger('load:start');
                $(_this.layer.div).animate({
                    opacity: .5
                },500, function(){
                    _this.layer.clearGrid();
                    _this.layer.events.register("loadend", _this, _this.onServiceURLChangeEnd);
                    _this.layer.url = _this.model.get('service_url');	
                    _this.layer.redraw();
                });
            }
	    },

		onServiceURLChangeEnd: function(){
			_this = this;
			$(this.layer.div).animate({opacity: 1}, 750); 
			this.layer.events.unregister("loadend", this, this.onServiceURLChangeEnd);
			this.model.trigger('load:end');
		}

	});

	return WMSLayerView;
});
		
