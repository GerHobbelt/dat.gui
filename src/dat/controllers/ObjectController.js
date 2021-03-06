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

import Controller from "./Controller";
import dom from "../dom/dom";

/**
 * @class Provides a select input to alter the property of an object, using a
 * list of accepted values.
 *
 * @extends dat.controllers.Controller
 *
 * @param {Object} object The object to be manipulated
 * @param {string} property The name of the property to be manipulated
 * @param {Object|string[]} options A map of labels to acceptable values, or
 * a list of acceptable string values.
 *
 * @member dat.controllers
 */
class OptionController extends Controller {
  constructor(object, property, params, options) {
    super(object, property, "option", options);

    const _this = this;
    this.CUSTOM_FLAG = "";

    params = params || {};

    /**
     * The drop down menu
     * @ignore
     */
    this.__select = document.createElement("select");

    if (common.isArray(params)) {
      const map = {};
      common.each(params, function (element) {
        map[element] = element;
      });
      params = map;
    }

    common.each(params, function (value, key) {
      const opt = document.createElement("option");
      opt.innerHTML = value;
      opt.setAttribute("value", key);
      _this.__select.appendChild(opt);
    });

    if (params.custom) {
      const opt = document.createElement("option");
      opt.innerHTML = params.custom.display || "Custom";
      opt.setAttribute("value", _this.CUSTOM_FLAG);
      _this.__select.appendChild(opt);

      this.__custom_controller = params.custom.controller;
    }

    // Acknowledge original value
    this.updateDisplay();

    dom.bind(this.__select, "change", function () {
      let { value } = this.options[this.selectedIndex];
      if (value === _this.CUSTOM_FLAG) {
        value = _this.__custom_controller.getValue();
      }
      _this.setValue(value);
    });

    if (this.__custom_controller) {
      this.__custom_controller.onChange(function () {
        const value = this.getValue();
        _this.setValue(value);
      });
    }

    this.domElement.appendChild(this.__select);
    if (this.__custom_controller) {
      this.domElement.appendChild(this.__custom_controller.el);
    }
  }

  setValue(v) {
    const toReturn = super.setValue(v);
    return toReturn;
  }

  updateDisplay() {
    const value = this.getValue();
    let custom = true;
    if (value !== this.CUSTOM_FLAG) {
      common.each(this.__select.options, function (option) {
        if (value === option.value) {
          custom = false;
        }
      });
    }

    this.__select.value = custom ? this.CUSTOM_FLAG : value;

    if (this.__custom_controller) {
      this.__custom_controller.el.style.display = custom ? "block" : "none";
    }

    return super.updateDisplay();
  }
}

export default OptionController;
