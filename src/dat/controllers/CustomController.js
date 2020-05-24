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

/**
 * @class Represents a custom controller.
 *
 * @extends Controller
 *
 * @param {Object} object
 * @param {string} property
 *
 * @member dat.controllers
 */
class CustomController extends Controller {
  /**
   * Represents a custom controller.
   * @param {Object} object The object to be manipulated
   * @param {Function} [object.property] Returns an object with elements for adding into "property-name" class element.
   * @param {string} property The name of the property to be manipulated
   * @param {...Object} [params] Optional parameters
   */
  constructor(object, property, ...params) {
    super(object, property, "custom");

    this.arguments = {
      object: object,
      property: property,
      opts: params,
    };
    if (object.property) {
      this.property = object.property(this);
    }
  }

  set controller(newController) {
    this._controller = newController;
  }

  get controller() {
    return this._controller;
  }
}

export default CustomController;
