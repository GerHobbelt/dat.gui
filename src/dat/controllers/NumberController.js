/**
 * dat-gui JavaScript Controller Library
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

define([
    'dat/controllers/Controller',
    'dat/utils/common'
], function(Controller, common) {
  'use strict';

  /**
   * When the user didn't specify a sane step size, infer a suitable stepsize from the initialValue.
   */
  function guestimateImpliedStep(initialValue, userSpecifiedStep, minimumSaneStepSize, maximumSaneStepSize) {
    if (common.isFiniteNumber(userSpecifiedStep)) {
      return userSpecifiedStep;
    }

    var v;
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
  var NumberController = function(object, property, params) {
    NumberController.superclass.call(this, object, property);

    params = params || {};

    this.__min = (common.isFiniteNumber(params.min) ? params.min : undefined);
    this.__max = (common.isFiniteNumber(params.max) ? params.max : undefined);
    this.__step = (common.isFiniteNumber(params.step) ? params.step : undefined);
    this.__minimumSaneStepSize = params.minimumSaneStepSize || 1E-9;
    this.__maximumSaneStepSize = params.maximumSaneStepSize || 1E12;
    this.__mode = params.mode || 'linear';

    this.__impliedStep = guestimateImpliedStep(this.initialValue, this.__step, this.__minimumSaneStepSize, this.__maximumSaneStepSize);

    this.__precision = numDecimals(this.__impliedStep);
  };

  NumberController.superclass = Controller;

  common.extend(
      NumberController.prototype,
      Controller.prototype,

      /** @lends dat.controllers.NumberController.prototype */
      {
        setValue: function(v) {
          if (this.__min !== undefined && v < this.__min) {
            v = this.__min;
          } else if (this.__max !== undefined && v > this.__max) {
            v = this.__max;
          }

          if (this.__step !== undefined && v % this.__step !== 0) {
            v = Math.round(v / this.__step) * this.__step;
          }

          if (this.__mode !== 'linear') {
            var old_step = this.__impliedStep;
            this.__impliedStep = guestimateImpliedStep(v, this.__step, this.__minimumSaneStepSize, this.__maximumSaneStepSize);
            if (old_step !== this.__impliedStep) {
              this.__precision = numDecimals(this.__impliedStep);
              console.log('number controller: new step = ', this.__impliedStep, ', precision: ', this.__precision);
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
        min: function(v) {
          this.__min = (common.isFiniteNumber(v) ? v : undefined);
          return this;
        },

        /**
         * Specify a maximum value for <code>object[property]</code>.
         *
         * @param {Number} maxValue The maximum value for
         * <code>object[property]</code>
         * @returns {dat.controllers.NumberController} this
         */
        max: function(v) {
          this.__max = (common.isFiniteNumber(v) ? v : undefined);
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
        step: function(v) {
          this.__step = (common.isFiniteNumber(v) ? v : undefined);

          this.__impliedStep = guestimateImpliedStep(this.getValue(), this.__step, this.__minimumSaneStepSize, this.__maximumSaneStepSize);

          this.__precision = numDecimals(this.__impliedStep);
          return this;
        },

        mode: function(m) {
          this.__mode = m || 'linear';

          return this;
        },

        getMetaInfo: function() {
          return {
            min: this.__min, 
            max: this.__max, 
            step: this.__step, 
            minimumSaneStepSize: this.__minimumSaneStepSize, 
            maximumSaneStepSize: this.__maximumSaneStepSize,
            mode: this.__mode
          };
        }
      }
  );

  function numDecimals(x) {
    x = x.toString();
    if (x.indexOf('.') > -1) {
      return x.length - x.indexOf('.') - 1;
    } else {
      return 0;
    }
  }

  return NumberController;
});
