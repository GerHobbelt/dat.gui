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

define(["dat/controllers/Controller", "dat/dom/dom", "dat/utils/common"], function(Controller, dom, common) {
  /**
   * @class Provides a controller to represent an UNDEFINED-valued property of an object.
   * @extends dat.controllers.Controller
   *
   * @param {Object} object The object to be manipulated
   * @param {string} property The name of the property to be manipulated
   *
   * @member dat.controllers
   */
  var UndefinedController = function(object, property, options) {
    UndefinedController.superclass.call(this, object, property, "undefined", options);

    const _this = this;
    this.__prev = this.getValue();

    this.__elem = document.createElement("em");
    this.domElement.appendChild(this.__elem);

    // Match original value
    this.updateDisplay();
  };

  UndefinedController.superclass = Controller;

  common.extend(UndefinedController.prototype, Controller.prototype, {
    updateDisplay: function() {
      this.__elem.innerText = "<undefined>";
      return UndefinedController.superclass.prototype.updateDisplay.call(this);
    }
  });

  return UndefinedController;
});
