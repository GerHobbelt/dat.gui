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

import Controller from "./Controller";
import dom from "../dom/dom";
import Color from "../color/Color";
import interpret from "../color/interpret";
import common from "../utils/common";

/**
 * @class Represents a given property of an object that is a color.
 *
 * @extends Controller
 *
 * @param {Object} object
 * @param {string} property
 */
class ColorController extends Controller {
  constructor(object, property, options) {
    super(object, property, "color", options);

    this.__color = new Color(this.getValue());
    this.__temp = new Color(0);

    const _this = this;

    // this.domElement = document.createElement('div');

    dom.makeSelectable(this.domElement, false);

    this.__selector = document.createElement("div");
    this.__selector.className = "selector";

    this.__saturation_field = document.createElement("div");
    this.__saturation_field.className = "saturation-field";

    this.__field_knob = document.createElement("div");
    this.__field_knob.className = "field-knob";
    this.__field_knob_border = "2px solid ";

    this.__hue_knob = document.createElement("div");
    this.__hue_knob.className = "hue-knob";

    this.__hue_field = document.createElement("div");
    this.__hue_field.className = "hue-field";

    this.__alpha_knob = document.createElement("div");
    this.__alpha_knob.className = "alpha-knob";

    this.__alpha_field = document.createElement("div");
    this.__alpha_field.className = "alpha-field";

    this.__input = document.createElement("input");
    this.__input.type = "text";
    this.__input_textShadow = ["1px 0px 0px ", "-1px 0px 0px ", "0px 1px 0px ", "0px -1px 0px "];

    /* jshint unused: false */

    dom.bind(this.__input, "keydown", function (e) {
      if (e.keyCode === 13) {
        // on enter
        onBlur.call(this);
      }
    });

    dom.bind(this.__input, "blur", onBlur);

    dom.bind(this.__selector, "mousedown", function (e) {
      dom.addClass(this, "drag").bind(window, "mouseup", function (e) {
        dom.removeClass(_this.__selector, "drag");
      });
    });

    dom.bind(this.__selector, "touchstart", function (e) {
      dom.addClass(this, "drag").bind(window, "touchend", function (e) {
        dom.removeClass(_this.__selector, "drag");
      });
    });

    /* jshint unused: true */

    const value_field = document.createElement("div");

    common.extend(this.__selector.style, {
      width: "140px",
      height: "102px",
      padding: "3px",
      backgroundColor: "#222",
      boxShadow: "0px 1px 3px rgba(0,0,0,0.3)",
    });

    common.extend(this.__field_knob.style, {
      position: "absolute",
      width: "12px",
      height: "12px",
      border: this.__field_knob_border + (this.__color.v < 0.5 ? "#fff" : "#000"),
      boxShadow: "0px 1px 3px rgba(0,0,0,0.5)",
      borderRadius: "12px",
      zIndex: 1,
    });

    common.extend(this.__hue_knob.style, {
      position: "absolute",
      width: "15px",
      height: "2px",
      borderRight: "4px solid #fff",
      zIndex: 1,
    });

    common.extend(this.__saturation_field.style, {
      width: "100px",
      height: "100px",
      border: "1px solid #555",
      marginRight: "3px",
      display: "inline-block",
      cursor: "pointer",
    });

    common.extend(value_field.style, {
      width: "100%",
      height: "100%",
      background: "none",
    });

    linearGradient(value_field, "top", "rgba(0,0,0,0)", "#000");

    common.extend(this.__hue_field.style, {
      width: "15px",
      height: "100px",
      display: "inline-block",
      border: "1px solid #555",
      cursor: "ns-resize",
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
      textShadow: this.__input_textShadow
        .map(function (d) {
          return d + " rgba(0,0,0,0.7)";
        })
        .join(", "),
    });

    common.extend(this.__alpha_field.style, {
      width: "15px",
      height: "100px",
      marginLeft: "3px",
      display: "inline-block",
      border: "1px solid #555",
      cursor: "ns-resize",
    });

    alphaGradient(this.__alpha_field, _this.__color);

    common.extend(this.__alpha_knob.style, {
      position: "absolute",
      width: "15px",
      height: "2px",
      borderRight: "4px solid #fff",
      zIndex: 1,
    });

    dom.bind(this.__saturation_field, "mousedown", fieldDown);
    dom.bind(this.__field_knob, "mousedown", fieldDown);
    dom.bind(this.__saturation_field, "touchstart", fieldDownOnTouch);
    dom.bind(this.__field_knob, "touchstart", fieldDownOnTouch);
    dom.bind(this.__alpha_field, "mousedown", function (e) {
      setA(e);
      dom.bind(window, "mousemove", setA);
      dom.bind(window, "mouseup", unbindA);
      dom.bind(window, "touchmove", setAonTouch);
      dom.bind(window, "touchend", unbindA);
    });
    dom.bind(this.__alpha_field, "touchstart", function (e) {
      setAonTouch(e);
      dom.bind(window, "mousemove", setA);
      dom.bind(window, "mouseup", unbindA);
      dom.bind(window, "touchmove", setAonTouch);
      dom.bind(window, "touchend", unbindA);
    });

    // TODO: make setValue always call alphaGradient like the two functions do below:
    /*
    var setHValues = function (e) {
      setH(e);
      alphaGradient(_this.__alpha_field, _this.__color);
    };

    var setSVValues = function (e) {
      setSV(e);
      alphaGradient(_this.__alpha_field, _this.__color);
    };
    */

    dom.bind(this.__hue_field, "mousedown", function (e) {
      setH(e);
      dom.bind(window, "mousemove", setH);
      dom.bind(window, "mouseup", unbindH);
    });

    dom.bind(this.__hue_field, "touchstart", function (e) {
      setHonTouch(e);
      dom.bind(window, "touchmove", setHonTouch);
      dom.bind(window, "touchend", unbindH);
    });

    function fieldDown(e) {
      setSV(e);
      // document.body.style.cursor = 'none';
      dom.bind(window, "mousemove", setSV);
      dom.bind(window, "mouseup", unbindSV);
      dom.bind(window, "touchmove", setSVonTouch);
      dom.bind(window, "touchend", unbindSV);
    }

    function fieldDownOnTouch(e) {
      e.clientX = e.touches[0].clientX;
      e.clientY = e.touches[0].clientY;
      fieldDown(e);
    }

    function unbindSV() {
      dom.unbind(window, "mousemove", setSV);
      dom.unbind(window, "mouseup", unbindSV);
      dom.unbind(window, "touchmove", setSVonTouch);
      dom.unbind(window, "touchend", unbindSV);
      // document.body.style.cursor = 'default';
    }

    function onBlur() {
      /* jshint validthis: true */
      const i = interpret(this.value);
      if (i !== false) {
        _this.__color.__state = i;
        _this.setValue(_this.__color.toOriginal());
      } else {
        this.value = _this.__color.toString();
      }
      /* jshint validthis: false */
    }

    function unbindH() {
      dom.unbind(window, "mousemove", setH);
      dom.unbind(window, "mouseup", unbindH);
      dom.unbind(window, "touchmove", setHonTouch);
      dom.unbind(window, "touchend", unbindH);
    }

    function unbindA() {
      dom.unbind(window, "mousemove", setA);
      dom.unbind(window, "mouseup", unbindA);
      dom.unbind(window, "touchmove", setAonTouch);
      dom.unbind(window, "touchend", unbindA);
    }

    this.__saturation_field.appendChild(value_field);
    this.__selector.appendChild(this.__field_knob);
    this.__selector.appendChild(this.__saturation_field);
    this.__selector.appendChild(this.__hue_field);
    this.__selector.appendChild(this.__alpha_field);
    this.__hue_field.appendChild(this.__hue_knob);
    this.__alpha_field.appendChild(this.__alpha_knob);
    this.domElement.appendChild(this.__input);
    this.domElement.appendChild(this.__selector);

    this.updateDisplay();

    function setSV(e) {
      e.preventDefault();

      const w = dom.getWidth(_this.__saturation_field);
      const h = dom.getHeight(_this.__saturation_field);
      const o = dom.getOffset(_this.__saturation_field);
      const scroll = getScroll(_this.__saturation_field);
      let s = (e.clientX - o.left + scroll.left) / w;
      let v = 1 - (e.clientY - o.top + scroll.top) / h;

      if (v > 1) {
        v = 1;
      } else if (v < 0) {
        v = 0;
      }

      if (s > 1) {
        s = 1;
      } else if (s < 0) {
        s = 0;
      }

      _this.__color.v = v;
      _this.__color.s = s;

      _this.setValue(_this.__color.toOriginal());

      return false;
    }

    function setH(e) {
      e.preventDefault();

      const s = dom.getHeight(_this.__hue_field);
      const o = dom.getOffset(_this.__hue_field);
      const scroll = getScroll(_this.__hue_field);
      let h = 1 - (e.clientY - o.top + scroll.top) / s;

      if (h > 1) {
        h = 1;
      } else if (h < 0) {
        h = 0;
      }

      _this.__color.h = h * 360;

      _this.setValue(_this.__color.toOriginal());

      return false;
    }

    function setA(e) {
      e.preventDefault();

      const s = dom.getHeight(_this.__alpha_field);
      const o = dom.getOffset(_this.__alpha_field);
      const scroll = getScroll(_this.__alpha_field);
      let a = 1 - (e.clientY - o.top + scroll.top) / s;

      if (a > 1) {
        a = 1;
      } else if (a < 0) {
        a = 0;
      }

      _this.__color.a = a.toFixed(2);

      _this.setValue(_this.__color.toOriginal());

      return false;
    }

    function setAonTouch(e) {
      e.clientY = e.touches[0].clientY;
      return setA(e);
    }

    function setSVonTouch(e) {
      e.clientX = e.touches[0].clientX;
      e.clientY = e.touches[0].clientY;
      return setSV(e);
    }

    function setHonTouch(e) {
      e.clientY = e.touches[0].clientY;
      return setH(e);
    }

    function getScroll(el) {
      const scroll = {
        top: el.scrollTop || 0,
        left: el.scrollLeft || 0,
      };
      el = el.parentNode;
      while (el) {
        scroll.top += el.scrollTop || 0;
        scroll.left += el.scrollLeft || 0;
        const cs = getComputedStyle(el, null);
        if (cs.position === "fixed") {
          break;
        }
        el = el.parentNode;
      }
      return scroll;
    }
  }

