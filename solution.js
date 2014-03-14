_u = require('underscore');


/*** SOLUTION ***/

function findSolution(tree) {

  function pairs(numlist) {
    var result = [];
    for (var i = 0; i < numlist.length - 1; i++) {
      result.push([numlist[i], numlist[i+1]]);
    };
    return result;
  }

  function biggestNodes(nodes) {
    return pairs(nodes).map(function(pair) {
      return _u.max(pair)
    })
  }

  function getSum(levels) {
    if (levels.length > 1) {
      return getSum(_u.initial(_u.map(levels, function(level, index) {
        if (index === levels.length-2)
          return _u.map(level, function(number, i) {
            return number + biggestNodes(_u.last(levels))[i]
          })
        return level;
      })));
    } else { // last level
      return _u.first(_u.flatten(levels));
    }
  }

  // explicitly convert nodes to int
  var levels = tree.map(function(layer) {
    return layer.map(function(node) { return parseInt(node) })
  });

  return getSum(levels);
}

/*** /SOLUTION ***/


 // for node and browser compatibility
 (typeof exports !== 'undefined')?exports.findSolution=findSolution:{};
