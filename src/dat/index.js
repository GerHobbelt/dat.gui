/**
 * dat.GUI JavaScript Controller Library
 * http://code.google.com/p/dat-gui
 *
 * Copyright 2011-2019 Data Arts Team, Google Creative Lab
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import Color from "./color/Color";
import math from "./color/math";
import interpret from "./color/interpret";

import Controller from "./controllers/Controller";
import BooleanController from "./controllers/BooleanController";
import OptionController from "./controllers/OptionController";
import StringController from "./controllers/StringController";
import NumberController from "./controllers/NumberController";
import NumberControllerBox from "./controllers/NumberControllerBox";
import NumberControllerSlider from "./controllers/NumberControllerSlider";
import FunctionController from "./controllers/FunctionController";
import TabbedController from "./controllers/TabbedController";
import ColorController from "./controllers/ColorController";
import FileController from "./controllers/FileController";
import PlotterController from "./controllers/PlotterController";
import CustomController from "./controllers/CustomController";
import ImageController from "./controllers/ImageController";
import ArrayController from "./controllers/ArrayController";

import domImport from "./dom/dom";
import GUIImport from "./gui/GUI";

/** @module dat */

/**
 * [color description]
 * @type {Object}
 */
export const color = {
  Color: Color,
  math: math,
  interpret: interpret,
};

/**
 * [controllers description]
 * @type {Object}
 */
export const controllers = {
  Controller: Controller,
  BooleanController: BooleanController,
  OptionController: OptionController,
  StringController: StringController,
  NumberController: NumberController,
  NumberControllerBox: NumberControllerBox,
  NumberControllerSlider: NumberControllerSlider,
  FunctionController: FunctionController,
  TabbedController: TabbedController,
  ColorController: ColorController,
  FileController: FileController,
  PlotterController: PlotterController,
  CustomController: CustomController,
  ImageController: ImageController,
  ArrayController: ArrayController,
};

/**
 * [dom description]
 * @type {Object}
 */
export const dom = { dom: domImport };

/**
 * [gui description]
 * @type {Object}
 */
export const gui = { GUI: GUIImport };

/**
 * [GUI description]
 * @type {[type]}
 */
export const GUI = GUIImport;

/**
 * TBD
 */
const datGUI = {
  color,
  controllers,
  dom,
  gui,
  GUI,
};
export default datGUI;
