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

/**
 * @class Provides a checkbox input to alter the boolean property of an object.
 * @extends dat.controllers.Controller
 *
 * @param {Object} object The object to be manipulated
 * @param {string} property The name of the property to be manipulated
 *
 * @member dat.controllers
 */
class BooleanController extends Controller {
  constructor(object, property, options) {
    super(object, property, "boolean", options);

    const _this = this;
    this.__prev = this.getValue();

    this.__checkbox = document.createElement("input");
    this.__checkbox.setAttribute("type", "checkbox");

    dom.bind(this.__checkbox, "change", onChange, false);

    this.domElement.appendChild(this.__checkbox);

    // Match original value
    this.updateDisplay();

    function onChange() {
      _this.setValue(!_this.__prev);
    }
  }

  setValue(v) {
    const toReturn = super.setValue(v);
    this.__prev = this.getValue();
    return toReturn;
  }

  updateDisplay() {
    if (this.getValue() === true) {
      this.__checkbox.setAttribute("checked", "checked");
      this.__checkbox.checked = true;
    } else {
      this.__checkbox.checked = false;
    }

    this.__checkbox.disabled = this.getReadonly();

    return super.updateDisplay();
  }
}

export default BooleanController;
