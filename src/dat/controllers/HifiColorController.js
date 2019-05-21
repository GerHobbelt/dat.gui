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
import Color from "../color/Color";
import interpret from "../color/interpret";
import common from "../utils/common";

/**
 * @class Represents a given property of an object that is a color.
 * @param {Object} object
 * @param {string} property
 */
class HifiColorController extends Controller {
  constructor(object, property) {
    super(object, property);

    this.__color = new Color(this.getValue());
    this.__temp = new Color(0);

    const _this = this;

    this.domElement = settings.DOCUMENT.createElement("div");

    dom.makeSelectable(this.domElement, false);

    this.__selector = settings.DOCUMENT.createElement("div");
    this.__selector.className = "selector";

    this.__saturation_field = settings.DOCUMENT.createElement("div");
    this.__saturation_field.className = "saturation-field";

    this.__field_knob = settings.DOCUMENT.createElement("div");
    this.__field_knob.className = "field-knob";
    this.__field_knob_border = "2px solid ";

    this.__hue_knob = settings.DOCUMENT.createElement("div");
    this.__hue_knob.className = "hue-knob";

    this.__hue_field = settings.DOCUMENT.createElement("div");
    this.__hue_field.className = "hue-field";

    this.__input = settings.DOCUMENT.createElement("input");
    this.__input.type = "text";
    this.__input_textShadow = "0 1px 1px ";

    dom.bind(this.__input, "keydown", function(e) {
      if (e.keyCode === 13) {
        // on enter
        onBlur.call(this);
      }
    });

    dom.bind(this.__input, "blur", onBlur);

    dom.bind(this.__selector, "mousedown", function(e) {
      dom.addClass(this, "drag").bind(settings.WINDOW, "mouseup", function(evt) {
        dom.removeClass(_this.__selector, "drag");
      });
    });

    const valueField = settings.DOCUMENT.createElement("div");

    common.extend(this.__selector.style, {
      width: "122px",
      height: "102px",
      padding: "3px",
      backgroundColor: "#222",
      boxShadow: "0px 1px 3px rgba(0,0,0,0.3)"
    });

    common.extend(this.__field_knob.style, {
      position: "absolute",
      width: "12px",
      height: "12px",
      border: this.__field_knob_border + (this.__color.v < 0.5 ? "#fff" : "#000"),
      boxShadow: "0px 1px 3px rgba(0,0,0,0.5)",
      borderRadius: "12px",
      zIndex: 1
    });

    common.extend(this.__hue_knob.style, {
      position: "absolute",
      width: "15px",
      height: "2px",
      borderRight: "4px solid #fff",
      zIndex: 1
    });

    common.extend(this.__saturation_field.style, {
      width: "100px",
      height: "100px",
      border: "1px solid #555",
      marginRight: "3px",
      display: "inline-block",
      cursor: "pointer"
    });

    common.extend(valueField.style, {
      width: "100%",
      height: "100%",
      background: "none"
    });

    linearGradient(valueField, "top", "rgba(0,0,0,0)", "#000");

    common.extend(this.__hue_field.style, {
      width: "15px",
      height: "100px",
      display: "inline-block",
      border: "1px solid #555",
      cursor: "ns-resize"
    });

    hueGradient(this.__hue_field);

    common.extend(this.__input.style, {
      outline: "none",
      //      width: '120px',
      textAlign: "center",
      //      padding: '4px',
      //      marginBottom: '6px',
      color: "#fff",
      border: 0,
      fontWeight: "bold",
      textShadow: this.__input_textShadow + "rgba(0,0,0,0.7)"
    });

    dom.bind(this.__saturation_field, "mousedown", fieldDown);
    dom.bind(this.__field_knob, "mousedown", fieldDown);

    dom.bind(this.__hue_field, "mousedown", function(e) {
      setH(e);
      dom.bind(settings.WINDOW, "mousemove", setH);
      dom.bind(settings.WINDOW, "mouseup", unbindH);
    });

    function fieldDown(e) {
      setSV(e);
      // settings.DOCUMENT.body.style.cursor = 'none';
      dom.bind(settings.WINDOW, "mousemove", setSV);
      dom.bind(settings.WINDOW, "mouseup", unbindSV);
    }

    function unbindSV() {
      dom.unbind(settings.WINDOW, "mousemove", setSV);
      dom.unbind(settings.WINDOW, "mouseup", unbindSV);
      // settings.DOCUMENT.body.style.cursor = 'default';
    }

    function onBlur() {
      const i = interpret(this.value);
      if (i !== false) {
        _this.__color.__state = i;
        _this.setValue(_this.__color.toOriginal());
      } else {
        this.value = _this.__color.toString();
      }
    }

    function unbindH() {
      dom.unbind(settings.WINDOW, "mousemove", setH);
      dom.unbind(settings.WINDOW, "mouseup", unbindH);
    }

    this.__saturation_field.appendChild(valueField);
    this.__selector.appendChild(this.__field_knob);
    this.__selector.appendChild(this.__saturation_field);
    this.__selector.appendChild(this.__hue_field);
    this.__hue_field.appendChild(this.__hue_knob);

    this.domElement.appendChild(this.__input);
    this.domElement.appendChild(this.__selector);

    this.updateDisplay();

    function setSV(e) {
      e.preventDefault();

      const w = dom.getWidth(_this.__saturation_field);
      const o = dom.getOffset(_this.__saturation_field);
      let s = (e.clientX - o.left + settings.DOCUMENT.body.scrollLeft) / w;
      let v = 1 - (e.clientY - o.top + settings.DOCUMENT.body.scrollTop) / w;

      if (v > 1) v = 1;
      else if (v < 0) v = 0;

      if (s > 1) s = 1;
      else if (s < 0) s = 0;

      _this.__color.v = v;
      _this.__color.s = s;

      _this.setValue(_this.__color.toOriginal());

      return false;
    }

    function setH(e) {
      e.preventDefault();

      const s = dom.getHeight(_this.__hue_field);
      const o = dom.getOffset(_this.__hue_field);
      let h = 1 - (e.clientY - o.top + settings.DOCUMENT.body.scrollTop) / s;

      if (h > 1) h = 1;
      else if (h < 0) h = 0;

      _this.__color.h = h * 360;

      _this.setValue(_this.__color.toOriginal());

      return false;
    }
  }

