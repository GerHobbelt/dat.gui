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

/**
 * @class TBD
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
class NumberControllerAnimator extends NumberController {
  constructor(object, property, params) {
    super(object, property, params);

    const _this = this;

    dom.addClass(this.domElement, "button-container");

    this.__animationMode = null;

    this.__sineButton = document.createElement("button");
    dom.addClass(this.__sineButton, "sine-button");
    this.__sawButton = document.createElement("button");
    dom.addClass(this.__sawButton, "saw-button");

    dom.bind(this.__sawButton, "click", toggleSaw);
    dom.bind(this.__sineButton, "click", toggleSine);

    function toggleSaw(e) {
      e.stopPropagation();
      e.preventDefault();
      if (_this.__animationMode === "saw") {
        stopAnimating();
        dom.removeClass(_this.__sawButton, "saw-button--activated");
      } else {
        if (_this.__animationMode === "sine") {
          dom.removeClass(_this.__sineButton, "sine-button--activated");
        }
        _this.__animationMode = "saw";
        dom.addClass(_this.__sawButton, "saw-button--activated");
        animate();
      }
    }

    function toggleSine(e) {
      e.stopPropagation();
      e.preventDefault();
      if (_this.__animationMode === "sine") {
        stopAnimating();
        dom.removeClass(_this.__sineButton, "sine-button--activated");
      } else {
        if (_this.__animationMode === "saw") {
          dom.removeClass(_this.__sawButton, "saw-button--activated");
        }
        _this.__animationMode = "sine";
        dom.addClass(_this.__sineButton, "sine-button--activated");
        animate();
      }
    }

    function animate() {
      if (_this.__animationMode === null) return;
      let percent;

      if (_this.__animationMode === "sine") {
        percent = Math.sin(Date.now() / 1000) / 2 + 0.5;
      } else if (_this.__animationMode === "saw") {
        percent = (Date.now() / 2000) % 1;
      }

      if (_this.__min !== undefined && _this.__max !== undefined) {
        _this.setValue((_this.__max - _this.__min) * percent + _this.__min);
      } else {
        _this.setValue(percent);
      }
      requestAnimationFrame(animate);
    }

    function stopAnimating() {
      _this.__animationMode = null;
    }

    this.updateDisplay();
    this.domElement.appendChild(this.__sawButton);
    this.domElement.appendChild(this.__sineButton);
  }
}

export default NumberControllerAnimator;
