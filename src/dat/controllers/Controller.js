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

/**
 * @class An "abstract" class that represents a given property of an object.
 *
 * @param {Object} object The object to be manipulated
 * @param {string} property The name of the property to be manipulated
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
     * Readonly field
     * @type {Object}
     */
    this._readonly = false;

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

    this.__transformInput = x => x;

    this.__transformOutput = x => x;

    /**
     * Whether to force update a display, even when input is active.
     * @type boolean
     */
    this.forceUpdateDisplay = false;
  }

  /**
   * Hides the controller on it's parent GUI.
   */
  hide() {
    this.domElement.parentNode.parentNode.style.display = "none";
    return this;
  }

  /**
   * Shows the controller on it's parent GUI.
   */
  show() {
    this.domElement.parentNode.parentNode.style.display = "";
    return this;
  }

  /**
   * Specify that a function fire every time someone changes the value with
   * this Controller.
   *
   * @param {Function} fnc This function will be called whenever the value
   * is modified via this Controller.
   * @returns {Controller} this
   */
  onChange(fnc) {
    this.__onChange = fnc;
    return this;
  }

  /**
   * Specify that a function fire every time someone "finishes" changing
   * the value wih this Controller. Useful for values that change
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
  setValue(newValue, disableOnChange = false) {
    const __newValue = this.__transformOutput(newValue);
    const oldValue = this.object[this.property];
    this.object[this.property] = __newValue;
    if (this.__onChange && !disableOnChange) {
      this.__onChange.call(this, __newValue, oldValue);
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
    return this.__transformInput(this.object[this.property]);
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
   * @returns {Boolean} true if the value has deviated from initialValue
   */
  isModified() {
    return this.initialValue !== this.getValue();
  }

  transform(transformInput = x => x, transformOutput = x => x) {
    this.__transformInput = transformInput;
    this.__transformOutput = transformOutput;

    this.updateDisplay();

    return this;
  }

  /**
   * Set readonly mode
   *
   * @param {Number} ro
   * @default false
   * @returns {dat.controllers.StringController} this
   */
  readonly(ro) {
    this._readonly = ro;
    return this;
  }
  
  borderColor(color) {
    this.__li.style.borderLeftColor = color;
    return this;
  }

  borderWidth(px) {
    this.__li.style.borderLeftWidth = px + "px";
    return this;
  }
}

export default Controller;
