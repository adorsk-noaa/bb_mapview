define(
  [
    "underscore",
    "tinycolor",
    "underscore",
    "./Interpolate",
],
function(_, tinycolor, Interpolate){

  var getMappedColor = function(opts){
    opts = _.extend({
      normalizedValue: null,
      colormap: null,
      clip: true,
      cast: null
    }, opts);

    colorAttrs = colormap.keys()
    mappedColor = {}
    _.each(colorAttr, function(attr){
      mappedColor[attr] = Interpolate.lerp({
        xs: [normalized_value], 
        curve: colormap[attr], 
        clip: clip
      })[0][1];
    });
    if (cast){
      mappedColor[attr] = cast(mappedColor[attr]);
    }
    return mappedColor;
  };

  var generateHSV_BW_Colormap = function(opts){
    opts = _.extend({
      vMin: 0,
      vMax: 1,
      w2b: true
    }, opts);
    var v;
    if (opts.w2b){
      v = [[opts.vMin, 0.0] [opts.vMax, 1.0]];
    }
    else{
      v = [[opts.vMin, 1.0], [opts.vMax, 0.0]];
    }
    return {
      'h': [[opts.vMin, 0]],
      's': [[opts.vMin, 0]],
      'v': v,
    };
  };

  var generateRGB_BW_Colormap = function(opts){
    opts = _.extend({
      vMin: 0,
      vMax: 1,
      w2b: true
    }, opts);
    var points;
    if (opts.w2b){
      points = [[opts.vMin, 0.0], [opts.vMax, 255]];
    }
    else {
      points = [[opts.vMin, 255], [opts.vMax, 0.0]];
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
    var capSchema = opts.toSchema.toSchema.charAt(0).toUpperCase() + toSchema.slice(1);
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
      vMin: 0,
      vMax: 1,
      numBins: 10,
      includeValues: [],
      includeBins: [],
      valueBinPctWidth: .2,
    }, opts);
    var vMin = opts.vMin;
    var vMax = opts.vMax;
    var numBins = opts.numBins;
    var includeValues = opts.includeValues;
    var includeBins = opts.includeBins;
    var valueBinPctWidth = opts.valueBinPctWidth;

    // Generate the initial bin list.
    var bins = [];
    var vRange = vMax - vMin;
    var binWidth = 0;
    if (numBins > 0){
      binWidth = 1.0 * vRange/numBins;
    }
    for (var i = 0; i < numBins; i++){
      bins.push([vMin + i*binWidth, vMin + (i+1)*binWidth]);
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
      vMin: 0,
      vMax: 1,
      colormap: null,
      schema: null
    }, opts);

    var coloredBins = [];
    var bins = generateBins(opts);
    vRange = vMax - vMin;
    _.each(bins, function(bin){
      var binMid = bin[0] + (bin[1] - bin[0])/2.0;
      var normalizedMid = (binMid - vMin)/vRange;
      var binColor = getMappedColor({
        normalizedValue: normalizedMid,
        colormap: colormap,
        clip: true
      });
      if (schema){
        binColor = convertColor({
          c: binolor,
          toSchema: schema
        });
      }
      coloredBins.push([bin, binColor]);
    });
    return coloredBins;
  }

  var testColormap = function(){
    var vMin = 0;
    var vMax = 4;
    var numBins = 4;

    var testName, actual, expected;
    var reportResult = function(){
      jsonA = JSON.stringify(actual);
      jsonE = JSON.stringify(expected);
      if (jsonA == jsonE){
        console.log(testName, 'passes');
      }
      else{
        console.log(testName, 'failed');
        console.log('actual', jsonA);
        console.log('expected', jsonE);
      }
    };

    testName = 'simple';
    actual = generateBins({
      vMin: vMin,
      vMax: vMax,
      numBins: numBins
    });
    expected = [[0,1], [1,2], [2,3],[3,4]];
    reportResult();

    testName = 'includeBins';
    actual = generateBins({
      vMin: vMin,
      vMax: vMax,
      numBins: numBins,
      includeBins: [[1.5,2.5]]
    });
    expected = [[0,1], [1,1.5], [1.5, 2.5], [2.5,3],[3,4]];
    reportResult();

    testName = 'leftEdge';
    actual = generateBins({
      vMin: vMin,
      vMax: vMax,
      numBins: numBins,
      includeBins: [[-2, -1]]
    });
    expected = [[-2,-1], [0,1], [1,2], [2,3], [3,4]];
    reportResult();

    testName = 'rightEdge';
    actual = generateBins({
      vMin: vMin,
      vMax: vMax,
      numBins: numBins,
      includeBins: [[5, 6]]
    });
    expected = [[0,1], [1,2], [2,3], [3,4], [5,6]];
    reportResult();

    testName = 'span left edge';
    actual = generateBins({
      vMin: vMin,
      vMax: vMax,
      numBins: numBins,
      includeBins: [[-.5, .5]]
    });
    expected = [[-.5, .5],[.5,1], [1,2], [2,3], [3,4]];
    reportResult();

    testName = 'span right edge';
    actual = generateBins({
      vMin: vMin,
      vMax: vMax,
      numBins: numBins,
      includeBins: [[3.5, 4.5]]
    });
    expected = [[0, 1], [1,2], [2,3], [3,3.5], [3.5, 4.5]];
    reportResult();

    testName = 'Spanning both edges'
    actual = generateBins({
      vMin: vMin,
      vMax: vMax,
      numBins: numBins,
      includeBins: [[-.5, 4.5]]
    });
    expected = [[-.5, 4.5,]];
    reportResult();

    testName = 'Multiple'
    actual = generateBins({
      vMin: vMin,
      vMax: vMax,
      numBins: numBins,
      includeBins: [[.5, 1.5], [2.5, 3.5]]
    });
    expected = [[0,.5], [.5,1.5], [1.5, 2], [2, 2.5],[2.5, 3.5], [3.5,4]];
    reportResult();

    testName = 'Include values'
    actual = generateBins({
      vMin: vMin,
      vMax: vMax,
      numBins: numBins,
      includeValues: [2],
      valueBinPctWidth: .2,
    });
    expected = [[0,1], [1,1.9], [1.9, 2.1], [2.1,3], [3,4]];
    reportResult();

    testName = 'Include bins and values'
    actual = generateBins({
      vMin: vMin,
      vMax: vMax,
      numBins: numBins,
      includeBins: [[1.5, 2.5]],
      includeValues: [2],
      valueBinPctWidth: .2,
    });
    expected = [[0,1], [1,1.5], [1.5, 1.9], [1.9, 2.1], [2.1, 2.5], [2.5, 3], [3,4]];
    reportResult();
  };

  var exports = {
    getMappedColor: getMappedColor,
    generateHSV_BW_Colormap: generateHSV_BW_Colormap,
    generateRGB_BW_Colormap: generateRGB_BW_Colormap,
    convertColor: convertColor,
    generateBins: generateBins,
    generateColoredBins: generateColoredBins,
    testColormap: testColormap
  };

  return exports;
});
