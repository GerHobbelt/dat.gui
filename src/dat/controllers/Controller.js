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

/**
 * @class An "abstract" class that represents a given property of an object.
 *
 * @param {Object} object The object to be manipulated
 * @param {string} property The name of the property to be manipulated
 *
 * @member dat.controllers
 */
class Controller {
  constructor(object, property) {
    this.initialValue = object[property];

    /**
     * Those who extend this class will put their DOM elements in here.
     * @type {DOMElement}
     */
    this.domElement = document.createElement("div");

    /**
     * The object to manipulate
     * @type {Object}
     */
    this.object = object;

    /**
     * The name of the property to manipulate
     * @type {String}
     */
    this.property = property;

    /**
     * The function to be called on change.
     * @type {Function}
     * @private
     */
    this.__onChange = undefined;

    /**
     * The function to be called on finishing change.
     * @type {Function}
     * @private
     */
    this.__onFinishChange = undefined;
  }

  /**
   * Specify a function which fires every time someone has changed the value with
   * this Controller.
   *
   * @param {Function} fnc This function will be called whenever the value
   * has been modified via this Controller.
   * @returns {Controller} this
   */
  onChange(fnc) {
    this.__onChange = fnc;
    return this;
  }

  /**
   * Specify a function which fires every time someone "finishes" changing
   * the value with this Controller. Useful for values that change
   * incrementally like numbers or strings.
   *
   * @param {Function} fnc This function will be called whenever
   * someone "finishes" changing the value via this Controller.
   * @returns {Controller} this
   */
  onFinishChange(fnc) {
    this.__onFinishChange = fnc;
    return this;
  }

  /**
   * Change the value of <code>object[property]</code>
   *
   * @param {Object} newValue The new value of <code>object[property]</code>
   */
  setValue(newValue) {
    this.object[this.property] = newValue;
    if (this.__onChange) {
      this.__onChange.call(this, newValue);
    } else if (this.__onFinishChange) {
      this.__onFinishChange.call(this, newValue);
    }
    this.updateDisplay();
    return this;
  }

  /**
   * Gets the value of <code>object[property]</code>
   *
   * @returns {Object} The current value of <code>object[property]</code>
   */
  getValue() {
    return this.object[this.property];
  }

  /**
   * Set the drop handler
   *
   * @param {function} handler
   */
  setDropHandler(handler) {
    this.domElement.ondragover = function (event) {
      event.preventDefault();
    };
    this.domElement.ondrop = function (event) {
      event.preventDefault();
      handler.call(this, event.dataTransfer.getData("text"));
    };

    return this;
  }

  /**
   * Refreshes the visual display of a Controller in order to keep sync
   * with the object's current value.
   * @returns {Controller} this
   */
  updateDisplay() {
    return this;
  }

  /**
   * @returns {boolean} true if the value has deviated from initialValue
   */
  isModified() {
    return this.initialValue !== this.getValue();
  }
}

export default Controller;
