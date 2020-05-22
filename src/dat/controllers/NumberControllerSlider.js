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
 * @extends Controller
 * @extends NumberController
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

    this.__background = document.createElement("div");
    this.__foreground = document.createElement("div");

    dom.bind(this.__background, "mousedown", onMouseDown);
    dom.bind(this.__background, "touchstart", onTouchStart, false, true);
    dom.bind(this.__background, "wheel", onWheel);

    dom.addClass(this.__background, "slider");
    dom.addClass(this.__foreground, "slider-fg");

    function onMouseDown(e) {
      document.activeElement.blur();

      dom.bind(window, "mousemove", onMouseDrag);
      dom.bind(window, "mouseup", onMouseUp, false, true);

      onMouseDrag(e);
    }

    function onMouseDrag(e) {
      // e.preventDefault();

      onDrag(e.clientX);
    }

    function onDrag(clientX) {
      const bgRect = _this.__background.getBoundingClientRect();

      if (!_this._readonly) {
        _this.setValue(map(e.clientX, bgRect.left, bgRect.right, _this.__min, _this.__max));
      }

      return false;
    }

    function onMouseUp() {
      dom.unbind(window, "mousemove", onMouseDrag);
      dom.unbind(window, "mouseup", onMouseUp);
      if (_this.__onFinishChange) {
        _this.__onFinishChange.call(_this, _this.getValue());
      }
    }

    function onTouchStart(e) {
      if (e.touches.length !== 1) {
        return;
      }

      document.activeElement.blur();

      dom.bind(window, "touchmove", onTouchMove, false, true);
      dom.bind(window, "touchend", onTouchEnd, false, true);

      _this.__activeTouch = e.targetTouches[0];

      onTouchMove(e);
    }

    // function onTouchMove(e) {
    //  const { clientX } = e.touches[0];
    //  const bgRect = _this.__background.getBoundingClientRect();
    //
    //  _this.setValue(map(clientX, bgRect.left, bgRect.right, _this.__min, _this.__max));
    // }
    function onTouchMove(e) {
      // e.preventDefault();

      const changed = e.changedTouches;

      for (let i = 0; i < changed.length; i++) {
        if (changed[i].identifier === _this.__activeTouch.identifier) {
          onDrag(changed[i].clientX);
        }
      }
    }

    function onTouchEnd() {
      dom.unbind(window, "touchmove", onTouchMove);
      dom.unbind(window, "touchend", onTouchEnd);

      _this.__activeTouch = null;

      if (_this.__onFinishChange) {
        _this.__onFinishChange.call(_this, _this.getValue());
      }
    }

    function onWheel(e) {
      e.preventDefault();
      const direction = -e.deltaY >> 10 || 1;
      _this.setValue(_this.getValue() + direction * _this.__impliedStep);
    }

    this.updateDisplay();

    this.__background.appendChild(this.__foreground);
    this.domElement.appendChild(this.__background);
  }

  updateDisplay() {
    if (this.__input === document.activeElement) {
      return;
    }
    const pct = (this.getValue() - this.__min) / (this.__max - this.__min);
    this.__foreground.style.width = pct * 100 + "%";
    return super.updateDisplay();
  }
}

export default NumberControllerSlider;
