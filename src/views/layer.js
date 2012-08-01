define([
	"jquery",
	"use!backbone",
	"use!underscore",
	"use!openlayers",
		],
function($, Backbone, _, ol){

	var LayerView = Backbone.View.extend({

		initialize: function(){
            this.layer = this.createLayer();

			this.model.on('change:params', this.updateParams, this);
			this.model.on('change:params', this.updateParams, this);
			this.model.on('change:visible', this.onVisibleChange, this);
			this.model.on('change:opacity', this.onOpacityChange, this);
		},

        createLayer: function(){
            return {};
        },

        postInitialize: function(){
			this.layer.events.register("loadstart", this, this.onLoadStart);
			this.layer.events.register("loadend", this, this.onLoadEnd);
        },

		onLoadStart: function(){
			this.model.trigger('load:start');
		},

		onLoadEnd: function(){
			this.model.trigger('load:end');
		},

		// Update layer parameters.
		updateParams: function(){
			var _this = this;
			this.model.trigger('load:start');
	

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
			this.model.trigger('load:end');
		},

		onVisibleChange: function(){
			this.layer.setVisibility(this.model.get('visible'));
		},

		onOpacityChange: function(){
			this.layer.setOpacity(this.model.get('opacity'));
		},

		deactivate: function(){
			this.layer.setVisibility(false);
		},

		activate: function(){
			this.layer.setVisibility(! this.model.get('visible'));
		},
				
	});

	return LayerView;
});
		
