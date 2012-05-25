define([
	"jquery",
	"use!backbone",
	"use!underscore",
	"_s",
	"use!ui",
	"./layer_editor",
	"text!./templates/layer_collection_editor_row.html"
		],
function($, Backbone, _, _s, ui, LayerEditorView, row_template){

	var LayerCollectionEditorView = Backbone.View.extend({

		events: {
			'change .layer-toggle-cb': 'onLayerToggleChange'
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
		},

		initialRender: function(){
			this.$tbody = $('<tbody></tbody>');
			$(this.el).append($('<table></table>').append(this.$tbody));

			// Make table sortable.
			var _this = this;
			this.$tbody.sortable({
				//containment: this.$tbody,
				handle: '.drag-handle',
				scroll: false,
				placeholder: "ui-state-highlight",
				forcePlaceholderSize: true,
				forceHelperSize: true,
				stop: function(e, ui){
					_this.onSortStop.call(_this, e, ui);
				},
				helper: function(e, tr){
					var $originals = tr.children();
					var $helper = tr.clone();
					$helper.children().each(function(index){
							$(this).width($originals.eq(index).width())
					});
					return $helper;
				}
			});

			// Setup layers.
			_.each(this.layers.models, function(layer){
				this.addLayerWidget(layer);
			}, this);

		},

		onSortStop: function(e, ui){
			var start_index = this.model.get('start_index') || 0;

			var ordered_cids = this.$tbody.sortable('toArray');
			_.each(ordered_cids, function(cid, i){
				var local_index = ordered_cids.length - 1 - i;
				this.registry[cid].layer.set('index', start_index + local_index);
			}, this);
			this.layers.sort();
			console.log(this.layers.models);
		},

		computeLayerIndex: function(layer){
			var collection_start_index = this.model.get('start_index') || 0;
			return category_start_index + category_index;
		},

		addLayerWidget: function(layer){
			// Create row for layer widget.
			$row = $(_.template(row_template, {model: layer}));
			
			// Create editor for layer.
			var layer_editor = new LayerEditorView({
				model: layer,
				el: $('.layer-editor', $row)
			});

			// Get toggle.
			var $toggle = $('.layer-toggle-cb', $row);

			// Add to registry.
			this.registry[layer.cid] = {
				'layer': layer,
				'$row': $row,
				'editor': layer_editor,
				'$toggle': $toggle
			};

			// Set layer toggle.
			this.setLayerToggle(layer);

			// Append row to table.
			this.$tbody.append($row);

			// Refresh table.
			this.$tbody.sortable('refresh');
		},

		onLayerToggleChange: function(e){
			var $toggle = $(e.currentTarget);
			var cid = $toggle.data('cid');
			this.registry[cid].layer.set('disabled', ! $toggle.is(':checked'));
		},

		setLayerToggle: function(layer){
			$toggle = this.registry[layer.cid].$toggle;
			$toggle.attr('checked', ! layer.get('disabled'));
		}
			
	});

	return LayerCollectionEditorView;
});
		
