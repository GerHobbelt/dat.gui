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
    'dat/controllers/Controller',
    'dat/dom/dom',
    'dat/utils/common'
],
function(Controller, dom, common) {

  /**
   * @class Provides a select input to alter the property of an object, using a
   * list of accepted values.
   *
   * @extends dat.controllers.Controller
   *
   * @param {Object} object The object to be manipulated
   * @param {string} property The name of the property to be manipulated
   * @param {Object|string[]} options A map of labels to acceptable values, or
   * a list of acceptable string values.
   *
   * @member dat.controllers
   */
  var OptionController = function(object, property, options, params) {

    OptionController.superclass.call(this, object, property, 'option', params);

    var _this = this;
    this.CUSTOM_FLAG = '';

    params = params || {};

    /**
     * The drop down menu
     * @ignore
     */
    this.__select = document.createElement('select');

    this.__input = document.createElement('input');
    this.__input.setAttribute('type', 'text');

    if (common.isArray(options)) {
      var map = {};
      common.each(options, function(element) {
        map[element] = element;
      });
      options = map;
    }

    common.each(options, function(value, key) {

      var opt = document.createElement('option');
      opt.innerHTML = key;
      opt.setAttribute('value', value);
      _this.__select.appendChild(opt);

    });

    if (params.custom) {
      var opt = document.createElement('option');
      opt.innerHTML = 'Custom';
      opt.setAttribute('value', _this.CUSTOM_FLAG);
      _this.__select.appendChild(opt);
    }

    // Acknowledge original value
    this.updateDisplay();

    dom.bind(this.__select, 'change', function() {
      var value = this.options[this.selectedIndex].value;
      _this.setValue(value);
    });

    dom.bind(this.__input, 'change', function() {
      var value = this.value;
      _this.setValue(value);
    });

    this.domElement.appendChild(this.__select);
    this.domElement.appendChild(this.__input);

  };

  OptionController.superclass = Controller;

  common.extend(

      OptionController.prototype,
      Controller.prototype,

      {

        setValue: function(v) {
          var toReturn = OptionController.superclass.prototype.setValue.call(this, v);
          if (this.__onFinishChange) {
            this.__onFinishChange.call(this, this.getValue());
          }
          return toReturn;
        },

        updateDisplay: function() {
          var value = this.getValue();
          var custom = true;
          if (value != this.CUSTOM_FLAG) {
            common.each(this.__select.options, function(option) {
              if (value == option.value) custom = false;
            });
          }

          this.__select.value = custom ? this.CUSTOM_FLAG : value;
          this.__input.value = custom ? value : '';
          this.__input.style.display = custom ? 'block' : 'none';
          return OptionController.superclass.prototype.updateDisplay.call(this);
        }

      }

  );

  return OptionController;

});