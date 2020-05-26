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

import Controller from "./Controller";
import dom from "../dom/dom";

// import "./ImageFileController.css";

/**
 * @class Provides a image/file input to alter the url property on an object
 *
 * @extends dat.controllers.Controller
 *
 * @param {Object} object The object to be manipulated
 * @param {string} property The name of the property to be manipulated
 *
 * @member dat.controllers
 */
class ImageFileController extends Controller {
  constructor(object, property) {
    super(object, property, "image");

    const _this = this;

    this.__input = document.createElement("input");
    this.__input.setAttribute("type", "file");
    this.__input.style.display = "none";

    this.__label = document.createElement("label");
    this.__label.innerText = this.getValue();
    this.__label.appendChild(this.__input);

    this.__previewImage = document.createElement("img");

    dom.addClass(this.__previewImage, "GUI-preview-image");
    dom.addClass(this.__label, "GUI-label-image");

    function onChange() {
      const file = _this.__input.files[0];
      const url = URL.createObjectURL(file);
      _this.__previewImage.src = url;
      _this.setValue(url);
    }

    dom.bind(this.__input, "change", onChange);
    // todo: bind onDragRelease

    this.updateDisplay();
    this.domElement.appendChild(this.__previewImage);
    this.domElement.appendChild(this.__label);
  }

  updateDisplay() {
    this.__previewImage.src = this.getValue();
    return super.updateDisplay();
  }
}

export default ImageFileController;
