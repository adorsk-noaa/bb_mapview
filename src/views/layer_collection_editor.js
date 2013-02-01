define(
  [
    "jquery",
    "backbone",
    "underscore",
    "_s",
    "ui",
    "./layer_editor",
    "./data_layer_editor",
    "./VectorDataLayerEditor",
    "text!./templates/layer_collection_editor_row.html"
],
function($, Backbone, _, _s, ui, LayerEditorView, DataLayerEditorView, VectorDataLayerEditorView, row_template){

  var LayerCollectionEditorView = Backbone.View.extend({

    initialize: function(opts){
      opts = _.extend({
        sortable: true,
        selectable: 'multiple',
        startIndex: 0,
      }, opts);

      $(this.el).addClass('layer-collection-editor');
      this.layers = this.model.get('layers');

      this.sortable = opts.sortable;
      this.selectable = opts.selectable;
      this.startIndex = opts.startIndex;

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
      this.$body = $('<div class="body-table"></div>').appendTo(this.el);

      if (this.sortable){
        var _this = this;
        this.$body.sortable({
          handle: '.layer-editor-drag-handle',
          scroll: false,
          placeholder: "ui-state-highlight",
          stop: function(e, ui){
            _this.setLayerIndices.call(_this, e, ui);
          },
          forcePlaceholderSize: true,
        });
      }

      // Setup layers.
      _.each(this.layers.models, function(layer){
        this.addLayerWidget(layer);
      }, this);

      // Initialize layer indices.
      this.setLayerIndices();
    },

    setLayerIndices: function(){
      if (this.sortable){
        var rowIds = this.$body.sortable('toArray');
        _.each(rowIds, function(rowId, i){
          var localIndex = rowIds.length - 1 - i;
          this.registry[rowId].model.set('index', this.startIndex + localIndex);
        }, this);
        this.layers.sort();
      }
    },

    getLayerEditorClass: function(layer){
      if (layer.get('layer_category') == 'data'){
        if (layer.get('layer_type') == 'Vector'){
          return VectorDataLayerEditorView;
        }
        else{
          return DataLayerEditorView;
        }
      }
      else{
        return LayerEditorView;
      }
    },

    addLayerWidget: function(layerModel){

      // Create editor for layer.
      var layer_editor;
      var EditorClass = this.getLayerEditorClass(layerModel);
      var layerEditor = new EditorClass({
        model: layerModel,
      });

      // Create row for editor.
      var rowId = this.cid + '-' + layerEditor.cid;
      var $row = $(_.template(row_template, {rowId: rowId}));
      var $rowHeader = $('.layer-editor-header-row', $row);
      var $rowBody = $('.layer-editor-body-row', $row);
      var $bodyCell = $('.body-cell', $rowBody);
      var $titleButton = $('.title-button', $rowHeader);
      var $toggleIcon = $('.toggle-icon', $titleButton)
      var $titleContainer = $('.title-container', $titleButton);
      var $bodyContainer = $('.body-container', $rowBody);
      var numCols = 1;

      // Setup title.
      $titleContainer.append(layerEditor.$title);
      var toggleFunc = function(){
        var toggleText;
        if (layerEditor.$body.is(':hidden')){
          layerEditor.$body.slideDown();
          toggleText = '-';
          layerModel.set('expanded', true);
        }
        else{
          layerEditor.$body.slideUp();
          toggleText = '+';
          layerModel.set('expanded', false);
        }
        $toggleIcon.html(toggleText);
      };
      $titleButton.on('click', toggleFunc);

      // Setup body.
      $bodyContainer.append(layerEditor.$body);

      // Set expanded state.
      if (layerModel.get('expanded')){
        toggleFunc();
      };

      // Setup controls.
      if (this.sortable){
        numCols++;
        var $dragHandle = $('<td class="drag-handle-container"><div class="layer-editor-drag-handle"></div></td>');
        $rowHeader.append($dragHandle);
      }

      if (this.selectable){
        numCols++;
        var $optionContainer = $('<td class="option-container"></td>');
        var $optionWidget;
        if (this.selectable == 'multiple'){
          $optionWidget = $('<input type="checkbox">');
        }
        else if (this.selectable == 'single'){
          $optionWidget = $('<input type="radio" name="' + this.cid + '-select">');
        }
        $optionWidget.prop('checked', ! layerModel.get('disabled'));
        $optionWidget.on('change', function(){
          layerModel.set('disabled', ! $optionWidget.prop('checked'));
        });
        $optionContainer.append($optionWidget);
        $rowHeader.append($optionContainer);
      }

      $bodyCell.attr('colspan', numCols);

      // Set disabled state.
      if (layerModel.get('disabled')){
        $row.addClass('disabled');
      }
      layerModel.on('change:disabled', function(){
        $row.toggleClass('disabled', layerModel.get('disabled'))
      });

      // Set expanded state.

      // Add to registry.
      this.registry[rowId] = {
        'model': layerModel,
        '$row': $row,
        'editor': layerEditor,
      };

      // Add to body.
      this.$body.append($row);

      if (this.sortable){
        this.$body.sortable('refresh');
      }

    },

    toggleLayerForm: function(e){
      var toggleText;
      if (this.$body.is(':hidden')){
        this.$body.slideDown();
        toggleText = '-';
      }
      else{
        this.$body.slideUp();
        toggleText = '+';
      }

      this.$arrow.html(toggleText);
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

