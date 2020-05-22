/**
 * dat.GUI JavaScript Controller Library
 * http://code.google.com/p/dat-gui
 *
 * Copyright 2011-2019 Data Arts Team, Google Creative Lab
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import Controller from "./Controller";
import dom from "../dom/dom";
import common from "../utils/common";

/**
 * @class Provides a text input to alter the array property of an object.
 *        Automatically converts strings to numbers and boolean values if appropriate.
 *
 * @extends Controller
 *
 * @param {Object} object The object to be manipulated
 * @param {string} property The name of the property to be manipulated
 *
 * @member dat.controllers
 */
class ArrayController extends Controller {
  constructor(object, property) {
    super(object, property);

    const _this = this;

    this.__div = document.createElement("div");
    this.__inputs = [];

    this.__new = document.createElement("input");
    this.__new.setAttribute("type", "text");
    dom.bind(this.__new, "keydown", function (e) {
      if (e.keyCode === 13) {
        const values = _this.getValue();
        values.push(_this.__new.value);
        _this.__new.value = "";

        _this.updateDisplay();
      }
    });

    this.__div.appendChild(this.__new);

    this.updateDisplay();

    this.domElement.appendChild(this.__div);
  }

  updateDisplay() {
    for (let i = 0; i < this.__inputs.length; i++) {
      if (dom.isActive(this.__inputs[i])) {
        return;
      }
    }

    const _this = this;

    this.__inputs.forEach(function (i) {
      _this.__div.removeChild(i.parentElement);
    });

    this.__inputs = [];

    this.getValue().forEach(function (v) {
      const group = document.createElement("div");
      dom.addClass(group, "array-input");
      const input = document.createElement("input");
      group.appendChild(input);
      input.setAttribute("type", "text");
      input.value = v;

      const remove = document.createElement("span");
      remove.innerHTML = "&nbsp;";
      dom.addClass(remove, "remove-icon");
      group.appendChild(remove);

      dom.bind(remove, "click", onRemove);

      dom.bind(input, "keyup", onChange);
      dom.bind(input, "change", onChange);
      dom.bind(input, "blur", onBlur);
      dom.bind(input, "keydown", function (e) {
        if (e.keyCode === 13) {
          this.blur();
        }
      });

      _this.__div.insertBefore(group, _this.__new);
      _this.__inputs.push(input);
    });

    function onRemove(e) {
      for (let i = 0; i < _this.__inputs.length; i++) {
        if (_this.__inputs[i].parentElement === e.target.parentElement) {
          const values = _this.getValue().filter((v) => v !== _this.__inputs[i].value);
          _this.setValue(values);
        }
      }
    }

    function onChange() {
      if (_this.__changing) {
        return;
      }

      _this.__changing = true;

      const values = _this.__inputs.map(function (i) {
        return i.value;
      });

      _this.setValue(values);

      _this.__changing = false;
    }

    function onBlur() {
      if (_this.__onFinishChange) {
        _this.__onFinishChange.call(_this, _this.getValue());
      }
    }
  }
}

export default ArrayController;