  updateDisplay() {
    const i = interpret(this.getValue());

    if (i !== false) {
      let mismatch = false;

      // Check for mismatch on the interpreted value.

      common.each(
        Color.COMPONENTS,
        function (component) {
          if (
            !common.isUndefined(i[component]) &&
            !common.isUndefined(this.__color.__state[component]) &&
            i[component] !== this.__color.__state[component]
          ) {
            mismatch = true;
            return common.BREAK; // break
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
      border: this.__field_knob_border + "rgb(" + flip + "," + flip + "," + flip + ")",
    });

    this.__alpha_knob.style.marginTop = (1 - this.__color.a) * 100 + "px";
    this.__hue_knob.style.marginTop = (1 - this.__color.h / 360) * 100 + "px";

    this.__temp.s = 1;
    this.__temp.v = 1;

    linearGradient(this.__saturation_field, "left", "#fff", this.__temp.toString());

    this.__input.value = this.__color.toString();

    common.extend(this.__input.style, {
      backgroundColor: this.__color.toString(),
      color: "rgb(" + flip + "," + flip + "," + flip + ")",
      textShadow: this.__input_textShadow
        .map(function (d) {
          return d + " rgba(" + _flip + "," + _flip + "," + _flip + ",0.7)";
        })
        .join(", "),
    });

    this.__input.disabled = this.getReadonly();
  }
}

const vendors = ["-moz-", "-o-", "-webkit-", "-ms-", ""];

function linearGradient(elem, x, a, b) {
  elem.style.background = "";
  common.each(vendors, function (vendor) {
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

function alphaGradient(elem, color) {
  elem.style.background = "";

  const { rgb } = color;
  const r = Math.floor(color.r);
  const g = Math.floor(color.g);
  const b = Math.floor(color.b);
  const rgbaStart = "rgba(" + r + "," + g + "," + b + ",1)";
  const rgbaEnd = "rgba(" + r + "," + g + "," + b + ",0)";

  common.each(vendors, function (vendor) {
    elem.style.cssText += "background: " + vendor + "linear-gradient(top, " + rgbaStart + " , " + rgbaEnd + "); ";
  });
}

export default ColorController;
