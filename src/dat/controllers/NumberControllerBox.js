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
  var NumberControllerBox = function(object, property, params) {
    this.__truncationSuspended = false;

    NumberControllerBox.superclass.call(this, object, property, params);

    const _this = this;

    /**
     * {Number} Previous mouse y position
     * @ignore
     */
    let prev_y;

    this.__input = document.createElement("input");
    this.__input.setAttribute("type", "text");

    // Makes it so manually specified values are not truncated.

    dom.bind(this.__input, "change", onChange);
    dom.bind(this.__input, "blur", onBlur);
    dom.bind(this.__input, "touchdown", onTouchDown);
    dom.bind(this.__input, "mousedown", onMouseDown);
    dom.bind(this.__input, "keydown", onKeyDown);

    function onKeyDown(e) {
      // When pressing ENTER key, you can be as precise as you want.
      if (e.keyCode === 13) {
        _this.__truncationSuspended = true;
        /* jshint validthis: true */
        this.blur();
        /* jshint validthis: false */
        _this.__truncationSuspended = false;
      }
    }

    function onChange(e) {
      const attempted = parseFloat(_this.__input.value);
      if (!common.isNaN(attempted)) {
        _this.setValue(attempted);
      }
    }

    function onBlur(e) {
      onChange(e);
      _this.fireFinishChange({
        eventData: e,
        eventSource: "onBlur"
      });
    }

    function onTouchDown(e) {
      dom.bind(window, "touchmove", onTouchDrag);
      dom.bind(window, "touchend", onTouchUp);

      e.preventDefault();
      prev_y = e.touches[0].clientY;
    }

    function onTouchDrag(e) {
      const diff = prev_y - e.touches[0].clientY;
      _this.setValue(_this.getValue() + diff * _this.__impliedStep);

      prev_y = e.touches[0].clientY;
      e.preventDefault();
    }

    function onTouchUp(e) {
      dom.unbind(window, "touchmove", onTouchDrag);
      dom.unbind(window, "touchend", onTouchUp);

      e.preventDefault();

      _this.fireFinishChange({
        eventData: e,
        eventSource: "onTouchUp"
      });
    }

    function onMouseDown(e) {
      dom.bind(window, "mousemove", onMouseDrag);
      dom.bind(window, "mouseup", onMouseUp);

      e.preventDefault();
      prev_y = e.clientY;
    }

    function onMouseDrag(e) {
      const diff = prev_y - e.clientY;
      _this.setValue(_this.getValue() + diff * _this.__impliedStep);

      prev_y = e.clientY;
      e.preventDefault();
    }

    function onMouseUp(e) {
      dom.unbind(window, "mousemove", onMouseDrag);
      dom.unbind(window, "mouseup", onMouseUp);

      e.preventDefault();

      _this.fireFinishChange({
        eventData: e,
        eventSource: "onMouseUp"
      });
    }

    this.updateDisplay();

    this.domElement.appendChild(this.__input);
  };

  NumberControllerBox.superclass = NumberController;

  common.extend(NumberControllerBox.prototype, NumberController.prototype, {
    updateDisplay: function() {
      this.__input.value = this.__truncationSuspended
        ? this.getValue()
        : roundToDecimal(this.getValue(), this.__precision);
      return NumberControllerBox.superclass.prototype.updateDisplay.call(this);
    }
  });

  function roundToDecimal(value, decimals) {
    const tenTo = Math.pow(10, decimals);
    return Math.round(value * tenTo) / tenTo;
  }

  return NumberControllerBox;
});
