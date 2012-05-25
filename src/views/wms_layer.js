define([
	"jquery",
	"use!backbone",
	"use!underscore",
	"use!openlayers",
	"./layer",
		],
function($, Backbone, _, ol, LayerView){

	var WMSLayerView = Backbone.View.extend({

		initialize: function(){

			this.layer = new OpenLayers.Layer.WMS(
				this.model.get('name'),
				this.model.get('service_url'),
				this.model.get('params'),
				_.extend({}, this.model.get('options'),{
					visibility: ! this.model.get('disabled'),
					opacity: this.model.get('opacity'),
				})
			);
			this.layer.setZIndex(this.model.get('index'));

			this.layer.events.register("loadstart", this, this.onLoadStart);
			this.layer.events.register("loadend", this, this.onLoadEnd);

			this.model.on('change:service_url', this.onServiceURLChange, this);
			this.model.on('change:params', this.updateParams, this);
			this.model.on('change:disabled', this.onDisabledChange, this);
			this.model.on('change:opacity', this.onOpacityChange, this);
			this.model.on('change:index', this.onIndexChange, this);
		},

		onLoadStart: function(){
			this.trigger('load:start');
		},

		onLoadEnd: function(){
			this.trigger('load:end');
		},

		onServiceURLChange: function(){
			var _this = this;
			this.trigger('load:start');

			$(this.layer.div).animate({
				opacity: .5
			},500, function(){

				load_end_func = function(){
					$(_this.layer.div).animate({opacity: 1}, 500);
				};
				_this.layer.clearGrid();
				_this.layer.events.register("loadend", _this, _this.onServiceURLChangeEnd);
				_this.layer.url = _this.model.get('service_url');	
				_this.layer.redraw();
			});
	    },

		onServiceURLChangeEnd: function(){
			_this = this;
			$(this.layer.div).animate({opacity: 1}, 750); 
			this.layer.events.unregister("loadend", this, this.onServiceURLChangeEnd);
			this.trigger('load:end');
		},

		// Update layer parameters.
		updateParams: function(){
			var _this = this;
			this.trigger('load:start');
	

			$(this.layer.div).animate({
				opacity: .5
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
			this.trigger('load:end');
		},

		onDisabledChange: function(){
			this.layer.setVisibility(! this.model.get('disabled'));
		},

		onOpacityChange: function(){
			this.layer.setOpacity(this.model.get('opacity'));
		},

		onIndexChange: function(){
			this.layer.setZIndex(this.model.get('index'));
		},


	});

	return WMSLayerView;
});
		
