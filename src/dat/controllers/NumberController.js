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
import common from "../utils/common";

function numDecimals(x) {
  const _x = x.toString();
  if (_x.indexOf(".") > -1) {
    return _x.length - _x.indexOf(".") - 1;
  }

  return 0;
}

/**
 * @class Represents a given property of an object that is a number.
 *
 * @extends dat.controllers.Controller
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
class NumberController extends Controller {
  constructor(object, property, params) {
    super(object, property);

    params = params || {};

    this.__min = params.min;
    this.__max = params.max;
    this.__step = params.step;

    if (common.isUndefined(this.__step)) {
      if (this.initialValue === 0) {
        this.__impliedStep = 1; // What are we, psychics?
      } else {
        // Hey Doug, check this out.
        this.__impliedStep = 10 ** Math.floor(Math.log(Math.abs(this.initialValue)) / Math.LN10) / 10;
      }
    } else {
      this.__impliedStep = this.__step;
    }

    this.__precision = numDecimals(this.__impliedStep);
  }

  setValue(v) {
    if (this.__min != null && v < this.__min) {
      v = this.__min;
    } else if (this.__max != null && v > this.__max) {
      v = this.__max;
    }

    if (this.__step != null && v % this.__step !== 0) {
      v = Math.round(v / this.__step) * this.__step;
    }

    return super.setValue(v);
  }

  /**
   * Specify a minimum value for <code>object[property]</code>.
   *
   * @param {Number} minValue The minimum value for
   * <code>object[property]</code>
   * @returns {dat.controllers.NumberController} this
   */
  min(v) {
    this.__min = v;
    return this;
  }

  /**
   * Specify a maximum value for <code>object[property]</code>.
   *
   * @param {Number} maxValue The maximum value for
   * <code>object[property]</code>
   * @returns {dat.controllers.NumberController} this
   */
  max(v) {
    this.__max = v;
    return this;
  }

  /**
   * Specify a step value that dat.controllers.NumberController
   * increments by.
   *
   * @param {Number} stepValue The step value for
   * dat.controllers.NumberController
   * @default if minimum and maximum specified increment is 1% of the
   * difference otherwise stepValue is 1
   * @returns {dat.controllers.NumberController} this
   */
  step(v) {
    this.__step = v;
    this.__impliedStep = v;
    this.__precision = numDecimals(v);
    if (this.__valueControllerBox !== undefined) {
      this.__valueControllerBox.__step = this.__step;
      this.__valueControllerBox.__impliedStep = this.__impliedStep;
      this.__valueControllerBox.__precision = this.__precision;
    }
    return this;
  }
}

export default NumberController;
