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
import common from "../utils/common";

function roundToDecimal(value, decimals) {
  const tenTo = 10 ** decimals;
  return Math.round(value * tenTo) / tenTo;
}

/**
 * @class Represents a given property of an object that is a number and
 * provides an input element with which to manipulate it.
 *
 * @extends Controller
 * @extends NumberController
 *
 * @param {Object} object The object to be manipulated
 * @param {string} property The name of the property to be manipulated
 * @param {Object} [params] Optional parameters
 * @param {Number} [params.min] Minimum allowed value
 * @param {Number} [params.max] Maximum allowed value
 * @param {Number} [params.step] Increment by which to change value
 *
 * @member dat.controllers
 */
class NumberControllerBox extends NumberController {
  constructor(object, property, params) {
    super(object, property, params);

    params = params || {};

    this.__truncationSuspended = false;

    const _this = this;

    this.__suspendUpdate = false;

    /**
     * {Number} Previous mouse y position
     * @ignore
     */
    let prevY;

    function onChange() {
      const attempted = parseFloat(_this.__input.value);
      if (!common.isNaN(attempted) && !_this._readonly) {
        _this.setValue(attempted);
      }
    }

    function onFinish() {
      if (_this.__onFinishChange) {
        _this.__onFinishChange.call(_this, _this.getValue());
      }
    }

    function onFocus() {
      this.__suspendUpdate = true;
    }

    function onBlur() {
      this.__suspendUpdate = false;
      onFinish();
    }

    function onMouseDrag(e) {
      const diff = prevY - e.clientY;
      _this.setValue(_this.getValue() + diff * _this.__impliedStep);

      prevY = e.clientY;
    }

    function onMouseUp() {
      dom.unbind(window, "mousemove", onMouseDrag);
      dom.unbind(window, "mouseup", onMouseUp);
      onFinish();
    }

    function onMouseDown(e) {
      dom.bind(window, "mousemove", onMouseDrag, false, true);
      dom.bind(window, "mouseup", onMouseUp, false, true);
      prevY = e.clientY;
    }

    function onKeyDown(e) {
      // TODO: pick one of the two keyboard switch-case handlers below:
      if (1) {
        const step = _this.__step || 1;
        switch (e.keyCode) {
          // When pressing ENTER key, you can be as precise as you want.
          case 13:
            _this.__truncationSuspended = true;
            this.blur();
            _this.__truncationSuspended = false;
            onFinish();
            break;

          // arrow up
          case 38:
            var newVal = _this.getValue() + step;
            _this.setValue(newVal);
            break;

          // arrow down
          case 40:
            var newVal = _this.getValue() - step;
            _this.setValue(newVal);
            break;
        }
      } else {
        switch (e.key) {
          case "Enter": {
            // When pressing ENTER key, you can be as precise as you want.
            _this.__truncationSuspended = true;
            this.blur();
            _this.__truncationSuspended = false;
            onFinish();
            break;
          }
          case "ArrowUp": {
            _this.setValue(_this.getValue() + _this.__impliedStep);
            break;
          }
          case "ArrowDown": {
            _this.setValue(_this.getValue() - _this.__impliedStep);
            break;
          }
          default: {
            break;
          }
        }
      }
    }

    function onWheel(e) {
      e.preventDefault();
      const direction = -e.deltaY >> 10 || 1;
      _this.setValue(_this.getValue() + direction * _this.__impliedStep);
    }

    this.__input = document.createElement("input");
    this.__input.setAttribute("type", "number");

    // Makes it so manually specified values are not truncated.

    dom.bind(this.__input, "focus", onFocus, false, true);
    dom.bind(this.__input, "change", onChange, false, true);
    dom.bind(this.__input, "blur", onBlur, false, true);
    dom.bind(this.__input, "mousedown", onMouseDown, false, true);
    dom.bind(this.__input, "wheel", onWheel);
    dom.bind(this.__input, "keydown", onKeyDown, false, true);

    this.updateDisplay();

    this.domElement.appendChild(this.__input);
  }

  updateDisplay(force) {
    // TODO: next two statements are from different fixes for the same problem:
    // no updating while editing number field. See which one works best.
    if (!force && dom.isActive(this.__input)) return this;
    if (this.__suspendUpdate) return;

    this.__input.value = this.__truncationSuspended
      ? this.getValue()
      : roundToDecimal(this.getValue(), this.__precision);
    return super.updateDisplay();
  }
}

export default NumberControllerBox;