  updateDisplay() {
    const i = interpret(this.getValue());

    if (i !== false) {
      let mismatch = false;

      // Check for mismatch on the interpreted value.

      common.each(
        Color.COMPONENTS,
        function(component) {
          if (
            !common.isUndefined(i[component]) &&
            !common.isUndefined(this.__color.__state[component]) &&
            i[component] !== this.__color.__state[component]
          ) {
            mismatch = true;
            return {}; // break
          }
        },
        this
      );

      // If nothing diverges, we keep our previous values
      // for statefulness, otherwise we recalculate fresh
      if (mismatch) {
        common.extend(this.__color.__state, i);
      }
    }

    common.extend(this.__temp.__state, this.__color.__state);

    this.__temp.a = 1;

    const flip = this.__color.v < 0.5 || this.__color.s > 0.5 ? 255 : 0;
    const _flip = 255 - flip;

    common.extend(this.__field_knob.style, {
      marginLeft: 100 * this.__color.s - 7 + "px",
      marginTop: 100 * (1 - this.__color.v) - 7 + "px",
      backgroundColor: this.__temp.toString(),
      border: this.__field_knob_border + "rgb(" + flip + "," + flip + "," + flip + ")"
    });

    this.__hue_knob.style.marginTop = (1 - this.__color.h / 360) * 100 + "px";

    this.__temp.s = 1;
    this.__temp.v = 1;

    linearGradient(this.__saturation_field, "left", "#fff", this.__temp.toString());

    common.extend(this.__input.style, {
      backgroundColor: (this.__input.value = this.__color.toString()),
      color: "rgb(" + flip + "," + flip + "," + flip + ")",
      textShadow: this.__input_textShadow + "rgba(" + _flip + "," + _flip + "," + _flip + ",.7)"
    });
  }
}

const vendors = ["-moz-", "-o-", "-webkit-", "-ms-", ""];

function linearGradient(elem, x, a, b) {
  elem.style.background = "";
  common.each(vendors, function(vendor) {
    elem.style.cssText += "background: " + vendor + "linear-gradient(" + x + ", " + a + " 0%, " + b + " 100%); ";
  });
}

function hueGradient(elem) {
  elem.style.background = "";
  elem.style.cssText +=
    "background: -moz-linear-gradient(top,  #ff0000 0%, #ff00ff 17%, #0000ff 34%, #00ffff 50%, #00ff00 67%, #ffff00 84%, #ff0000 100%);";
  elem.style.cssText +=
    "background: -webkit-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);";
  elem.style.cssText +=
    "background: -o-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);";
  elem.style.cssText +=
    "background: -ms-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);";
  elem.style.cssText +=
    "background: linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);";
}

export default HifiColorController;
