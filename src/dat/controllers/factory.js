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
  'dat/controllers/OptionController',
  'dat/controllers/NumberControllerBox',
  'dat/controllers/NumberControllerSlider',
  'dat/controllers/StringController',
  'dat/controllers/FunctionController',
  'dat/controllers/BooleanController',
  'dat/utils/common'
],
    function(OptionController, NumberControllerBox, NumberControllerSlider, StringController, FunctionController, BooleanController, common) {

      return function(object, property, options_1, options_2, options_3) {

        var initialValue = object[property];

        // Providing options?
        if (common.isArray(options_1) || common.isObject(options_1)) {
          return new OptionController(object, property, options_1);
        }

        // Providing a map?

        if (common.isNumber(initialValue)) {

          if (common.isNumber(options_1) && common.isNumber(options_2)) {

            // Has min and max.
            if (common.isNumber(options_3)) // has step
                return new NumberControllerSlider(object, property, options_1, options_2, options_3);
            else
                return new NumberControllerSlider(object, property, options_1, options_2);

          } else {

            return new NumberControllerBox(object, property, { min: options_1, max: options_2 });

          }

        }

        if (common.isString(initialValue)) {
          return new StringController(object, property);
        }

        if (common.isFunction(initialValue)) {
          return new FunctionController(object, property, '');
        }

        if (common.isBoolean(initialValue)) {
          return new BooleanController(object, property);
        }

      }

    });
