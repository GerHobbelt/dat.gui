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

import OptionController from "./OptionController";
import NumberControllerBox from "./NumberControllerBox";
import NumberControllerSlider from "./NumberControllerSlider";
import StringController from "./StringController";
import FunctionController from "./FunctionController";
import BooleanController from "./BooleanController";
import ColorController from "./ColorController";
import common from "../utils/common";

const ARR_SLICE = Array.prototype.slice;

const ControllerFactory = function (object, property) {
  const initialValue = object[property];

  // Providing options?
  if (common.isArray(arguments[2]) || common.isObject(arguments[2])) {
    return new OptionController(object, property, arguments[2]);
  }

  // Providing a map?
  if (common.isNumber(initialValue)) {
    // Has min and max? (slider)
    if (common.isNumber(arguments[2]) && common.isNumber(arguments[3])) {
      // has step?
      if (common.isNumber(arguments[4])) {
        return new NumberControllerSlider(object, property, arguments[2], arguments[3], arguments[4]);
      }

      return new NumberControllerSlider(object, property, arguments[2], arguments[3]);
    }

    // number box
    if (common.isNumber(arguments[4])) {
      // has step
      return new NumberControllerBox(object, property, { min: arguments[2], max: arguments[3], step: arguments[4] });
    }
    return new NumberControllerBox(object, property, { min: arguments[2], max: arguments[3] });
  }

  if (
    (common.isArray(initialValue) && initialValue.length >= 3 && initialValue.length <= 4) ||
    (common.isObject(initialValue) && initialValue.h && initialValue.s && initialValue.v) ||
    (common.isString(initialValue) &&
      initialValue[0] === "#" &&
      (initialValue.length === 4 || initialValue.length === 7))
  ) {
    return new ColorController(object, property);
  }

  if (common.isString(initialValue)) {
    return new StringController(object, property);
  }

  if (common.isFunction(initialValue)) {
    let opts = ARR_SLICE.call(arguments, 3);
    if (opts.length === 0) {
      opts = undefined;
    }
    return new FunctionController(object, property, options_1, opts);
  }

  if (common.isBoolean(initialValue)) {
    return new BooleanController(object, property);
  }

  // otherwise: we cannot 'sniff' the type of controller you want, since the
  // `initialValue` is null or undefined.

  return null;
};

export default ControllerFactory;
