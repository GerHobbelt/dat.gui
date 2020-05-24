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
import common from "../utils/common";

/**
 * @class Provides a text area to alter the text property of an object.
 *
 * @extends dat.controllers.Controller
 *
 * @param {Object} object The object to be manipulated
 * @param {string} property The name of the property to be manipulated
 * @param {Object} [params] optional parameters for the controller.
 * @param {String} params.className The class name to add to the textarea DOM element for this control.
 * @param {Object|Set} params.styles A set of styles to apply to the textarea DOM element for this control.
 *
 * @member dat.controllers
 */
class TextAreaController extends Controller {
  constructor(object, property, params) {
    super(object, property, "textarea");

    const _this = this;

    this.__input = document.createElement("textarea");
    // this.__input.setAttribute('type', 'text');

    // apply custom styling of the textarea?
    if (params.styles) {
      common.extend(this.__input.style, params.styles);
    }
    dom.addClass(this.__input, params.className);

    dom.bind(this.__input, "keyup", onChange);
    dom.bind(this.__input, "change", onChange);
    dom.bind(this.__input, "blur", onBlur);
    /*
    dom.bind(this.__input, 'keydown', function(e) {
      if (e.keyCode === 13) {
        this.blur();
      }
    });
    */

    function onChange() {
      _this.setValue(_this.__input.value);
    }

    function onBlur() {
      if (_this.__onFinishChange) {
        _this.__onFinishChange.call(_this, _this.getValue());
      }
    }

    this.updateDisplay();

    this.domElement.appendChild(this.__input);
  }

  updateDisplay() {
    // Use the same solution from StringController.js to enable
    // editing <input>s while "listen()"ing
    if (dom.isActive(this.__input)) {
      return this;
    }
    this.__input.value = this.getValue();
    return super.updateDisplay();
  }
}

export default TextAreaController;
