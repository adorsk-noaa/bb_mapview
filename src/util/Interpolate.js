define(
  [
    "underscore",
],
function(_){

  var bisect = function(opts){
    opts = _.extend({
      a: null,
      x: null,
      lo: 0,
      hi: null
    }, opts);
    var a = opts.a;
    var x = opts.x;
    var lo = opts.lo;
    var hi = opts.hi;
    if (hi == null){
      hi = a.length;
    }
    while (lo < hi){
      var mid = (lo+hi)/2;
      if (x < a[mid]){
        hi = mid;
      }
      else{
        lo = mid+1;
      }
    }
    return lo;
  };

  var lerp = function(opts){
    opts = _.extend({
      xs: null,
      curve: null,
      clip: false
    }, opts);
    var xs = opts.xs;
    var curve = opts.curve;
    var clip = opts.clip;

    var interpolatedPoints = [];
    var sortedCurve = _.sortBy(curve, function(p){return p[0]});
    sortedXs = _.map(sortedCurve, function(p){return p[0]});
    _.each(xs, function(x){
      if (clip){
        if (x < sortedXs[0]){
          interpolatedPoints.push((x, sortedCurve[0][1]));
          return;
        }
        else if(x > sortedXs[sortedXs.length - 1]){
          interpolatedPoints.push((x, sortedCurve[sortedXs.length - 1][1]));
          return;
        }
      }

      xMinIdx = Math.min(bisect(sortedXs, x) - 1, sortedXs.length - 1);
      xMin = sortedXs[xMinIdx];

      if (x == xMin){
        interpolatedPoints.push(sortedCurve[xMinIdx]);
        return;
      }

      xMaxIdx = Math.min(bisect(sortedXs, x), sortedXs.length - 1);
      xMax = sortedXs[xMaxIdx];
      if (x == xMax){
        interpolatedPoints.push(sortedCurve[xMaxIdx]);
        return
      }

      xRange = xMax - xMin;
      yMin = sortedCurve[xMinIdx][1];
      yMax = sortedCurve[xMaxIdx][1];
      yRange = yMax - yMin;
      if (xRange != 0){
        xNormalized = (x - xMin)/xRange;
        y = yMin + (xNormalized * yRange);
      }
      else {
        y = yMin;
      }
      interpolatedPoints.push([x,y]);
    });
    return interpolatedPoints;
  };

  var exports = {
    bisect: bisect,
    lerp: lerp
  };
  return exports;
});
