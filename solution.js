_u = require('underscore');


/*** SOLUTION ***/

function findSolution(tree) {

  function sumArrayValues(arrayTo, arrayFrom) {
    return arrayTo.map(function(val, index) { // fix
      if (index > arrayFrom.length-1) return val;
      return val + arrayFrom[index];
    });
  }

  function pairs(numlist) {

    return _u.compact(numlist.map(function(number, index, list) {
      if (index === list.length-1) return null;
      return [number, list[index+1]];
    }))
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

  // explicitly convert nodes to int and reverse order
  var levels = tree.map(function(layer) {
    return layer.map(function(node) { return parseInt(node) })
  });

  console.log(getSum(levels));
}

/*** /SOLUTION ***/


 // for node and browser compatibility
 (typeof exports !== 'undefined')?exports.findSolution=findSolution:{};
