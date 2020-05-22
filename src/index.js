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

//
// OBSOLETE STUFF?
//
// old v0.4 code which needs to be integrated or otherwise thrown away
//

define([
  "dat/gui/GUI",

  "dat/controllers/Controller",
  "dat/controllers/StringController",
  "dat/controllers/BooleanController",
  "dat/controllers/FunctionController",
  "dat/controllers/NumberControllerBox",
  "dat/controllers/NumberController",
  "dat/controllers/NumberControllerSlider",
  "dat/controllers/OptionController",
  "dat/controllers/ColorController",
  "dat/controllers/ImageController",
  "dat/controllers/factory",

  "dat/dom/CenteredDiv",
  "dat/dom/dom",

  "dat/color/math",
  "dat/color/interpret",
  "dat/color/Color",
  "dat/color/toString",

  "dat/utils/css",
  "dat/utils/common",
  "dat/utils/requestAnimationFrame",
], function (
  dat_gui_GUI,

  dat_controllers_Controller,
  dat_controllers_StringController,
  dat_controllers_BooleanController,
  dat_controllers_FunctionController,
  dat_controllers_NumberControllerBox,
  dat_controllers_NumberController,
  dat_controllers_NumberControllerSlider,
  dat_controllers_OptionController,
  dat_controllers_ColorController,
  dat_controllers_ImageController,
  dat_controllers_factory,

  dat_dom_CenteredDiv,
  dat_dom_dom,

  dat_color_math,
  dat_color_interpret,
  dat_color_Color,
  dat_color_toString,

  dat_utils_css,
  dat_utils_common,
  dat_utils_requestAnimationFrame
) {
  const dat = {
    utils: {
      css: dat_utils_css,
      common: dat_utils_common,
      requestAnimationFrame: dat_utils_requestAnimationFrame,
    },
    controller: {
      Controller: dat_controllers_Controller,
      OptionController: dat_controllers_OptionController,
      NumberController: dat_controllers_NumberController,
      NumberControllerBox: dat_controllers_NumberControllerBox,
      NumberControllerSlider: dat_controllers_NumberControllerSlider,
      StringController: dat_controllers_StringController,
      FunctionController: dat_controllers_FunctionController,
      BooleanController: dat_controllers_BooleanController,
      ImageController: dat_controllers_ImageController,
      ColorController: dat_controllers_ColorController,
      factory: dat_controllers_factory,
    },
    dom: {
      dom: dat_dom_dom,
      CenteredDiv: dat_dom_CenteredDiv,
    },
    color: {
      toString: dat_color_toString,
      interpret: dat_color_interpret,
      math: dat_color_math,
      Color: dat_color_Color,
    },
    gui: {
      GUI: dat_gui_GUI,
    },
  };

  return dat;
});
