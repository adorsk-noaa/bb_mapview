define(
  [
    "jquery",
    "underscore",
    "tinycolor",
    "./Interpolate",
],
function($, _, Tinycolor, Interpolate){

  var getMappedColor = function(opts){
    opts = _.extend({
      normalizedValue: null,
      colormap: null,
      clip: true,
      cast: null
    }, opts);

    colorAttrs = _.keys(opts.colormap);
    mappedColor = {}
    _.each(colorAttrs, function(attr){
      mappedColor[attr] = Interpolate.lerp({
        xs: [opts.normalizedValue],
        curve: opts.colormap[attr],
        clip: opts.clip
      })[0][1];
    });
    if (opts.cast){
      mappedColor[attr] = opts.cast(mappedColor[attr]);
    }
    return mappedColor;
  };

  var generateHSV_BW_Colormap = function(opts){
    opts = _.extend({
      vmin: 0,
      vmax: 1,
      w2b: true
    }, opts);
    var v;
    if (opts.w2b){
      v = [[opts.vmin, 0.0] [opts.vmax, 1.0]];
    }
    else{
      v = [[opts.vmin, 1.0], [opts.vmax, 0.0]];
    }
    return {
      'h': [[opts.vmin, 0]],
      's': [[opts.vmin, 0]],
      'v': v,
    };
  };

  var generateRGB_BW_Colormap = function(opts){
    opts = _.extend({
      vmin: 0,
      vmax: 1,
      w2b: true
    }, opts);
    var points;
    if (opts.w2b){
      points = [[opts.vmin, 0.0], [opts.vmax, 255]];
    }
    else {
      points = [[opts.vmin, 255], [opts.vmax, 0.0]];
    }
    return {
      'r': points,
      'g': points,
      'b': points,
    };
  };

  var convertColor = function(opts){
    opts = _.extend({
      c: null,
      toSchema: 'rgb'
    }, opts);
    var tcolor = tinycolor(opts.c);
    var capSchema = opts.toSchema.charAt(0).toUpperCase() + opts.toSchema.slice(1);
    return tcolor['to' + capSchema]();
  };

  /**
    Generate a set of (v0, v1) bins from the given parameters.
    If 'include_bins' is specified, those bins are merged (see below) into the list
    of generated bins.
    If 'include_values' is specified, bins are generated for each value,
    with each generated bin being 'value_bin_pct_width' wide. These bins are
    then merged into the list of generated bins.
    Merging bins: bins are merged by 'cracking' existing bins in order to fit
    in the new bins.
    For example, if the initial bin list is [(0,5), (5,10)],
    and we merge in (3,7), the merged bin list will be [(0,3),(3,7),(7,10)].
    If a new bin spans multiple existing bins, it will consume them.
    For example, if the initial bin list is [(0,1), (1,2), (2,3), (3,4)]
    and we merge in (0, 2.5), the merged bin list will be [(0,2.5),(2.5,3),(3,4)].
    Note that bins produced by 'include_values' are merged *after* bins from
    'include_bins'. This means that bins 'include_values' takes precedence over
    include_bins.
   **/
  var generateBins = function(opts){
    opts = _.extend({
      vmin: 0,
      vmax: 1,
      numBins: 10,
      includeValues: [],
      includeBins: [],
      valueBinPctWidth: .2,
    }, opts);
    var vmin = opts.vmin;
    var vmax = opts.vmax;
    var numBins = opts.numBins;
    var includeValues = opts.includeValues;
    var includeBins = opts.includeBins;
    var valueBinPctWidth = opts.valueBinPctWidth;

    // Generate the initial bin list.
    var bins = [];
    var vRange = vmax - vmin;
    var binWidth = 0;
    if (numBins > 0){
      binWidth = 1.0 * vRange/numBins;
    }
    for (var i = 0; i < numBins; i++){
      bins.push([vmin + i*binWidth, vmin + (i+1)*binWidth]);
    }
    // Generate bins for include_values.
    var includeValuesBins = [];
    _.each(includeValues, function(v){
      vBinWidth = binWidth * valueBinPctWidth;
      vBin = [v - vBinWidth/2.0, v + vBinWidth/2.0];
      includeValuesBins.push(vBin);
    });

    // Merge in bins from includeBins and includeValues.
    _.each(includeBins.concat(includeValuesBins), function(bin){
      // Get left bin.
      var leftBin = null;
      var sliceStart = null;
      for (var i=0; i < bins.length; i++){
        if (bins[i][0] <= bin[0]){
          leftBin = bins[i];
          sliceStart = i;
        }
        else{
          break;
        }
      }
      if (leftBin && leftBin[1] <= bin[0]){
        leftBin = null;
        sliceStart = bins.length;
      }

      // Get right bin.
      var rightBin = null;
      var sliceEnd = bins.length;
      for (var i=bins.length - 1; i >= 0; i--){
        if (bins[i][1] >= bin[1]){
          rightBin = bins[i];
          sliceEnd = i + 1;
        }
        else{
          break;
        }
      }
      if (rightBin && rightBin[0] >= bin[1]){
        rightBin = null;
        sliceEnd = 0;
      }

      // Replace bins with new bins.
      newBins = [];
      var numtoReplace = 0;
      if (leftBin){
        newBins.push([leftBin[0], bin[0]]);
        numToReplace = 1;
      }
      newBins.push(bin);
      if (rightBin){
        newBins.push([bin[1], rightBin[1]]);
      }

      if (sliceStart == null){
        sliceStart = 0;
      }
      if (sliceEnd == 0){
        numToReplace = 0;
      }
      else{
        numToReplace = sliceEnd - sliceStart;
      }
      bins.splice.apply(bins, [sliceStart, numToReplace].concat(newBins));
    });
    return _.sortBy(bins, function(b){return b[0]});
  };

  var generateColoredBins = function(opts){
    opts = _.extend({
      vmin: 0,
      vmax: 1,
      colormap: null,
      schema: null
    }, opts);

    var coloredBins = [];
    var bins = generateBins(opts);
    var vRange = opts.vmax - opts.vmin;
    _.each(bins, function(bin){
      var binMid = bin[0] + (bin[1] - bin[0])/2.0;
      var normalizedMid = (binMid - opts.vmin)/vRange;
      var binColor = getMappedColor({
        normalizedValue: normalizedMid,
        colormap: opts.colormap,
        clip: true
      });
      if (opts.schema){
        binColor = convertColor({
          c: binColor,
          toSchema: opts.schema
        });
      }
      coloredBins.push([bin, binColor]);
    });
    return coloredBins;
  }

  var COLORMAPS = {};

  //
  // Generate colormaps, based on ColorBrewer.
  //
  var generateColorBrewerColormaps = function(){
    var CB_PREFIX = 'ColorBrewer';
    var MIN_V = .97;
    var MAX_V = .94;
    var MIN_S = 0;
    var MAX_S = .6;

    var CB_HUES = {
      BG: 176,
      Br: 39,
      Bu: 198,
      G: 90,
      Gn: 115,
      Or: 32,
      PR: 277,
      Pi: 324,
      Pu: 252,
      Rd: 18,
    };

    // Sequential.
    _.each(CB_HUES, function(hue, hue_id){
      var cmapId = CB_PREFIX + ':' + hue_id;
      COLORMAPS[cmapId] = {
        'h': [[0, hue],[1, hue]],
        's': [[0, MIN_S], [1, MAX_S]],
        'v': [[0, MIN_V], [1, MAX_V]]
      };
    });

    // Diverging.
    var diverging_hue_pairs = [
      ['Rd', 'Bu'],
      ['Br', 'BG'],
      ['Pi', 'G'],
      ['PR', 'Gn'],
      ['Or', 'Pu']
    ];

    _.each(diverging_hue_pairs, function(orig_pair, i){
      var reversed_pair = [orig_pair[1], orig_pair[0]];
      _.each([orig_pair, reversed_pair], function(pair, j){
        var cmapId = CB_PREFIX + ':' + pair.join('');
        var h1 = CB_HUES[pair[0]];
        var h2 = CB_HUES[pair[1]];
        COLORMAPS[cmapId] = {
          'h': [[0, h1],[.5, h1],[.5, h2],[1, h2]],
          's': [[0, MAX_S], [.5, MIN_S], [.5, MIN_S], [1, MAX_S]],
          'v': [[0, MAX_V], [.5, MIN_V], [.5, MIN_V], [1, MAX_V]]
        };
      });
    });
  };
  generateColorBrewerColormaps();


  var generateColorBarDiv = function(opts){
    opts = _.extend({
      colormap: generateRGB_BW_Colormap(opts),
    }, opts);

    // Initialize colorbar.
    var $cb = $('<div class="colorbar"></div>');
    var $cbInner = $('<div class="inner" style="height: 100%; width: 100%; position: relative;"></div>');
    $cb.append($cbInner);

    var coloredBins = generateColoredBins(_.extend({
      schema: 'hex',
    }, opts));

    var minBin = coloredBins[0][0];
    var maxBin = coloredBins[coloredBins.length - 1][0];
    var xMin = minBin[0];
    var xMax = maxBin[1];
    var xRange = xMax - xMin;
    _.each(coloredBins, function(bin){
      var leftPct = 100 * (bin[0][0] - xMin)/xRange;
      var rightPct = 100 * (bin[0][1] - xMin)/xRange;
      var widthPct = rightPct - leftPct;
      var fillColor = bin[1];
      var $region = $('<div style="position: absolute; top: 0; bottom: 0; left: ' + leftPct + '%; width: ' + widthPct + '%; background-color: #' + fillColor +'"></div>');
      $cbInner.append($region);
    });
    return $cb;
  };

  var exports = {
    COLORMAPS: COLORMAPS,
    getMappedColor: getMappedColor,
    generateHSV_BW_Colormap: generateHSV_BW_Colormap,
    generateRGB_BW_Colormap: generateRGB_BW_Colormap,
    convertColor: convertColor,
    generateBins: generateBins,
    generateColoredBins: generateColoredBins,
    generateColorBarDiv: generateColorBarDiv
  };

  return exports;
});

