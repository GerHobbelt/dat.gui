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
  constructor(object, property, type, options) {
    /**
     * The dynamic property info chunk, if applicable. Carries the getter and setter for this object/property.
     * @type {Object}
     * @ignore
     */
    this.__dyninfo = common.setupDynamicProperty(object, property);

    /**
     * The initial value of the given property; this is the reference for the
     * `isModified()` and other APIs.
     * @type {Any}
     */
    this.initialValue = !this.__dyninfo ? object[property] : this.__dyninfo.getter.call(object);

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
     * The name of the controller. Default value is the controller *type*.
     * @type {String}
     */
    this.name = type;

    /**
     * Keep track of the options
     */
    this.__options = options || {};

    /**
     * The function to be called on change.
     * @type {Function}
     * @ignore
     */
    this.__onChange = undefined;

    /**
     * The function to be called before applying a change.
     * @type {Function}
     * @ignore
     */
    this.__onBeforeChange = undefined;

    /**
     * The function to be called on finishing change.
     * @type {Function}
     * @ignore
     */
    this.__onFinishChange = undefined;
  }

  /**
   * Specify a function which fires every time someone has changed the value with
   * this Controller.
   *
   * @param {Function} fnc This function will be called whenever the value
   * has been modified via this Controller.
   * @returns {dat.controllers.Controller} this
   */
  onChange(fnc) {
    this.__onChange = fnc;
    return this;
  }

  /**
   * Specify a function which fires every time when someone is about to change the value with
   * this Controller.
   *
   * @param {Function} fnc This function will be called whenever the value
   * is going to be modified via this Controller.
   * @returns {dat.controllers.Controller} this
   */
  onBeforeChange(fnc) {
    this.__onBeforeChange = fnc;
    return this;
  }

  /**
   * Specify a function which fires every time someone "finishes" changing
   * the value with this Controller. Useful for values that change
   * incrementally like numbers or strings.
   *
   * @param {Function} fnc This function will be called whenever
   * someone "finishes" changing the value via this Controller.
   * @returns {dat.controllers.Controller} this
   */
  onFinishChange(fnc) {
    this.__onFinishChange = fnc;
    return this;
  }

  /**
   * Fire the registered onChange function if it exists. The first argument will be the current
   * property value, while the second argument carries any optional user-specified extra event info.
   *
   * @param  {object} event_info Optional user-specified extra event info.
   *
   * @returns {dat.controllers.Controller} this
   */
  fireChange(event_info) {
    if (this.__onChange) {
      this.__onChange(this.getValue(), event_info);
    }
    return this;
  }

  /**
   * Fire the registered onBeforeChange function if it exists. The first argument will be the current
   * property value, while the second argument carries any optional user-specified extra event info.
   *
   * @param  {object} event_info Optional user-specified extra event info.
   *
   * @returns {boolean} A truthy return value signals us to *not* apply the change; a falsey return
   * value permits the change to happen.
   */
  fireBeforeChange(event_info) {
    if (this.__onBeforeChange) {
      return this.__onBeforeChange(this.getValue(), event_info);
    }
    return false; // default: you are cleared to apply the change.
  }

  /**
   * Fire the registered onFinishChange function if it exists. The first argument will be the current
   * property value, while the second argument carries any optional user-specified extra event info.
   *
   * @param  {object} event_info Optional user-specified extra event info.
   *
   * @returns {dat.controllers.Controller} this
   */
  fireFinishChange(event_info) {
    if (this.__onFinishChange) {
      this.__onFinishChange(this.getValue(), event_info);
    }
    return this;
  }

  /**
   * @internal
   * Change the value of <code>object[property]</code>. Do not fire any events. Invoked
   * by the `setValue()` API.
   *
   * @param {Object} newValue The new value of <code>object[property]</code>
   */
  __setValue(newValue) {
    if (!this.__dyninfo) {
      this.object[this.property] = newValue;
    } else if (this.__dyninfo.setter) {
      this.__dyninfo.setter.call(this.object, newValue);
    } else {
      throw new Error(
        "Cannot modify the read-only " + (this.__dyninfo ? "dynamic " : "") + 'property "' + this.property + '"'
      );
    }
    return this;
  }

  /**
   * Change the value of <code>object[property]</code>
   *
   * @param {Object} newValue The new value of <code>object[property]</code>
   *
   * @param {Boolean} silent If true, don't call the onChange handler
   */
  setValue(newValue, silent) {
    const readonly = this.getReadonly();
    const oldValue = this.getValue();
    const changed = oldValue !== newValue;
    const msg = {
      newValue: newValue,
      oldValue: oldValue,
      isChange: changed,
      silent: silent,
      noGo: readonly,
      eventSource: "setValue",
    };
    if (!silent) {
      // `newValue` will end up in the second argument of the event listener, thus
      // userland code can look at both existing and new values for this property
      // and decide what to do accordingly!
      msg.noGo = this.fireBeforeChange(msg);
    }
    if (!msg.noGo) {
      this.__setValue(msg.newValue);
    }
    // Always fire the change event; inform the userland code whether the change was 'real'
    // or aborted:
    if (!msg.silent) {
      this.fireChange(msg);
    }
    // Whenever you call `setValue`, the display will be updated automatically.
    // This reduces some clutter in subclasses.
    this.updateDisplay();
    return this;
  }

  /**
   * Gets the value of <code>object[property]</code>
   *
   * @returns {Object} The current value of <code>object[property]</code>
   */
  getValue() {
    return !this.__dyninfo ? this.object[this.property] : this.__dyninfo.getter.call(this.object);
  }

  getOption(name) {
    return this.__options[name];
  }

  setOption(name, value) {
    this.__options[name] = value;
  }

  getReadonly() {
    // flag a read-only dynamic property irrespective of the actual option setting:
    if (this.__dyninfo && !this.__dyninfo.setter) {
      return true;
    }
    return this.getOption("readonly");
  }

  setReadonly(value) {
    this.setOption("readonly", value);
    this.updateDisplay();
  }

  /**
   * Refreshes the visual display of a Controller in order to keep sync
   * with the object's current value.
   * @returns {dat.controllers.Controller} this
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
}

export default Controller;
