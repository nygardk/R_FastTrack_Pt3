/* Reads tree from file
 * @param filename {string}
 * @return deferred content {string}
 */
function readTree(filename) {
  var r = $.Deferred();
  var file = new XMLHttpRequest();
  file.open('GET', filename, false);
  file.onreadystatechange = function() {
    if (file.readyState === 4 && file.status === 200) {
      return r.resolve(file.responseText);
    }
  }
  file.send(null); // close
  return r;
}

/* Reads tree lines into array
 * Filters commented and empty lines out
 * Casts values to int
 * @param content {string}
 * @return lines {array}
 */
function readLinesIntoArray(content) {
  return content.split("\n").filter(function(line) {
     return (line.indexOf('#') === -1 && line !== '')
   }).map(function(line) {
      return line.split(" ").map(function(node) {
        return parseInt(node);
    });
  });
}

/* Creates collated pairs of a list
 * Example:
 *   input:  [1,2,3,4,5]
 *   output: [[1,2],[2,3],[3,4],[4,5]]
 * @param list {array}
 * @return pair-arrays {array}
 */
function pairs(list) {
  var result = [];
  for (var i = 0; i < list.length - 1; i++) {
    result.push([list[i], list[i+1]]);
  };
  return result;
}

/* Selects best indexes
 * @param list {array}
 * @return list of best indexes {array}
 */
function selectBestIndexes(list) {
  return pairs(list).map(function(pair) {
    return (pair[0] > pair[1]) ? 0 : 1;
  });
}

/* Returns values from list by choice indexes
 * @param list {array}
 * @return list of best indexes {array}
 */
function valuesByChoices(list, indexes) {
  if (list.length !== indexes.length+1)
    throw new Error ("list length have to be indexes.length+1");
  return pairs(list).map(function(pair, i) {
    return pair[indexes[i]];
  });
}

/* Sum individiual list items to the last list of tree
 */
function sumToLast(tree, list) {
  if (!list.length) return tree;
  if (_.last(tree).length !== list.length)
    throw new Error ("last list length in tree and given list do not match");
  var result = _.initial(tree);
  result.push(_.last(tree).map(function(item, i) {return item + list[i] }));
  return result;
}

/* Reads tree and creates indexmap of choices
 * for the best path, where value 0 represents
 * ignored path for current (cumulated) i and
 * value 1 represents the best path
 * Example:
 *   input =  [ [10], [11,5], [8,12,1], [3,4,55,12] ]
 *   output = [ [0], [1,0], [1,1,0] ]
 * @param tree {array}
 * @return indexmap {array}
 */
function indexMap(tree) {
  var indexmap = [];

  function reducePath(tree) {
    if (tree.length > 1) {
      var choices = selectBestIndexes(_.last(tree));
      indexmap.push(choices);

      return reducePath(sumToLast(_.initial(tree),
                        valuesByChoices(_.last(tree), choices)));
    }
    return tree;
  }

  var reduced = reducePath(tree);
  console.log("Sum:", _.flatten(reduced)[0]); // outputs sum for debugging

  return indexmap.reverse(); // indexmap is created from bottom up
}

/* Reads tree and creates a simplified
 * binarymap where value 0 represents turn to first (=left)
 * choice and 1 represents a turn to latter (=right) choice
 * @param tree {array}
 * @return binaryMap {array}
 */
function binaryMap(tree) {
  var imap = indexMap(tree);
  console.log(imap);

  var result = [];
  imap.forEach(function(level) {
    var position = _.filter(result, function(num) { return num === 1 }).length;
    result.push(level[position]);
  });

  return result;
}

/* Run game
 *
 */
function game(tree, binarymap) {
  var config = {};

  config.heightX = $('#numbers').height();

  $('#numbers').animate({bottom: -config.heightX}, 3000);
}

/* Load tree and start game
 */
$(document).ready(function() {
  var tree, binarymap;

  readTree('tree.txt').done(function(content) {
    tree = readLinesIntoArray(content);
    binarymap = binaryMap(tree);
    // console.log(tree);
    // console.log(binarymap);
    game();
  })
});
