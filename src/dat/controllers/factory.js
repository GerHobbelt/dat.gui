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
  'dat/controllers/OptionController',
  'dat/controllers/NumberControllerBox',
  'dat/controllers/NumberControllerSlider',
  'dat/controllers/StringController',
  'dat/controllers/FunctionController',
  'dat/controllers/BooleanController',
  'dat/utils/common'
],
    function(Controller, OptionController, NumberControllerBox, NumberControllerSlider, StringController, FunctionController, BooleanController, common) {

      var ARR_SLICE = Array.prototype.slice;

      function isControllerTemplate(f) {
        return typeof f === 'function' &&
            f.prototype &&
            typeof f.prototype.onChange === 'function' &&
            typeof f.prototype.onFinishChange === 'function' &&
            typeof f.prototype.setValue === 'function' &&
            typeof f.prototype.getValue === 'function' &&
            typeof f.prototype.updateDisplay === 'function';
      }

      return function(object, property, controllerName, controllers, options_1, options_2, options_3, options_4, options_5, options_6) {

        // when the user specified a specific controller, we'll be using that one, otherwise we 'sniff' the correct controller giving the input values & ditto types.
        var controller = controllers[controllerName];
        if (!controller && /* controllerName instanceof Controller */ isControllerTemplate(controllerName)) {
          controller = controllerName;
        }
        if (controller) {
          return new controller(object, property, options_1, options_2, options_3, options_4, options_5, options_6);
        }

        var initialValue = object[property];

        // Providing options?
        if (common.isArray(options_1) || common.isObject(options_1)) {
          return new OptionController(object, property, options_1);
        }

        // Providing a map?

        if (common.isNumber(initialValue)) {

          if (common.isNumber(options_1) && common.isNumber(options_2)) {

            // Has min and max.
            return new NumberControllerSlider(object, property, options_1, options_2, options_3, options_4, options_5, options_6);

          } else {

            return new NumberControllerBox(object, property, { 
              min: options_1, 
              max: options_2, 
              step: options_3, 
              minimumSaneStepSize: options_4, 
              maximumSaneStepSize: options_5,
              mode: options_6
            });

          }

        }

        if (common.isString(initialValue)) {
          return new StringController(object, property);
        }

        if (common.isFunction(initialValue)) {
          var opts = ARR_SLICE.call(arguments, 5);
          if (opts.length === 0) {
            opts = undefined;
          }
          return new FunctionController(object, property, (common.isUndefined(options_1) ? '' : options_1), opts);
        }

        if (common.isBoolean(initialValue)) {
          return new BooleanController(object, property);
        }

        // otherwise: we cannot 'sniff' the type of controller you want, since the
        // `initialValue` is null or undefined.
        return false;
      }

    });
