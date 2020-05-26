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

// ------------------------------------------------------------------
//
// extra: help rollup to produce the accompanying CSS file
//
import "./index.scss";
// ------------------------------------------------------------------

import Color from "./color/Color";
import math from "./color/math";
import interpret from "./color/interpret";

import Controller from "./controllers/Controller";
import Array1Controller from "./controllers/Array1Controller";
import ArrayNController from "./controllers/ArrayNController";
import BgColorController from "./controllers/BgColorController";
import BooleanController from "./controllers/BooleanController";
import ColorController from "./controllers/ColorController";
import CustomController from "./controllers/CustomController";
import FileController from "./controllers/FileController";
import FunctionController from "./controllers/FunctionController";
import GtColorController from "./controllers/GtColorController";
import HSVColorController from "./controllers/HSVColorController";
import ImageController from "./controllers/ImageController";
import NgColorController from "./controllers/NgColorController";
import NumberController from "./controllers/NumberController";
import NumberControllerBox from "./controllers/NumberControllerBox";
import NumberControllerSlider from "./controllers/NumberControllerSlider";
import OptionController from "./controllers/OptionController";
import PlotterController from "./controllers/PlotterController";
import StringController from "./controllers/StringController";
import TabbedController from "./controllers/TabbedController";

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
  Array1Controller: Array1Controller,
  ArrayController: ArrayNController,
  BgColorController: BgColorController,
  BooleanController: BooleanController,
  ColorController: ColorController,
  CustomController: CustomController,
  FileController: FileController,
  FunctionController: FunctionController,
  GtColorController: GtColorController,
  HSVColorController: HSVColorController,
  ImageController: ImageController,
  NgColorController: NgColorController,
  NumberController: NumberController,
  NumberControllerBox: NumberControllerBox,
  NumberControllerSlider: NumberControllerSlider,
  OptionController: OptionController,
  PlotterController: PlotterController,
  StringController: StringController,
  TabbedController: TabbedController,
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
 * @type {GUI}
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
