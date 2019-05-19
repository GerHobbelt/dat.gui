/**
 * Created by pery on 16/08/14.
 */

import Controller from "./Controller";
import dom from "../dom/dom";

import "./ImageController.css";

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
class ImageController extends Controller {
  constructor(Object, property) {
    super(Object, property);

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


  /**
   * Injects default stylesheet for slider elements.
   */
  useDefaultStyles() {
    css.inject(styleSheet);
  }

    updateDisplay() {
      this.__previewImage.src = this.getValue();
      return ImageController.superclass.prototype.updateDisplay.call(this);
    }
  };


export default ImageController;
