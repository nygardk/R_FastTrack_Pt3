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
