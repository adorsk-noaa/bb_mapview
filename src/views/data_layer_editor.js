define([
    "jquery",
    "backbone",
    "underscore",
    "_s",
    "ui",
    "./layer_editor",
    "./color_scale_form"
    ],
    function($, Backbone, _, _s, ui, LayerEditorView, ColorScaleForms){

      var DataLayerEditorView = LayerEditorView.extend({

        initialize: function(){
          $(this.el).addClass('data-layer-editor');
          _.each(['data_entity', 'geom_entity', 'grouping_entities'], function(entity_attr){
            var entity_model = this.model.get(entity_attr);
            if (! entity_model){
              entity_model = new Backbone.Model();
              this.model.set(entity_attr, entity_model);
            }
            entity_model.on('change', function(){
              this.model.trigger(_s.sprintf('change:%s' , entity_attr));
            }, this);
          }, this);
          LayerEditorView.prototype.initialize.call(this);
        },

      renderFormElements: function(){
        LayerEditorView.prototype.renderFormElements.call(this);

        var data_entity = this.model.get('data_entity');
        var scale_type = data_entity.get('color_scale_type') || 'mono';
        var scale_class;
        if (scale_type == 'mono'){
          scale_class = ColorScaleForms.Mono;
        }
        else if (scale_type == 'bi'){
          scale_class = ColorScaleForms.Bi;
        }
        this.color_scale_form = new scale_class({
          model: data_entity
        });

        this.$layer_form.append(this.color_scale_form.el);

      },

      remove: function(){
        this.color_scale_form.trigger('remove');
        LayerEditorView.prototype.remove.call(this, arguments);
      }
      });

      return DataLayerEditorView;
    });








