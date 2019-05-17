/**
 * dat.GUI JavaScript Controller Library
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

define(["dat/controllers/Controller", "dat/dom/dom", "dat/utils/common"], function(Controller, dom, common) {
  "use strict";

  /**
   * @class Provides a GUI interface to fire a specified method, a property of an object.
   *
   * @extends dat.controllers.Controller
   *
   * @param {Object} object The object to be manipulated
   * @param {string} property The name of the property to be manipulated
   * @param {string} text The text displayed in the button which will invoke the specified method.
   * @param {Array} user_data Optional set of user-specified datums to be passed to the specified method as its parameters (using JavaScript `.apply()`)
   *
   * @member dat.controllers
   */
  var FunctionController = function(object, property, text, user_data) {
    if (!common.isUndefined(user_data) && !common.isArray(user_data)) {
      user_data = [user_data];
    }

    FunctionController.superclass.call(this, object, property);

    var _this = this;

    this.__button = document.createElement("div");
    this.__button.innerHTML = text === undefined ? "Fire" : text;
    dom.bind(this.__button, "click", function(e) {
      e.preventDefault();
      e.stopPropagation();
      _this.fire(user_data);
      return false;
    });

    dom.addClass(this.__button, "button");

    this.domElement.appendChild(this.__button);
  };

  FunctionController.superclass = Controller;

  common.extend(FunctionController.prototype, Controller.prototype, {
    /**
     * Invoke the function (property of the object), passing the `user_data` array as function
     * arguments.
     *
     * Before the function is invoked, the dat.GUI `beforeChange` callback will be invoked
     *
     *
     * @param  {Array} user_data  The array of function arguments; when the `user_data` is not
     * an array, it will be assumed to be a single argument by itself and will be
     * passed to the invoked function as is.
     *
     * @param  {boolean} silent   When truthy, no onBeforeChange/onChange events will be fired.
     *
     * @return {Controller}           This controller.
     */
    fire: function(user_data, silent) {
      if (!common.isUndefined(user_data) && !common.isArray(user_data)) {
        user_data = [user_data];
      }

      var msg = {
        userData: user_data,
        //isChange: undefined,
        silent: silent,
        noGo: false,
        //eventData: undefined,
        eventSource: "fire"
      };
      if (!silent) {
        // `userData` will end up in the second argument of the event listener, thus
        // userland code can look at both existing and new values for this property
        // and decide what to do accordingly!
        msg.noGo = this.fireBeforeChange(msg);
      }
      if (!msg.noGo) {
        this.getValue().apply(this.object, user_data);
      }
      // Always fire the change event; inform the userland code whether the change was 'real'
      // or aborted:
      if (!silent) {
        this.fireChange(msg);
        this.fireFinishChange(msg);
      }
      // Whenever you call `fire`, the display will be updated automatically.
      // This reduces some clutter in subclasses.
      this.updateDisplay();
      return this;
    }
  });

  return FunctionController;
});
