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
 * @class Provides a GUI interface to fire a specified method, a property of an object.
 *
 * @extends Controller
 *
 * @param {Object} object The object to be manipulated
 * @param {string} property The name of the property to be manipulated
 *
 * @member dat.controllers
 */
class FunctionController extends Controller {
  constructor(object, property, text) {
    super(object, property);

    const _this = this;

    this.__button = document.createElement("div");
    this.__button.innerHTML = text === undefined ? "Fire" : text;

    dom.bind(this.__button, "click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      _this.fire();
      return false;
    });

    dom.addClass(this.__button, "button");

    this.domElement.appendChild(this.__button);
  }

  /**
   * Invoke the function (property of the object), passing the `user_data` array as function
   * arguments.
   *
   * Before the function is invoked, the dat.GUI `beforeChange` callback will be invoked
   *
   *
   * @param  {Array} user_data  The array of function arguments; when the `user_data` is not
   * an array, it will be assumed to be a single argument by itself and will be
   * passed to the invoked function as is.
   *
   * @param  {boolean} silent   When truthy, no onBeforeChange/onChange events will be fired.
   *
   * @return {Controller}           This controller.
   */
  fire() {
    if (this.__onChange) {
      this.__onChange.call(this);
    }
    this.getValue().call(this.object);
    if (this.__onFinishChange) {
      this.__onFinishChange.call(this, this.getValue());
    }
  }
}

export default FunctionController;
