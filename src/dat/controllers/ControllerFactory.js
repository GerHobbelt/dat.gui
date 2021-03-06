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
import ImageController from "./ImageController";
import ObjectController from "./ObjectController";
import NullController from "./NullController";
import UndefinedController from "./UndefinedController";
import common from "../utils/common";

let firstTimeImageController = true;

const ARR_SLICE = Array.prototype.slice;

function isControllerTemplate(f) {
  return (
    typeof f === "function" &&
    f.prototype &&
    typeof f.prototype.onBeforeChange === "function" &&
    typeof f.prototype.onChange === "function" &&
    typeof f.prototype.onFinishChange === "function" &&
    typeof f.prototype.setValue === "function" &&
    typeof f.prototype.getValue === "function" &&
    typeof f.prototype.updateDisplay === "function"
  );
}

const ControllerFactory = function (
  object,
  property,
  options_1,
  options_2,
  options_3,
  options_4,
  options_5,
  options_6
) {
  const dyninfo = common.setupDynamicProperty(object, property);

  const initialValue = !dyninfo ? object[property] : dyninfo.getter.call(object);

  // Providing options?
  if (common.isArray(options_1) || common.isObject(options_1)) {
    return new OptionController(object, property, options_1);
  }

  // Providing a map?
  if (common.isNumber(initialValue)) {
    // Has min and max? (slider)
    if (common.isNumber(options_1) && common.isNumber(options_2)) {
      // Has min and max.
      return new NumberControllerSlider(
        object,
        property,
        options_1,
        options_2,
        options_3,
        options_4,
        options_5,
        options_6
      );
    }
    // number box
    return new NumberControllerBox(object, property, {
      min: options_1,
      max: options_2,
      step: options_3,
      minimumSaneStepSize: options_4,
      maximumSaneStepSize: options_5,
      mode: options_6,
    });
  }

  if (common.isImagePath(initialValue)) {
    if (firstTimeImageController) {
      // ImageController.useDefaultStyles();
      firstTimeImageController = false;
    }
    return new ImageController(object, property);
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

  if (common.isArray(initialValue) || common.isObject(initialValue)) {
    return new ObjectController(object, property);
  }

  if (initialValue === null) {
    return new NullController(object, property);
  }
  if (initialValue === undefined && property in object) {
    return new UndefinedController(object, property);
  }

  return null;
};

export default ControllerFactory;
