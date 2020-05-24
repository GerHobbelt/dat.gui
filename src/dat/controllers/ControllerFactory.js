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

import VectorController from "./VectorController";
import OptionController from "./OptionController";
import NumberControllerBox from "./NumberControllerBox";
import NumberControllerSlider from "./NumberControllerSlider";
import StringController from "./StringController";
import TextAreaController from "./TextAreaController";
import FunctionController from "./FunctionController";
import TabbedController from "./TabbedController";
import BooleanController from "./BooleanController";
import ColorController from "./ColorController";
import ObjectController from "./ObjectController";
import NullController from "./NullController";
import ArrayController from "./ArrayController";
import UndefinedController from "./UndefinedController";
import common from "../utils/common";

const ARR_SLICE = Array.prototype.slice;

const controllerFactory = function (object, property, ...optionalArgs) {
  const initialValue = object[property];
  const [optlist] = optionalArgs;

  // Providing options?
  if (optlist != null && (common.isArray(optlist) || common.isObject(optlist))) {
    return new OptionController(object, property, optlist);
  }

  // Providing a map?
  if (common.isNumber(initialValue)) {
    const [min, max, step, enumeration] = optionalArgs;
    // Has min and max? (slider)
    // Don't care about step (may be undefined) or enumeration value (that one's optional too)
    if (common.isNumber(min) && common.isNumber(max)) {
      return new NumberControllerSlider(object, property, min, max, step, enumeration);
    }

    // number box: step is optional and may be 'undefined'.
    return new NumberControllerBox(object, property, {
      min,
      max,
      step,
    });
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

  if (common.isArray(initialValue) && initialValue.length === 2) {
    if (arguments.length > 3) {
      return new VectorController(object, property, arguments[2], arguments[3]);
    }

    return new VectorController(object, property);
  }

  if (common.isString(initialValue)) {
    return new StringController(object, property);
  }

  // arguments[2] is tabs. arguments[3] is the name of the object
  if (common.isFunction(initialValue) && arguments[2] !== undefined) {
    return new TabbedController(object, property, "", arguments[2] || 0, arguments[3] || "Object");
  }

  if (common.isFunction(initialValue)) {
    const [arg1] = optionalArgs;
    let opts = ARR_SLICE.call(optionalArgs, 1);
    if (opts.length === 0) {
      opts = undefined;
    }
    return new FunctionController(object, property, arg1, opts);
  }

  if (common.isBoolean(initialValue)) {
    return new BooleanController(object, property);
  }

  if (common.isArray(initialValue)) {
    return new ArrayController(object, property);
  }

  if (common.isObject(initialValue)) {
    return new ObjectController(object, property);
  }

  if (initialValue === null) {
    return new NullController(object, property);
  }
  if (initialValue === undefined && property in object) {
    return new UndefinedController(object, property);
  }

  // otherwise: we cannot 'sniff' the type of controller you want, since the
  // `initialValue` is null or undefined.

  return null;
};

export default controllerFactory;
