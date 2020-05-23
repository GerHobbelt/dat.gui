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
 * @param {Object} enumeration Dynamic object of key value pairs for enumerable values/ranges
 *
 * @member dat.controllers
 */
class NumberControllerSlider extends NumberController {
  constructor(object, property, min, max, step, enumeration) {
    super(object, property, { min: min, max: max, step: step });

    const _this = this;

    this.__background = document.createElement("div");
    this.__label = document.createElement("div");
    this.__foreground = document.createElement("div");

    function getEnumArr(hash) {
      let arr = [];
      let k;
      for (k in hash) {
        arr.push({ key: k, value: hash[k] });
      }
      arr = arr.sort(function (a, b) {
        const result = true ? a.value < b.value : a.value > b.value;
        return result ? 1 : -1;
      });

      return arr.length > 0 ? arr : null;
    }

    if (enumeration) {
      this.enumeration = getEnumArr(enumeration);
    }

    this.__label.style.visibility = enumeration ? "visible" : "hidden";

    dom.bind(this.__background, "mousedown", onMouseDown);

    dom.addClass(this.__background, "slider");
    dom.addClass(this.__label, "label");
    dom.addClass(this.__foreground, "slider-fg");

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
      if (_this.__onFinishChange) {
        _this.__onFinishChange.call(_this, _this.getValue());
      }
    }

    this.updateDisplay();

    this.__background.appendChild(this.__foreground);
    this.__background.appendChild(this.__label);
    this.domElement.appendChild(this.__background);
  }

  updateDisplay() {
    const value = this.getValue();
    const pct = (value - this.__min) / (this.__max - this.__min);
    this.__foreground.style.width = pct * 100 + "%";

    this.__label.innerHTML = value;

    if (this.enumeration) {
      let chosenValue = null;
      let chosenIndex = null;
      let i = this.enumeration.length;
      while (--i > -1) {
        chosenValue = this.enumeration[i].value;
        if (value < chosenValue) {
          break;
        }
        chosenIndex = i;
      }

      if (chosenIndex == null) {
        chosenValue = "";
      } else chosenValue = this.enumeration[chosenIndex].key;

      this.__label.innerHTML = chosenValue;
    }

    return super.updateDisplay();
  }
}

export default NumberControllerSlider;
