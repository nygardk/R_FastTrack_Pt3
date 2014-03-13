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

/*
 *
 */
function pairs(list) {
  var result = [];
  for (var i = 0; i < list.length - 1; i++) {
    result.push([list[i], list[i+1]]);
  };
  return result;
}

/* Selects best indexes
 *
 */
function selectBestIndexes(list) {
  return pairs(list).map(function(pair) {
    return (pair[0] > pair[1]) ? 0 : 1;
  });
}

/* Returns values from list by choice indexes
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
  if (_.last(tree).length !== list.length)
    throw new Error ("last list length in tree and given list do not match");
  return _.initial(tree).push(_.last(tree).map(function(item, i) {
    return item + list[i];
  }));
}

/* Reads tree and creates a binary map for path,
 * where value 0 represents the first (=left) choice
 * and 1 represents the latter (=right) choice
 * @param tree {array}
 * @return binaryMap {array}
 */
function binaryMap(tree) {
  var binaryMap = [];

  /*
   *
   */
  function findPath(tree) {
    if (tree.length > 0) {
      var choices = selectBestIndexes(_.last(tree));
      binaryMap.push(choices);

      return findPath(sumToLast(_.initial(tree),
                                valuesByChoices(_.last(tree), choices) ));
    }
    return tree;
  }

  var sum = findPath(tree);
  console.log(sum);
  console.log(binaryMap);

  return binaryMap;
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
