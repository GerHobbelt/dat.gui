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

import Controller from "./Controller";
import dom from "../dom/dom";
import common from "../utils/common";

class GradientController extends Controller {
  constructor(object, property, params) {
    super(object, property);

    const _this = this;

    this.domElement = document.createElement("div");

    dom.makeSelectable(this.domElement, false);

    this.__selector = document.createElement("div");
    this.__selector.className = "selector";

    this.__saturation_field = document.createElement("div");
    this.__saturation_field.className = "saturation-field";

    this.__input = document.createElement("input");
    this.__input.type = "text";
    this.__input_textShadow = "1px 1px 2px";

    dom.bind(this.__input, "keydown", function(e) {
      if (e.keyCode === 13) {
        // on enter
        onBlur.call(this);
      }
    });

    dom.bind(this.__input, "blur", onBlur);

    function onBlur() {
      const value = JSON.parse(this.value);
      _this.setValue(value);
    }

    dom.bind(this.__selector, "mousedown", function(/* e */) {
      dom.addClass(this, "drag").bind(window, "mouseup", function(/* e */) {
        dom.removeClass(_this.__selector, "drag");
      });
    });

    const valueField = document.createElement("div");

    common.extend(this.__selector.style, {
      width: "150px",
      padding: "0px",
      lineHeight: "18px",
      backgroundColor: "#222",
      boxShadow: "0px 1px 3px rgba(0,0,0,0.3)"
    });

    for (let i = 0; i < params.length; i++) {
      const item = document.createElement("canvas");
      item.value = params[i];
      item.width = 150;
      item.height = 18;
      const context = item.getContext("2d");

      const grd = context.createLinearGradient(0, 0, 150, 0);
      for (const key in params[i]) {
        grd.addColorStop(key, params[i][key]);
      }

      dom.bind(item, "click", function() {
        _this.setValue(this.value);
        _this.updateDisplay();
        onFinish();
      });

      context.fillStyle = grd;
      context.fillRect(0, 0, item.width, item.height);
      common.extend(item.style, {
        width: "150px"
      });
      this.__saturation_field.appendChild(item);
    }

    this.__selector.appendChild(this.__saturation_field);

    this.domElement.appendChild(this.__input);
    this.domElement.appendChild(this.__selector);

    function onFinish() {
      if (_this.__onFinishChange) {
        _this.__onFinishChange.call(_this, _this.getValue());
      }
    }

    this.updateDisplay();
  }

  updateDisplay() {
    const value = this.getValue();
    const arr = [];
    for (const key in value) {
      arr.push({
        percent: key,
        color: value[key]
      });
    }
    arr.sort(function(a, b) {
      return a.percent - b.percent;
    });

    this.__input.value = JSON.stringify(value);
    let backgroundColor = "-webkit-linear-gradient(left";
    for (let i = 0; i < arr.length; i++) {
      backgroundColor += ", " + arr[i].color + " " + arr[i].percent * 100 + "%";
    }
    backgroundColor += ")";
    common.extend(this.__input.style, {
      background: backgroundColor,
      color: "#fff",
      // maximum contrast shadow below and around the text, so it will work like
      // and 'outline' for the text and keep it readable on top of all gradient
      // backgrounds / colors:
      textShadow: this.__input_textShadow + " #000"
    });
  }
}

export default GradientController;
