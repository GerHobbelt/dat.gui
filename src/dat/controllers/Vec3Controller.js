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

define(["dat/controllers/NumberController", "dat/dom/dom", "dat/utils/common"], function(
  NumberController,
  dom,
  common
) {
  /**
   * @class Represents a given property of an object that is a number and
   * provides an input element with which to manipulate it.
   *
   * @extends dat.controllers.Controller
   * @extends dat.controllers.NumberController
   *
   * @param {Object} object The object to be manipulated
   * @param {string} property The name of the property to be manipulated
   * @param {Object} [params] Optional parameters
   * @param {Number} [params.min] Minimum allowed value
   * @param {Number} [params.max] Maximum allowed value
   * @param {Number} [params.step] Increment by which to change value
   *
   * @member dat.controllers
   */
  var Vec3Controller = function(object, property, params) {
    this.__truncationSuspended = false;

    Vec3Controller.superclass.call(this, object, property, params);

    var _this = this;

    /**
     * {Number} Previous mouse y position
     * @ignore
     */
    var prev_y;

    var vec3 = {
      x: 0,
      y: 0,
      z: 0
    };

    this.xInput = document.createElement("input");
    this.xInput.setAttribute("type", "number");

    this.yInput = document.createElement("input");
    this.yInput.setAttribute("type", "number");

    this.zInput = document.createElement("input");
    this.zInput.setAttribute("type", "number");

    // Makes it so manually specified values are not truncated.

    dom.bind(this.xInput, "change", onChange(xInput));
    dom.bind(this.xInput, "blur", onBlur(xInput));
    dom.bind(this.xInput, "mousedown", onMouseDown);
    dom.bind(this.xInput, "keydown", function(e) {
      // When pressing entire, you can be as precise as you want.
      if (e.keyCode === 13) {
        _this.__truncationSuspended = true;
        this.blur();
        _this.__truncationSuspended = false;
      }
    });

    dom.bind(this.yInput, "change", onChange(yInput));
    dom.bind(this.yInput, "blur", onBlur(yInput));
    dom.bind(this.yInput, "mousedown", onMouseDown);
    dom.bind(this.yInput, "keydown", function(e) {
      // When pressing entire, you can be as precise as you want.
      if (e.keyCode === 13) {
        _this.__truncationSuspended = true;
        this.blur();
        _this.__truncationSuspended = false;
      }
    });

    dom.bind(this.zInput, "change", onChange(zInput));
    dom.bind(this.zInput, "blur", onBlur(zInput));
    dom.bind(this.zInput, "mousedown", onMouseDown);
    dom.bind(this.zInput, "keydown", function(e) {
      // When pressing entire, you can be as precise as you want.
      if (e.keyCode === 13) {
        _this.__truncationSuspended = true;
        this.blur();
        _this.__truncationSuspended = false;
      }
    });

    function onChange(whichInput) {
      var attempted = parseFloat(_this[whichInput].value);
      if (!common.isNaN(attempted)) _this.setValue(attempted);
    }

    function onBlur(whichInput) {
      onChange(whichInput);
      if (_this.__onFinishChange) {
        _this.__onFinishChange.call(_this, _this.getValue());
      }
    }

    function onMouseDown(e) {
      dom.bind(window, "mousemove", onMouseDrag);
      dom.bind(window, "mouseup", onMouseUp);
      prev_y = e.clientY;
    }

    function onMouseDrag(e) {
      var diff = prev_y - e.clientY;
      _this.setValue(_this.getValue() + diff * _this.__impliedStep);

      prev_y = e.clientY;
    }

    function onMouseUp() {
      dom.unbind(window, "mousemove", onMouseDrag);
      dom.unbind(window, "mouseup", onMouseUp);
    }

    this.updateDisplay(this.xInput);
    this.updateDisplay(this.yInput);
    this.updateDisplay(this.zInput);

    this.domElement.appendChild(this.xInput);
    this.domElement.appendChild(this.yInput);
    this.domElement.appendChild(this.zInput);
  };

  Vec3Controller.superclass = NumberController;

  common.extend(
    Vec3Controller.prototype,
    NumberController.prototype,

    {
      updateDisplay: function(whichInput) {
        this[whichInput].value = this.__truncationSuspended
          ? this.getValue()
          : roundToDecimal(this.getValue(), this.__precision);
        return Vec3Controller.superclass.prototype.updateDisplay.call(this);
      }
    }
  );

  function roundToDecimal(value, decimals) {
    var tenTo = Math.pow(10, decimals);
    return Math.round(value * tenTo) / tenTo;
  }

  return Vec3Controller;
});
