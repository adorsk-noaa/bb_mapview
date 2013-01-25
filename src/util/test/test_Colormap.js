define(
  [
    "../Colormap",
],
function(Colormap){

  var test_generateBins = function(){
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
    actual = Colormap.generateBins({
      vMin: vMin,
      vMax: vMax,
      numBins: numBins
    });
    expected = [[0,1], [1,2], [2,3],[3,4]];
    reportResult();

    testName = 'includeBins';
    actual = Colormap.generateBins({
      vMin: vMin,
      vMax: vMax,
      numBins: numBins,
      includeBins: [[1.5,2.5]]
    });
    expected = [[0,1], [1,1.5], [1.5, 2.5], [2.5,3],[3,4]];
    reportResult();

    testName = 'leftEdge';
    actual = Colormap.generateBins({
      vMin: vMin,
      vMax: vMax,
      numBins: numBins,
      includeBins: [[-2, -1]]
    });
    expected = [[-2,-1], [0,1], [1,2], [2,3], [3,4]];
    reportResult();

    testName = 'rightEdge';
    actual = Colormap.generateBins({
      vMin: vMin,
      vMax: vMax,
      numBins: numBins,
      includeBins: [[5, 6]]
    });
    expected = [[0,1], [1,2], [2,3], [3,4], [5,6]];
    reportResult();

    testName = 'span left edge';
    actual = Colormap.generateBins({
      vMin: vMin,
      vMax: vMax,
      numBins: numBins,
      includeBins: [[-.5, .5]]
    });
    expected = [[-.5, .5],[.5,1], [1,2], [2,3], [3,4]];
    reportResult();

    testName = 'span right edge';
    actual = Colormap.generateBins({
      vMin: vMin,
      vMax: vMax,
      numBins: numBins,
      includeBins: [[3.5, 4.5]]
    });
    expected = [[0, 1], [1,2], [2,3], [3,3.5], [3.5, 4.5]];
    reportResult();

    testName = 'Spanning both edges'
    actual = Colormap.generateBins({
      vMin: vMin,
      vMax: vMax,
      numBins: numBins,
      includeBins: [[-.5, 4.5]]
    });
    expected = [[-.5, 4.5,]];
    reportResult();

    testName = 'Multiple'
    actual = Colormap.generateBins({
      vMin: vMin,
      vMax: vMax,
      numBins: numBins,
      includeBins: [[.5, 1.5], [2.5, 3.5]]
    });
    expected = [[0,.5], [.5,1.5], [1.5, 2], [2, 2.5],[2.5, 3.5], [3.5,4]];
    reportResult();

    testName = 'Include values'
    actual = Colormap.generateBins({
      vMin: vMin,
      vMax: vMax,
      numBins: numBins,
      includeValues: [2],
      valueBinPctWidth: .2,
    });
    expected = [[0,1], [1,1.9], [1.9, 2.1], [2.1,3], [3,4]];
    reportResult();

    testName = 'Include bins and values'
    actual = Colormap.generateBins({
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
    test_generateBins: test_generateBins
  };
});
