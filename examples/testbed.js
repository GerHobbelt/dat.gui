/**
 * dat.GUI JavaScript Controller Library
 * http://code.google.com/p/dat-gui
 *
 * Copyright 2011-2020 Data Arts Team, Google Creative Lab
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */

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

let global_monitor_timer;

const registered_objects = [];
let monitor_div;
let progress_div;
const inspection_divs = [];
const previous_displayed_values = [];
let monitor_time_next_trigger = 0;
const monitor_action_interval = 2000; // milliseconds
const monitor_action_interval_substeps = 20;

// time in MILLISECONDS:
function now() {
  let t;
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
  let el;
  el = document.createElement("pre");
  el.setAttribute("class", "inspected-object");
  el.textContent = JSON.stringify(obj, null, 2);
  parentElement.appendChild(el);
}

function perform_monitor_update() {
  for (let i = 0, len = registered_objects.length; i < len; i++) {
    const o = registered_objects[i];
    const el = inspection_divs[i];
    const oldmsg = previous_displayed_values[i];
    const newmsg = JSON.stringify(o, null, 2);
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

  const steps = (duration * monitor_action_interval_substeps) / monitor_action_interval;
  let s = "";
  for (let i = 0; i < steps; i++) {
    s += ".";
  }
  if (s === "") {
    s = "\u00a0";
  }
  progress_div.textContent = s;
}

function do_monitor() {
  const t = now();

  clearTimeout(global_monitor_timer);
  global_monitor_timer = setTimeout(
    do_monitor,
    Math.max(50, monitor_action_interval / monitor_action_interval_substeps)
  );

  if (monitor_time_next_trigger <= t) {
    perform_monitor_progress_countdown(0);

    // action!
    monitor_time_next_trigger = t + monitor_action_interval;
    // regenerate the content in the parent DIV:
    perform_monitor_update();
  } else {
    perform_monitor_progress_countdown(monitor_time_next_trigger - t);
  }
}

function do_observe() {
  // force action!
  monitor_time_next_trigger = 0;
  do_monitor();
}

function init(obj, document) {
  let div = monitor_div;
  if (!div) {
    div = document.createElement("div");
    div.setAttribute("class", "monitor-container");
    let descr = document.body.getElementsByClassName("demo-info");
    if (descr) {
      descr = descr[0];
    }
    div = insertAtTop(div, document.body, descr);

    progress_div = document.createElement("div");
    progress_div.setAttribute("class", "progress-display");
    progress_div = div.appendChild(progress_div);

    monitor_div = div;
  }

  registered_objects.push(obj);
  const index = registered_objects.length - 1;

  div = document.createElement("div");
  div.setAttribute("class", "monitor-one-object");
  div = monitor_div.appendChild(div);
  inspection_divs[index] = div;

  if (typeof Object.observe === "function") {
    Object.observe(obj, do_observe);
  }

  do_monitor();
}

export default {
  init: init,
};
