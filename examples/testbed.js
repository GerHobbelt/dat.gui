define([], function() {
  'use strict';

// insert node at top inside parent; however, when the optional `placedBelowThisChildElement`
// has been specified, we want the given `newElement` placed just below that element! 
function insertAtTop(newElement, parentElement, placedBelowThisChildElement) {
  if (placedBelowThisChildElement) {
    if (placedBelowThisChildElement.nextSibling) {
      parentElement.insertBefore(newElement, placedBelowThisChildElement.nextSibling);  
    } else {
      // When the `placeBelowThisChildElement` doesn't have a subsequent sibling, then it's
      // already the last child itself and we merely need to append our node to the child set:
      parentElement.appendChild(newElement);  
    }
  } else {
    // Insert the new element before the first child
    parentElement.insertBefore(newElement, parentElement.firstChild);  
  }

  return newElement;
}

var global_monitor_timer;

var registered_objects = [];
var monitor_div;
var progress_div;
var inspection_divs = [];
var previous_displayed_values = [];
var monitor_time_next_trigger = 0;
var monitor_action_interval = 2000;   // milliseconds
var monitor_action_interval_substeps = 20;

// time in MILLISECONDS:
function now() {
  var t;
  if (!Date.now) {
      t = new Date().getTime();
  } else {
    t = Date.now();
  }
  return t;
}

function removeAllContent(el) {
  // http://stackoverflow.com/questions/3955229/remove-all-child-elements-of-a-dom-node-in-javascript
  while (el.firstChild) {
    el.removeChild(el.firstChild);
  }
}

function gen_obj_display(obj, parentElement) {
  var el;
  el = document.createElement('pre');
  el.setAttribute('class', 'inspected-object');
  el.textContent = JSON.stringify(obj, null, 2);
  parentElement.appendChild(el);
}

function perform_monitor_update() {
  for (var i = 0, len = registered_objects.length; i < len; i++) {
    var o = registered_objects[i];
    var el = inspection_divs[i];
    var oldmsg = previous_displayed_values[i];
    var newmsg = JSON.stringify(o, null, 2);
    if (newmsg !== oldmsg) {
      // only update the DOM when there's some actual change; this ensures the user can select & copy/pasta
      // or otherwise mess around in the DOM without being constantly bothered by useless updates
      // nuking the selections etc. she's making.
      removeAllContent(el);
      gen_obj_display(o, el);
      previous_displayed_values[i] = newmsg;
    }
  }
}

function perform_monitor_progress_countdown(duration) {
  if (duration > monitor_action_interval) {
    duration = monitor_action_interval;
  } else if (duration < 0) {
    duration = 0;
  }

  var steps = duration * monitor_action_interval_substeps / monitor_action_interval;
  var s = '';
  for (var i = 0; i < steps; i++) {
    s += '.';
  }
  progress_div.textContent = s;
}    

function do_monitor() {
  var t = now();

  clearTimeout(global_monitor_timer);
  global_monitor_timer = setTimeout(do_monitor, Math.max(50, monitor_action_interval / monitor_action_interval_substeps));

  if (monitor_time_next_trigger <= t) {
    // action!
    monitor_time_next_trigger = t + monitor_action_interval; 
    // regenerate the content in the parent DIV:
    perform_monitor_update();    
  } else {
    perform_monitor_progress_countdown(monitor_time_next_trigger - t);    
  }
}

function init(obj, document) {
  var div = monitor_div;
  if (!div) {
    div = document.createElement('div');
    div.setAttribute('class', 'monitor-container');
    var descr = document.body.getElementsByClassName('demo-info');
    if (descr) {
      descr = descr[0];
    }
    div = insertAtTop(div, document.body, descr);

    progress_div = document.createElement('div');
    progress_div.setAttribute('class', 'progress-display');
    progress_div = div.appendChild(progress_div);

    monitor_div = div;
  }

  registered_objects.push(obj);
  var index = registered_objects.length - 1;

  div = document.createElement('div');
  div.setAttribute('class', 'monitor-one-object');
  div = monitor_div.appendChild(div);
  inspection_divs[index] = div;

  do_monitor();
}

  return {
    init: init
  };
});


