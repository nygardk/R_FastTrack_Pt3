_u = require('underscore');

function findSolution(treearray) {

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

  function sumToLast(tree, sumlevel) {
    return _u.initial(tree).concat([_u.map(_u.last(tree), function(node, index) {
      return node + sumlevel[index]
    })]);
  }

  function getSum(tree) {
    if (tree.length > 1)
      return getSum(sumToLast(_u.initial(tree),
                              biggestNodes(_u.last(tree))) );
    return _u.first(_u.flatten(tree));
  }

  // explicitly convert nodes to int
  var tree = treearray.map(function(level) {
    return level.map(function(node) { return parseInt(node) })
  });

  return getSum(tree);
}


 // for node
 exports.findSolution = findSolution;
