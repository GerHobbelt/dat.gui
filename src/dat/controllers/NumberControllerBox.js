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
 * @param {string} [params.suffix] Suffix for the value
 *
 * @member dat.controllers
 */
class NumberControllerBox extends NumberController {
  constructor(object, property, params) {
    super(object, property, params);

    params = params || {};

    this.__suffix = params.suffix || "";
    this.__truncationSuspended = false;

    const _this = this;

    /**
     * {Number} Previous mouse y position
     * @ignore
     */
    let prevY;

    function onKeyDown(e) {
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
          _this.setValue(_this.getValue() + _this.__impliedStep);
          break;

        // arrow down
        case 40:
          _this.setValue(_this.getValue() - _this.__impliedStep);
          break;

        // make ESLINT happy:
        default:
          break;
      }
    }

    function onChange() {
      let { value } = _this.__input;
      if (params && _this.__suffix) {
        value = value.replace(_this.__suffix, "");
      }
      const attempted = parseFloat(value);
      if (!common.isNaN(attempted) && !_this._readonly) {
        _this.setValue(attempted);
      }
    }

    function onFinish() {
      if (_this.__onFinishChange) {
        _this.__onFinishChange.call(_this, _this.getValue());
      }
    }

    function onBlur() {
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

    function onWheel(e) {
      e.preventDefault();
      const direction = -e.deltaY >> 10 || 1;
      _this.setValue(_this.getValue() + direction * _this.__impliedStep);
    }

    // Makes it so manually specified values are not truncated.

    this.__input = document.createElement("input");
    this.__input.setAttribute("type", "text");

    this.__up = document.createElement("button");
    this.__up.setAttribute(
      "style",
      "position:absolute;right:0;height:10px;top:4px;background-color: #555;border: none;"
    );
    this.__down = document.createElement("button");
    this.__down.setAttribute(
      "style",
      "position:absolute;right:0;height:10px;top:15px;background-color: #555;border: none;"
    );

    dom.bind(this.__up, "mousedown", function () {
      _this.setValue(_this.getValue() + _this.__impliedStep);
    });
    dom.bind(this.__down, "mousedown", function () {
      _this.setValue(_this.getValue() - _this.__impliedStep);
    });

    // this.__input.setAttribute('type', 'number');
    // this.__input.setAttribute('step', params.step || 1);
    // this.__input.setAttribute('style', "width : 100px;");
    // Makes it so manually specified values are not truncated.

    dom.bind(this.__input, "change", onChange, false, true);
    dom.bind(this.__input, "blur", onBlur, false, true);
    dom.bind(this.__input, "mousedown", onMouseDown, false, true);
    dom.bind(this.__input, "wheel", onWheel);
    dom.bind(this.__input, "keydown", onKeyDown, false, true);

    this.updateDisplay();

    this.domElement.appendChild(this.__input);
    this.domElement.appendChild(this.__up);
    this.domElement.appendChild(this.__down);
  }

  updateDisplay() {
    // Use the same solution from StringController.js to enable
    // editing <input>s while "listen()"ing
    if (dom.isActive(this.__input)) {
      return this;
    }

    this.__input.value = this.__truncationSuspended
      ? this.getValue()
      : roundToDecimal(this.getValue(), this.__precision) + this.__suffix;
    return super.updateDisplay();
  }
}

export default NumberControllerBox;
