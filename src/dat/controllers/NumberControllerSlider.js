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

import NumberController from "./NumberController";
import dom from "../dom/dom";

// import "./NumberControllerSlider.css";

function map(v, i1, i2, o1, o2) {
  return o1 + (o2 - o1) * ((v - i1) / (i2 - i1));
}

/**
 * @class Represents a given property of an object that is a number, contains
 * a minimum and maximum, and provides a slider element with which to
 * manipulate it. It should be noted that the slider element is made up of
 * <code>&lt;div&gt;</code> tags, <strong>not</strong> the html5
 * <code>&lt;slider&gt;</code> element.
 *
 * @extends dat.controllers.Controller
 * @extends dat.controllers.NumberController
 *
 * @param {Object} object The object to be manipulated
 * @param {string} property The name of the property to be manipulated
 * @param {Number} minValue Minimum allowed value
 * @param {Number} maxValue Maximum allowed value
 * @param {Number} stepValue Increment by which to change value
 *
 * @member dat.controllers
 */
class NumberControllerSlider extends NumberController {
  constructor(object, property, min, max, step) {
    super(object, property, { min: min, max: max, step: step });

    const _this = this;

    function onTouchDown(e) {
      dom.bind(window, "touchmove", onTouchDrag);
      dom.bind(window, "touchend", onTouchUp);

      onTouchDrag(e);
    }

    function onTouchDrag(e) {
      e.preventDefault();

      const offset = dom.getOffset(_this.__background);
      const width = dom.getWidth(_this.__background);

      _this.setValue(map(e.touches[0].clientX, offset.left, offset.left + width, _this.__min, _this.__max));

      return false;
    }

    function onTouchUp(e) {
      dom.unbind(window, "touchmove", onTouchDrag);
      dom.unbind(window, "touchend", onTouchUp);

      e.preventDefault();

      _this.fireFinishChange({
        eventData: e,
        eventSource: "onTouchUp",
      });
    }

    function onMouseDown(e) {
      dom.bind(window, "mousemove", onMouseDrag);
      dom.bind(window, "mouseup", onMouseUp);

      onMouseDrag(e);
    }

    function onMouseDrag(e) {
      e.preventDefault();

      const offset = dom.getOffset(_this.__background);
      const width = dom.getWidth(_this.__background);

      _this.setValue(map(e.clientX, offset.left, offset.left + width, _this.__min, _this.__max));

      return false;
    }

    function onMouseUp(e) {
      dom.unbind(window, "mousemove", onMouseDrag);
      dom.unbind(window, "mouseup", onMouseUp);

      e.preventDefault();

      _this.fireFinishChange({
        eventData: e,
        eventSource: "onMouseUp",
      });
    }

    this.__background = document.createElement("div");
    this.__foreground = document.createElement("div");

    dom.bind(this.__background, "touchstart", onTouchDown);
    dom.bind(this.__background, "mousedown", onMouseDown);

    dom.addClass(this.__background, "slider");
    dom.addClass(this.__foreground, "slider-fg");

    this.updateDisplay();

    this.__background.appendChild(this.__foreground);
    this.domElement.appendChild(this.__background);
  }

  updateDisplay() {
    const value = this.getValue();
    const pct = (value - this.__min) / (this.__max - this.__min);
    this.__foreground.style.width = pct * 100 + "%";

    return super.updateDisplay();
  }
}

export default NumberControllerSlider;
