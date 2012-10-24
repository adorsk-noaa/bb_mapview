define([
	"jquery",
	"backbone",
	"underscore",
	"_s",
	"ui",
	"./layer_editor",
	"./data_layer_editor",
	"text!./templates/layer_collection_editor_row.html"
		],
function($, Backbone, _, _s, ui, LayerEditorView, DataLayerEditorView, row_template){

	var LayerCollectionEditorView = Backbone.View.extend({

		events: {
		},

		initialize: function(options){
			$(this.el).addClass('layer-collection-editor');
			this.layers = this.model.get('layers');

			// Set sorting to be by index.
			this.layers.comparator = function(l1, l2){
				index_l1 = l1.get('index') || 0;
				index_l2 = l2.get('index') || 0;
				if (index_l1 > index_l2){
					return -1;
				}
				else if( index_l1 < index_l2){
					return 1;
				}
				else{
					return 0;
				}
			};
			this.layers.sort();

			this.registry = {};
			this.initialRender();

            this.on('remove', this.remove, this);
		},

		initialRender: function(){
			this.$body = $('<div class="body-table"></div>');
			$(this.el).append(this.$body);

			// Make table sortable.
			var _this = this;
			this.$body.sortable({
				handle: '.layer-editor-drag-handle',
				scroll: false,
				placeholder: "ui-state-highlight",
				stop: function(e, ui){
					_this.onSortStop.call(_this, e, ui);
				},
				forcePlaceholderSize: true,
			});

			// Setup layers.
			_.each(this.layers.models, function(layer){
				this.addLayerWidget(layer);
			}, this);

            // Initialize layer indices.
            this.onSortStop();

		},

		onSortStop: function(e, ui){
			var start_index = this.model.get('start_index') || 0;

			var ordered_cids = this.$body.sortable('toArray');
			_.each(ordered_cids, function(cid, i){
				var local_index = ordered_cids.length - 1 - i;
				this.registry[cid].model.set('index', start_index + local_index);
			}, this);
			this.layers.sort();
		},

		computeLayerIndex: function(layer){
			var collection_start_index = this.model.get('start_index') || 0;
			return category_start_index + category_index;
		},

        getLayerEditorClass: function(layer){
			if (layer.get('layer_category') == 'data'){
				return DataLayerEditorView;
            }
			else{
                return LayerEditorView;
            }
        },

		addLayerWidget: function(layer){
			// Create row for layer widget.
			$row = $(_.template(row_template, {model: layer}));
			
			// Create editor for layer.
			var layer_editor;
            EditorClass = this.getLayerEditorClass(layer);
            layer_editor = new EditorClass({
                model: layer,
                         el: $('.layer-editor', $row)
            });

			// Add to registry.
			this.registry[layer.cid] = {
				'model': layer,
				'$row': $row,
				'editor': layer_editor,
			};

			// Append row to table.
			this.$body.append($row);

			// Refresh table.
			this.$body.sortable('refresh');
		},

        remove: function(){
	        Backbone.View.prototype.remove.apply(this, arguments);
            _.each(this.registry, function(item, id){
                item.editor.trigger("remove");
                delete this.registry[id];
            }, this);
            this.model.trigger('remove');
            this.model.off();
            this.off();
        }

			
	});

	return LayerCollectionEditorView;
});
		
