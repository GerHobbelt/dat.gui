/**
 * dat.GUI JavaScript Controller Library
 * http://code.google.com/p/dat-gui
 *
 * Copyright 2011 Data Arts Team, Google Creative Lab
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
    x = x.toString();
    if (x.indexOf(".") > -1) {
      return x.length - x.indexOf(".") - 1;
    }
    return 0;
  }


  /**
   * When the user didn't specify a sane step size, infer a suitable stepsize from the initialValue.
   */
  function guestimateImpliedStep(initialValue, userSpecifiedStep, minimumSaneStepSize, maximumSaneStepSize) {
    if (common.isFiniteNumber(userSpecifiedStep)) {
      return userSpecifiedStep;
    }

    let v;
    if (!initialValue) {
      v = 1; // What are we, psychics?
    } else {
      // make the step a rounded 10th of the initial value.
      // (the floor(log) minus 1 ensures that the result still is as accurate as possible for very small numbers;
      // while the old code performed pow(floor(log)) / 10 which would already cause trouble at values near 1E-6)
      v = Math.pow(10, Math.floor(Math.log(Math.abs(initialValue)) / Math.LN10) - 1);
    }
    return Math.max(minimumSaneStepSize, Math.min(maximumSaneStepSize, v));
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
  constructor(object, property, params, options) {
    super(object, property, "number", options);

    if (typeof this.getValue() !== "number") {
      throw "Provided value is not a number";
    }

    params = params || {};

    this.__min = common.isFiniteNumber(params.min) ? params.min : undefined;
    this.__max = common.isFiniteNumber(params.max) ? params.max : undefined;
    this.__step = common.isFiniteNumber(params.step) ? params.step : undefined;
    this.__minimumSaneStepSize = params.minimumSaneStepSize || 1e-9;
    this.__maximumSaneStepSize = params.maximumSaneStepSize || 1e12;
    this.__mode = params.mode || "linear";

    this.__impliedStep = guestimateImpliedStep(
      this.initialValue,
      this.__step,
      this.__minimumSaneStepSize,
      this.__maximumSaneStepSize
    );

    this.__precision = numDecimals(this.__impliedStep);
  }


      setValue(v) {
        if (this.__min !== undefined && v < this.__min) {
          v = this.__min;
        } else if (this.__max !== undefined && v > this.__max) {
          v = this.__max;
        }

        if (this.__step !== undefined && v % this.__step !== 0) {
          v = Math.round(v / this.__step) * this.__step;
        }

        if (this.__mode !== "linear") {
          const old_step = this.__impliedStep;
          this.__impliedStep = guestimateImpliedStep(
            v,
            this.__step,
            this.__minimumSaneStepSize,
            this.__maximumSaneStepSize
          );
          if (old_step !== this.__impliedStep) {
            this.__precision = numDecimals(this.__impliedStep);
            console.log("number controller: new step = ", this.__impliedStep, ", precision: ", this.__precision);
          }
        }

        return NumberController.superclass.prototype.setValue.call(this, v);
      },

      /**
       * Specify a minimum value for <code>object[property]</code>.
       *
       * @param {Number} minValue The minimum value for
       * <code>object[property]</code>
       * @returns {dat.controllers.NumberController} this
       */
      min(v) {
        this.__min = common.isFiniteNumber(v) ? v : undefined;
        return this;
      },

      /**
       * Specify a maximum value for <code>object[property]</code>.
       *
       * @param {Number} maxValue The maximum value for
       * <code>object[property]</code>
       * @returns {dat.controllers.NumberController} this
       */
      max(v) {
        this.__max = common.isFiniteNumber(v) ? v : undefined;
        return this;
      },

      /**
       * Specify a step value that dat.controllers.NumberController
       * increments by.
       *
       * @param {Number} stepValue The step value for
       * dat.controllers.NumberController
       * @default if minimum and maximum specified increment is 1% of the
       * difference otherwise stepValue is 1  (TODO: INCORRECT; stepsize is ~10% of the current value)
       * @returns {dat.controllers.NumberController} this
       */
      step(v) {
        this.__step = common.isFiniteNumber(v) ? v : undefined;

        this.__impliedStep = guestimateImpliedStep(
          this.getValue(),
          this.__step,
          this.__minimumSaneStepSize,
          this.__maximumSaneStepSize
        );

        this.__precision = numDecimals(this.__impliedStep);

        return this;
      },

      mode(m) {
        this.__mode = m || "linear";

        return this;
      },

      getMetaInfo() {
        return {
          min: this.__min,
          max: this.__max,
          step: this.__step,
          minimumSaneStepSize: this.__minimumSaneStepSize,
          maximumSaneStepSize: this.__maximumSaneStepSize,
          mode: this.__mode,

          impliedStep: this.__impliedStep,
          precision: this.__precision
        };
      }
    }



export default NumberController;
