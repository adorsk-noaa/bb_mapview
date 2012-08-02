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
			this.on('remove', this.remove, this);
		},

        createLayer: function(){
            return {};
        },

        postInitialize: function(){
			this.layer.events.register("loadstart", this, this.onLoadStart);
			this.layer.events.register("loadend", this, this.onLoadEnd);
        },

        // These functions trigger a fade animation,
        // and return a promise object that will resolve
        // when the animation completes.
        fadeOut: function(){
            var anim = $(this.layer.div).animate({opacity: .5},500);
            return anim.promise();
        },

        fadeIn: function(){
            var anim = $(this.layer.div).animate({opacity: 1}, 500);
            return anim.promise();
        },

		onLoadStart: function(){
            var _this = this;
            _this.loadTimeout = setTimeout(function(){
                _this.loadTimeout = null;
                _this.fadeOut().then(function(){
                    _this.model.trigger('load:start');
                });
            }, 1000);
		},

		onLoadEnd: function(){
            var _this = this;
            if (_this.loadTimeout){
                clearTimeout(_this.loadTimeout);
                _this.loadTimeout = null;
                _this.model.trigger('load:start');
                _this.model.trigger('load:end');
            }
            else{
                var tmpOnLoadStart = function(){
                    _this.model.off(null, tmpOnLoadStart);
                    _this.fadeIn().then(function(){
                        _this.model.trigger('load:end');
                    });
                };
                _this.model.on('load:start', tmpOnLoadStart);
            }
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

        remove: function(){
            Backbone.View.prototype.remove.call(this, arguments);
            this.layer.destroy();
            this.model.trigger('remove');
            this.model.off();
            this.off();
        }
				
	});

	return LayerView;
});
		
