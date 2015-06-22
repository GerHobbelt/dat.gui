// GUI.Controller = function() {

// 	this.parent = arguments[0];
//     this.object = arguments[1];
//     this.propertyName = arguments[2];
//     this.changeListeners = [];

// 	if (arguments.length > 0) this.initialValue = this.propertyName[this.object];

//     this.domElement = document.createElement('div');
//     this.domElement.setAttribute('class', 'guidat-controller ' + this.type);
    
//     this.propertyNameElement = document.createElement('span');
//     this.propertyNameElement.setAttribute('class', 'guidat-propertyname');
//     this.name(this.propertyName);
//     this.domElement.appendChild(this.propertyNameElement);
    

    
//     GUI.makeUnselectable(this.domElement);
    
// };



// GUI.Controller.prototype.name = function(n) {
// 	this.propertyNameElement.innerHTML = n;
// 	return this;
// };

// GUI.Controller.prototype.reset = function() {
// 	this.setValue(this.initialValue);
// 	return this;
// };

// GUI.Controller.prototype.listen = function() {
// 	this.parent.listenTo(this);
// 	return this;
// }

// GUI.Controller.prototype.unlisten = function() {
// 	this.parent.unlistenTo(this); // <--- hasn't been tested yet
// 	return this;
// }
    
// GUI.Controller.prototype.setValue = function(n) {

// 	this.object[this.propertyName] = n;
// 	for (var i in this.changeListeners) {
// 		this.changeListeners[i].call(this, n);
// 	}
// 	// Whenever you call setValue, the display will be updated automatically.
// 	// This reduces some clutter in subclasses. We can also use this method for listen().
// 	this.updateDisplay();
// 	return this;
// }
    
// GUI.Controller.prototype.addChangeListener = function(fnc) {
// 	this.changeListeners.push(fnc);
// 	return this;
// }




//
// EOF
//



/**
 * dat-gui JavaScript Controller Library
 * http://code.google.com/p/dat-gui
 *
 * Copyright 2011 Data Arts Team, Google Creative Lab
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */

define([
   'dat/utils/common'
], function(common) {
  'use strict';

  /**
   * @class An "abstract" class that represents a given property of an object.
   *
   * @param {Object} object The object to be manipulated
   * @param {string} property The name of the property to be manipulated
   *
   * @member dat.controllers
   */
  var Controller = function(object, property, type, options) {
    this.initialValue = object[property];

    /**
     * Those who extend this class will put their DOM elements in here.
     * @type {DOMElement}
     */
    this.domElement = document.createElement('div');

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
  };

  common.extend(
      Controller.prototype,

      /** @lends dat.controllers.Controller.prototype */
      {
        /**
         * Specify a function which fires every time someone has changed the value with
         * this Controller.
         *
         * @param {Function} fnc This function will be called whenever the value
         * has been modified via this Controller.
         * @returns {dat.controllers.Controller} this
         */
        onChange: function(fnc) {
          this.__onChange = fnc;
          return this;
        },

        /**
         * Specify a function which fires every time when someone is about to change the value with
         * this Controller.
         *
         * @param {Function} fnc This function will be called whenever the value
         * is going to be modified via this Controller.
         * @returns {dat.controllers.Controller} this
         */
        onBeforeChange: function(fnc) {
          this.__onBeforeChange = fnc;
          return this;
        },

        /**
         * Specify a function which fires every time someone "finishes" changing
         * the value with this Controller. Useful for values that change
         * incrementally like numbers or strings.
         *
         * @param {Function} fnc This function will be called whenever
         * someone "finishes" changing the value via this Controller.
         * @returns {dat.controllers.Controller} this
         */
        onFinishChange: function(fnc) {
          this.__onFinishChange = fnc;
          return this;
        },

        /**
         * Fire the registered onChange function if it exists. The first argument will be the current
         * property value, while the second argument carries any optional user-specified extra event info.
         *
         * @param  {object} event_info Optional user-specified extra event info.
         *
         * @returns {dat.controllers.Controller} this
         */
        fireChange: function(event_info) {
          if (this.__onChange) {
            this.__onChange(this.getValue(), event_info);
          }
          return this;
        },

        /**
         * Fire the registered onBeforeChange function if it exists. The first argument will be the current
         * property value, while the second argument carries any optional user-specified extra event info.
         *
         * @param  {object} event_info Optional user-specified extra event info.
         *
         * @returns {boolean} A truthy return value signals us to *not* apply the change; a falsey return
         * value permits the change to happen.
         */
        fireBeforeChange: function(event_info) {
          if (this.__onBeforeChange) {
            return this.__onBeforeChange(this.getValue(), event_info);
          }
          return false;  // default: you are cleared to apply the change. 
        },

        /**
         * Fire the registered onFinishChange function if it exists. The first argument will be the current
         * property value, while the second argument carries any optional user-specified extra event info.
         *
         * @param  {object} event_info Optional user-specified extra event info.
         *
         * @returns {dat.controllers.Controller} this
         */
        fireFinishChange: function(event_info) {
          if (this.__onFinishChange) {
            this.__onFinishChange(this.getValue(), event_info);
          }
          return this;
        },

        /**
         * Change the value of <code>object[property]</code>
         *
         * @param {Object} newValue The new value of <code>object[property]</code>
         *
         * @param {Boolean} silent If true, don't call the onChange handler
         */
        setValue: function(newValue, silent) {
          var no_go = false;
          var changed = (this.object[this.property] !== newValue);
          if (!silent) {
            // `newValue` will end up in the second argument of the event listener, thus
            // userland code can look at both existing and new values for this property
            // and decide what to do accordingly!
            no_go = this.fireBeforeChange({
              newValue: newValue, 
              isChange: changed,
              silent: silent
            });
          }
          if (!no_go) {
            this.object[this.property] = newValue;
          }
          // Always fire the change event; inform the userland code whether the change was 'real'
          // or aborted:
          if (!silent) {
            this.fireChange(changed);
          }
          // Whenever you call setValue, the display will be updated automatically.
          // This reduces some clutter in subclasses.
          this.updateDisplay();
          return this;
        },

        /**
         * Gets the value of <code>object[property]</code>
         *
         * @returns {Object} The current value of <code>object[property]</code>
         */
        getValue: function() {
          return this.object[this.property];
        },

        getOption: function(name) {
          return this.__options[name];
        },

        setOption: function(name, value) {
          this.__options[name] = value;
        },

        getReadonly: function() {
          return this.getOption('readonly');
        },

        setReadonly: function(value) {
          this.setOption('readonly', value);
          this.updateDisplay();
        },

        /**
         * Refreshes the visual display of a Controller in order to keep sync
         * with the object's current value.
         * @returns {dat.controllers.Controller} this
         */
        updateDisplay: function() {
          return this;
        },

        /**
         * @returns {Boolean} true if the value has deviated from initialValue
         */
        isModified: function() {
          return this.initialValue !== this.getValue();
        }
      }
  );

  return Controller;
});

