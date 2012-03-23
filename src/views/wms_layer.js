define([
	"jquery",
	"use!backbone",
	"use!underscore",
	"use!openlayers",
	"./layer",
		],
function($, Backbone, _, ol, LayerView){

	var WMSLayerView = LayerView.extend({

		setup: function(){
			this.layer = new OpenLayers.Layer.WMS(
				this.model.get('name'),
				this.model.get('service_url'),
				this.model.get('params'),
				this.model.get('options')
			);

		},

		// Update layer parameters.
		updateParams: function(){
			var _this = this;
			this.trigger('render:start');
	

			$(this.layer.div).animate({
				opacity: 0
			},500, function(){

				load_end_func = function(){
					$(_this.layer.div).animate({opacity: 1}, 500);
				};
				_this.layer.clearGrid();
				_this.layer.events.register("loadend", _this, _this.mergeParamsEnd);
				_this.layer.mergeNewParams(_this.model.get('params'));	
			});
	    },

		mergeParamsEnd: function(){
			_this = this;
			$(this.layer.div).animate({opacity: 1}, 750); 
			this.layer.events.unregister("loadend", this, this.mergeParamsEnd);
			this.trigger('render:end');
		}

	});

	return WMSLayerView;
});
		
