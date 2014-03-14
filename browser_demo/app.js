/* Reads contents from file and returns deferred
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
  console.log("Checksum by reducing:", _.flatten(reduced)[0]); // outputs sum for debugging

  return indexmap.reverse(); // indexmap was created from bottom up
}

/* Reads tree and creates a simplified
 * binarymap where value 0 represents turn to first (=left)
 * choice and 1 represents a turn to latter (=right) choice
 * @param tree {array}
 * @return binaryMap {array}
 */
function binaryMap(tree) {
  var imap = indexMap(tree);

  var result = [];
  imap.forEach(function(level) {
    var position = _.filter(result, function(num) { return num === 1 }).length;
    result.push(level[position]);
  });

  return result;
}

/* Takes binaryMap and tree and returns list of values based on traversal
 * @param binaryMap {array}
 * @param tree {array}
 * @return values {array}
 */
function binaryTraversal(binarymap, tree) {
  var result = [];
  var position = 0;

  tree.forEach(function(level, index) {
    if (binarymap[index-1] === 1) position++;
    result.push(level[position]);
  });

  return result;
}

/* Creates HTML map
 */
function createMap(tree) {
  var loc = $('#numbers');
  loc.empty(); // clear contents
  var html = "";

  tree.reverse().forEach(function(level) {
    level.forEach(function(node, index) {
      html += '<div>'+node+'</div>';
      if (index === level.length-1) html += '<br>';
    })
  });

  loc.append('<div id="finishline"></div>');
  loc.append(html);
}

/* Initializes demo
 */
function initDemo() {

}

/* Run demo
 */
function startDemo(tree, binarymap, values) {
  var car = new Car($('#car'));

  _.times(4, function() {car.forward(0)});
  values.forEach(function(value, index) {
    binarymap[index] ? car.right(value) : car.left(value);
  });
  _.times(4, function() {car.forward(0)});

  car.finish();
}

/* Ends demo
 */
function endDemo(score) {
  $('#start-modal').animate({bottom: 0}, 500);
  $('#score-modal').empty().html('tulos: '+score).fadeIn(500).delay(2000).fadeOut(1000);
}

function Car(container) {
  var platform = $('#numbers'),
      score = $('#score'),
      duration = 200;

  function move(css, classname, points) {
    platform.animate(css, {
      duration: duration,
      easing: 'linear',
      queue: true,
      start: function() {
        container.removeClass().addClass(classname);
        score.html(parseInt(score.text())+points);
      }
    })
  }

  // reset
  platform.css('bottom', 0);
  platform.css('left', 0);
  score.html(0);

  return {
    container: container,
    forward: function(points) {
      move({bottom: "-=80"}, 'forward', points);
    },
    left: function(points) {
      move({bottom: "-=80", left: "+=40"}, 'left', points);
    },
    right: function(points) {
      move({bottom: "-=80", left: "-=40"}, 'right', points);
    },
    finish: function(callback) {
      platform.queue(function() {
        endDemo(parseInt(score.text()));
        platform.dequeue();
      });
    }
  }
}

function selectFile(file) {
  if (!window.File || !window.FileReader || !window.FileList || !window.Blob)
    alert('File loading is not fully supported in this browser.');

  var r = $.Deferred();
  var fileInput = $('#input').get(0);

  var file = fileInput.files[0];
  var textType = /text.*/;
  var contents;

  if (file.type.match(textType)) {
    var reader = new FileReader();
    reader.onload = function(e) {
      contents = reader.result;
      return r.resolve(contents);
    }
    reader.readAsText(file);
  } else { alert('Tiedoston pitää olla tekstitiedosto!') }

  return r;
}


$(document).ready(function() {
  var content;

  function start(content) {
    var tree, binarymap, values;

    tree = readLinesIntoArray(content);
    binarymap = binaryMap(tree);
    values = binaryTraversal(binarymap, tree);
    console.log("Sum by traversal:", _.reduce(values, function(memo, num) { return memo + num } ));

    createMap(tree);
    startDemo(tree, binarymap, values);
  }

  $('#start').click(function() {
    $('#start-modal').animate({bottom: -$('#start-modal').height()}, 500);
    if (null == content) readTree('tree.txt').done(function(content) { start(content) })
    else { start(content) }
  });

  $('#audio').click(function() {
    var player = $('#player').get(0);
    $(this).toggleClass('on off');
    if ($(this).hasClass('on')) player.play();
    else if ($(this).hasClass('off')) player.pause();
  });

  $("#input").change(function(e) {
    selectFile(e).done(function(data) { content = data });
  });
});
