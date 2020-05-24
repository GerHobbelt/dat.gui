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

import SuperGif from "wsgif";

function colorToString(color, forceCSSHex) {
  var colorFormat = color.__state.conversionName.toString();
  var r = Math.round(color.r);
  var g = Math.round(color.g);
  var b = Math.round(color.b);
  var a = color.a >= 1 || color.a == null ? 1 : color.a;
  var h = Math.round(color.h);
  var s = color.s.toFixed(1);
  var v = color.v.toFixed(1);
  if (forceCSSHex || colorFormat === "THREE_CHAR_HEX" || colorFormat === "SIX_CHAR_HEX") {
    var str = color.hex.toString(16);
    while (str.length < 6) {
      str = "0" + str;
    }
    return "#" + str;
  }
  if (colorFormat === "CSS_RGB") {
    return "rgb(" + r + "," + g + "," + b + ")";
  }
  if (colorFormat === "CSS_RGBA") {
    return "rgba(" + r + "," + g + "," + b + "," + a + ")";
  }
  if (colorFormat === "HEX") {
    return "0x" + color.hex.toString(16);
  }
  if (colorFormat === "RGB_ARRAY") {
    return "[" + r + "," + g + "," + b + "]";
  }
  if (colorFormat === "RGBA_ARRAY") {
    return "[" + r + "," + g + "," + b + "," + a + "]";
  }
  if (colorFormat === "RGB_OBJ") {
    return "{r:" + r + ",g:" + g + ",b:" + b + "}";
  }
  if (colorFormat === "RGBA_OBJ") {
    return "{r:" + r + ",g:" + g + ",b:" + b + ",a:" + a + "}";
  }
  if (colorFormat === "HSV_OBJ") {
    return "{h:" + h + ",s:" + s + ",v:" + v + "}";
  }
  if (colorFormat === "HSVA_OBJ") {
    return "{h:" + h + ",s:" + s + ",v:" + v + ",a:" + a + "}";
  }
  return "unknown format";
}

var ARR_SLICE = Array.prototype.slice;
var Common = {
  BREAK: {},
  extend: function extend(target) {
    this.each(
      ARR_SLICE.call(arguments, 1),
      function (obj) {
        for (var key in obj) {
          if (!this.isUndefined(obj[key])) {
            target[key] = obj[key];
          }
        }
      },
      this
    );
    return target;
  },
  defaults: function defaults(target) {
    this.each(
      ARR_SLICE.call(arguments, 1),
      function (obj) {
        for (var key in obj) {
          if (this.isUndefined(target[key])) {
            target[key] = obj[key];
          }
        }
      },
      this
    );
    return target;
  },
  compose: function compose() {
    var toCall = ARR_SLICE.call(arguments);
    return function () {
      var args = ARR_SLICE.call(arguments);
      for (var i = toCall.length - 1; i >= 0; i--) {
        args = [toCall[i].apply(this, args)];
      }
      return args[0];
    };
  },
  each: function each(obj, itr, scope) {
    if (!obj) {
      return;
    }
    if (obj.forEach) {
      obj.forEach(itr, scope);
    } else if (obj.length === obj.length + 0) {
      for (var key = 0, l = obj.length; key < l; key++) {
        if (key in obj && itr.call(scope, obj[key], key) === this.BREAK) {
          return;
        }
      }
    } else {
      for (var objkey in obj) {
        if (itr.call(scope, obj[objkey], objkey) === this.BREAK) {
          return;
        }
      }
    }
  },
  defer: function defer(fnc) {
    setTimeout(fnc, 0);
  },
  debounce: function debounce(func, threshold, callImmediately) {
    var timeout;
    return function () {
      var obj = this;
      var args = arguments;
      function delayed() {
        timeout = null;
        if (!callImmediately) func.apply(obj, args);
      }
      var callNow = callImmediately || !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(delayed, threshold);
      if (callNow) {
        func.apply(obj, args);
      }
    };
  },
  toArray: function toArray(obj) {
    if (obj.toArray) {
      return obj.toArray();
    }
    return ARR_SLICE.call(obj);
  },
  isUndefined: function isUndefined(obj) {
    return obj === undefined;
  },
  isNull: function isNull(obj) {
    return obj === null;
  },
  isNaN: function isNaN(obj) {
    return Number.isNaN(obj);
  },
  isArray: function isArray(obj) {
    return obj != null && obj.length >= 0 && typeof obj === "object";
  },
  isObject: function isObject(obj) {
    return obj === Object(obj);
  },
  isNumber: function isNumber(obj) {
    return obj === obj + 0;
  },
  isFiniteNumber: function isFiniteNumber(obj) {
    return obj === +obj && isFinite(obj);
  },
  isString: function isString(obj) {
    return typeof obj === "string";
  },
  isBoolean: function isBoolean(obj) {
    return obj === false || obj === true;
  },
  isFunction: function isFunction(obj) {
    return obj instanceof Function;
  },
  isAsyncFunction: function isAsyncFunction(obj) {
    return Object.prototype.toString.call(obj) === "[object AsyncFunction]";
  },
  supportsPassive: function supportsPassive() {
    var supportsPassive = false;
    try {
      var opts = Object.defineProperty({}, "passive", {
        get: function get() {
          supportsPassive = true;
          return false;
        },
      });
      window.addEventListener("testPassive", null, opts);
      window.removeEventListener("testPassive", null, opts);
    } catch (e) {}
    return supportsPassive;
  },
};

var INTERPRETATIONS = [
  {
    litmus: Common.isString,
    conversions: {
      THREE_CHAR_HEX: {
        read: function read(original) {
          var test = original.match(/^#([A-F0-9])([A-F0-9])([A-F0-9])$/i);
          if (test === null) {
            return false;
          }
          return {
            space: "HEX",
            hex: parseInt(
              "0x" +
                test[1].toString() +
                test[1].toString() +
                test[2].toString() +
                test[2].toString() +
                test[3].toString() +
                test[3].toString(),
              16
            ),
          };
        },
        write: colorToString,
      },
      SIX_CHAR_HEX: {
        read: function read(original) {
          var test = original.match(/^#([A-F0-9]{6})$/i);
          if (test === null) {
            return false;
          }
          return {
            space: "HEX",
            hex: parseInt("0x" + test[1].toString(), 16),
          };
        },
        write: colorToString,
      },
      CSS_RGB: {
        read: function read(original) {
          var test = original.match(/^rgb\(\s*(.+)\s*,\s*(.+)\s*,\s*(.+)\s*\)/);
          if (test === null) {
            return false;
          }
          return {
            space: "RGB",
            r: parseFloat(test[1]),
            g: parseFloat(test[2]),
            b: parseFloat(test[3]),
          };
        },
        write: colorToString,
      },
      CSS_RGBA: {
        read: function read(original) {
          var test = original.match(/^rgba\(\s*(.+)\s*,\s*(.+)\s*,\s*(.+)\s*,\s*(.+)\s*\)/);
          if (test === null) {
            return false;
          }
          return {
            space: "RGB",
            r: parseFloat(test[1]),
            g: parseFloat(test[2]),
            b: parseFloat(test[3]),
            a: parseFloat(test[4]),
          };
        },
        write: colorToString,
      },
    },
  },
  {
    litmus: Common.isNumber,
    conversions: {
      HEX: {
        read: function read(original) {
          return {
            space: "HEX",
            hex: original,
            conversionName: "HEX",
          };
        },
        write: function write(color) {
          return color.hex;
        },
      },
    },
  },
  {
    litmus: Common.isArray,
    conversions: {
      RGB_ARRAY: {
        read: function read(original) {
          if (original.length !== 3) {
            return false;
          }
          return {
            space: "RGB",
            r: original[0],
            g: original[1],
            b: original[2],
          };
        },
        write: function write(color) {
          return [color.r, color.g, color.b];
        },
      },
      RGBA_ARRAY: {
        read: function read(original) {
          if (original.length !== 4) return false;
          return {
            space: "RGB",
            r: original[0],
            g: original[1],
            b: original[2],
            a: original[3],
          };
        },
        write: function write(color) {
          return [color.r, color.g, color.b, color.a];
        },
      },
    },
  },
  {
    litmus: Common.isObject,
    conversions: {
      RGBA_OBJ: {
        read: function read(original) {
          if (
            Common.isNumber(original.r) &&
            Common.isNumber(original.g) &&
            Common.isNumber(original.b) &&
            Common.isNumber(original.a)
          ) {
            return {
              space: "RGB",
              r: original.r,
              g: original.g,
              b: original.b,
              a: original.a,
            };
          }
          return false;
        },
        write: function write(color) {
          return {
            r: color.r,
            g: color.g,
            b: color.b,
            a: color.a,
          };
        },
      },
      RGB_OBJ: {
        read: function read(original) {
          if (Common.isNumber(original.r) && Common.isNumber(original.g) && Common.isNumber(original.b)) {
            return {
              space: "RGB",
              r: original.r,
              g: original.g,
              b: original.b,
            };
          }
          return false;
        },
        write: function write(color) {
          return {
            r: color.r,
            g: color.g,
            b: color.b,
          };
        },
      },
      HSVA_OBJ: {
        read: function read(original) {
          if (
            Common.isNumber(original.h) &&
            Common.isNumber(original.s) &&
            Common.isNumber(original.v) &&
            Common.isNumber(original.a)
          ) {
            return {
              space: "HSV",
              h: original.h,
              s: original.s,
              v: original.v,
              a: original.a,
            };
          }
          return false;
        },
        write: function write(color) {
          return {
            h: color.h,
            s: color.s,
            v: color.v,
            a: color.a,
          };
        },
      },
      HSV_OBJ: {
        read: function read(original) {
          if (Common.isNumber(original.h) && Common.isNumber(original.s) && Common.isNumber(original.v)) {
            return {
              space: "HSV",
              h: original.h,
              s: original.s,
              v: original.v,
            };
          }
          return false;
        },
        write: function write(color) {
          return {
            h: color.h,
            s: color.s,
            v: color.v,
          };
        },
      },
    },
  },
];
var result;
var toReturn;
var interpret = function interpret() {
  toReturn = false;
  var original = arguments.length > 1 ? Common.toArray(arguments) : arguments[0];
  Common.each(INTERPRETATIONS, function (family) {
    if (family.litmus(original)) {
      Common.each(family.conversions, function (conversion, conversionName) {
        result = conversion.read(original);
        if (toReturn === false && result !== false) {
          toReturn = result;
          result.conversionName = conversionName;
          result.conversion = conversion;
          return Common.BREAK;
        }
      });
      return Common.BREAK;
    }
  });
  return toReturn;
};

var ColorMath = {
  hsv_to_rgb: function hsv_to_rgb(h, s, v) {
    var hi = Math.floor(h / 60) % 6;
    var f = h / 60 - Math.floor(h / 60);
    var p = v * (1.0 - s);
    var q = v * (1.0 - f * s);
    var t = v * (1.0 - (1.0 - f) * s);
    var c = [
      [v, t, p],
      [q, v, p],
      [p, v, t],
      [p, q, v],
      [t, p, v],
      [v, p, q],
    ][hi];
    return {
      r: c[0] * 255,
      g: c[1] * 255,
      b: c[2] * 255,
    };
  },
  rgb_to_hsv: function rgb_to_hsv(r, g, b) {
    var min = Math.min(r, g, b);
    var max = Math.max(r, g, b);
    var delta = max - min;
    var h;
    var s;
    if (max !== 0) {
      s = delta / max;
    } else {
      return {
        h: NaN,
        s: 0,
        v: 0,
      };
    }
    if (r === max) {
      h = (g - b) / delta;
    } else if (g === max) {
      h = 2 + (b - r) / delta;
    } else {
      h = 4 + (r - g) / delta;
    }
    h /= 6;
    if (h < 0) {
      h += 1;
    }
    return {
      h: h * 360,
      s: s,
      v: max / 255,
    };
  },
  rgb_to_hex: function rgb_to_hex(r, g, b) {
    var hex = this.hex_with_component(0, 2, r);
    hex = this.hex_with_component(hex, 1, g);
    hex = this.hex_with_component(hex, 0, b);
    return hex;
  },
  component_from_hex: function component_from_hex(hex, componentIndex) {
    return (hex >> (componentIndex * 8)) & 0xff;
  },
  hex_with_component: function hex_with_component(hex, componentIndex, value) {
    var tmpComponent = componentIndex * 8;
    value = (value << tmpComponent) | (hex & ~(0xff << tmpComponent));
    return value;
  },
};

var Color = (function () {
  function Color() {
    this.__state = interpret.apply(this, arguments);
    if (this.__state === false) {
      throw new Error("Failed to interpret color arguments");
    }
    this.__state.a = this.__state.a || 1;
  }
  var _proto = Color.prototype;
  _proto.toString = function toString() {
    return colorToString(this);
  };
  _proto.toHexString = function toHexString() {
    return colorToString(this, true);
  };
  _proto.toOriginal = function toOriginal() {
    return this.__state.conversion.write(this);
  };
  return Color;
})();
function defineRGBComponent(target, component, componentHexIndex) {
  Object.defineProperty(target, component, {
    get: function get() {
      if (this.__state.space === "RGB") {
        return this.__state[component];
      }
      Color.recalculateRGB(this, component, componentHexIndex);
      return this.__state[component];
    },
    set: function set(v) {
      if (this.__state.space !== "RGB") {
        Color.recalculateRGB(this, component, componentHexIndex);
        this.__state.space = "RGB";
      }
      this.__state[component] = v;
    },
  });
}
function defineHSVComponent(target, component) {
  Object.defineProperty(target, component, {
    get: function get() {
      if (this.__state.space === "HSV") {
        return this.__state[component];
      }
      Color.recalculateHSV(this);
      return this.__state[component];
    },
    set: function set(v) {
      if (this.__state.space !== "HSV") {
        Color.recalculateHSV(this);
        this.__state.space = "HSV";
      }
      this.__state[component] = v;
    },
  });
}
Color.recalculateRGB = function (color, component, componentHexIndex) {
  if (color.__state.space === "HEX") {
    color.__state[component] = ColorMath.component_from_hex(color.__state.hex, componentHexIndex);
  } else if (color.__state.space === "HSV") {
    Common.extend(color.__state, ColorMath.hsv_to_rgb(color.__state.h, color.__state.s, color.__state.v));
  } else {
    throw new Error("Corrupted color state");
  }
};
Color.recalculateHSV = function (color) {
  var result = ColorMath.rgb_to_hsv(color.r, color.g, color.b);
  Common.extend(color.__state, {
    s: result.s,
    v: result.v,
  });
  if (!Common.isNaN(result.h)) {
    color.__state.h = result.h;
  } else if (Common.isUndefined(color.__state.h)) {
    color.__state.h = 0;
  }
};
Color.COMPONENTS = ["r", "g", "b", "h", "s", "v", "hex", "a"];
defineRGBComponent(Color.prototype, "r", 2);
defineRGBComponent(Color.prototype, "g", 1);
defineRGBComponent(Color.prototype, "b", 0);
defineHSVComponent(Color.prototype, "h");
defineHSVComponent(Color.prototype, "s");
defineHSVComponent(Color.prototype, "v");
Object.defineProperty(Color.prototype, "a", {
  get: function get() {
    return this.__state.a;
  },
  set: function set(v) {
    this.__state.a = v;
  },
});
Object.defineProperty(Color.prototype, "hex", {
  get: function get() {
    if (this.__state.space !== "HEX") {
      this.__state.hex = ColorMath.rgb_to_hex(this.r, this.g, this.b);
      this.__state.space = "HEX";
    }
    return this.__state.hex;
  },
  set: function set(v) {
    this.__state.space = "HEX";
    this.__state.hex = v;
  },
});

var Controller = (function () {
  function Controller(object, property) {
    this.initialValue = object[property];
    this.domElement = document.createElement("div");
    this.object = object;
    this.property = property;
    this._readonly = false;
    this.__onChange = undefined;
    this.__onFinishChange = undefined;
    this.__transformInput = function (x) {
      return x;
    };
    this.__transformOutput = function (x) {
      return x;
    };
    this.forceUpdateDisplay = false;
  }
  var _proto = Controller.prototype;
  _proto.hide = function hide() {
    this.domElement.parentNode.parentNode.style.display = "none";
    return this;
  };
  _proto.show = function show() {
    this.domElement.parentNode.parentNode.style.display = "";
    return this;
  };
  _proto.onChange = function onChange(fnc) {
    this.__onChange = fnc;
    return this;
  };
  _proto.onFinishChange = function onFinishChange(fnc) {
    this.__onFinishChange = fnc;
    return this;
  };
  _proto.setValue = function setValue(newValue, disableOnChange) {
    if (disableOnChange === void 0) {
      disableOnChange = false;
    }
    var __newValue = this.__transformOutput(newValue);
    var oldValue = this.object[this.property];
    this.object[this.property] = __newValue;
    if (this.__onChange && !disableOnChange) {
      this.__onChange.call(this, __newValue, oldValue);
    }
    this.updateDisplay();
    return this;
  };
  _proto.getValue = function getValue() {
    return this.__transformInput(this.object[this.property]);
  };
  _proto.updateDisplay = function updateDisplay() {
    return this;
  };
  _proto.isModified = function isModified() {
    return this.initialValue !== this.getValue();
  };
  _proto.transform = function transform(transformInput, transformOutput) {
    if (transformInput === void 0) {
      transformInput = function transformInput(x) {
        return x;
      };
    }
    if (transformOutput === void 0) {
      transformOutput = function transformOutput(x) {
        return x;
      };
    }
    this.__transformInput = transformInput;
    this.__transformOutput = transformOutput;
    this.updateDisplay();
    return this;
  };
  _proto.readonly = function readonly(ro) {
    this._readonly = ro;
    return this;
  };
  _proto.borderColor = function borderColor(color) {
    this.__li.style.borderLeftColor = color;
    return this;
  };
  _proto.borderWidth = function borderWidth(px) {
    this.__li.style.borderLeftWidth = px + "px";
    return this;
  };
  return Controller;
})();

function _inheritsLoose(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;
  subClass.__proto__ = superClass;
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

var EVENT_MAP = {
  HTMLEvents: ["change"],
  MouseEvents: ["click", "mousemove", "mousedown", "mouseup", "mouseover", "wheel"],
  KeyboardEvents: ["keydown"],
};
var EVENT_MAP_INV = {};
Common.each(EVENT_MAP, function (v, k) {
  Common.each(v, function (e) {
    EVENT_MAP_INV[e] = k;
  });
});
var CSS_VALUE_PIXELS = /(\d+(\.\d+)?)px/;
function cssValueToPixels(val) {
  if (val === "0" || Common.isUndefined(val)) {
    return 0;
  }
  var match = val.match(CSS_VALUE_PIXELS);
  if (!Common.isNull(match)) {
    return parseFloat(match[1]);
  }
  return 0;
}
var dom = {
  makeSelectable: function makeSelectable(elem, selectable) {
    if (elem === undefined || elem.style === undefined) {
      return;
    }
    elem.onselectstart = selectable
      ? function () {
          return false;
        }
      : function () {};
    elem.style.MozUserSelect = selectable ? "auto" : "none";
    elem.style.KhtmlUserSelect = selectable ? "auto" : "none";
    elem.unselectable = selectable ? "on" : "off";
  },
  makeFullscreen: function makeFullscreen(elem, horizontal, vertical) {
    if (Common.isUndefined(horizontal)) {
      horizontal = true;
    }
    if (Common.isUndefined(vertical)) {
      vertical = true;
    }
    elem.style.position = "absolute";
    if (horizontal) {
      elem.style.left = 0;
      elem.style.right = 0;
    }
    if (vertical) {
      elem.style.top = 0;
      elem.style.bottom = 0;
    }
  },
  fakeEvent: function fakeEvent(elem, eventType, params, aux) {
    params = params || {};
    var className = EVENT_MAP_INV[eventType];
    if (!className) {
      throw new Error("Event type " + eventType + " not supported.");
    }
    var evt = document.createEvent(className);
    switch (className) {
      case "MouseEvents": {
        var clientX = params.x || params.clientX || 0;
        var clientY = params.y || params.clientY || 0;
        evt.initMouseEvent(
          eventType,
          params.bubbles || false,
          params.cancelable || true,
          window,
          params.clickCount || 1,
          0,
          0,
          clientX,
          clientY,
          false,
          false,
          false,
          false,
          0,
          null
        );
        break;
      }
      case "KeyboardEvents": {
        var init = evt.initKeyboardEvent || evt.initKeyEvent;
        Common.defaults(params, {
          cancelable: true,
          ctrlKey: false,
          altKey: false,
          shiftKey: false,
          metaKey: false,
          keyCode: undefined,
          charCode: undefined,
        });
        init(
          eventType,
          params.bubbles || false,
          params.cancelable,
          window,
          params.ctrlKey,
          params.altKey,
          params.shiftKey,
          params.metaKey,
          params.keyCode,
          params.charCode
        );
        break;
      }
      default: {
        evt.initEvent(eventType, params.bubbles || false, params.cancelable || true);
        break;
      }
    }
    Common.defaults(evt, aux);
    elem.dispatchEvent(evt);
  },
  bind: function bind(elem, event, func, bool, passive) {
    bool = bool || false;
    passive = passive || false;
    if (elem.addEventListener) {
      var listenerArg = Common.supportsPassive()
        ? {
            capture: bool,
            passive: passive,
          }
        : bool;
      elem.addEventListener(event, func, listenerArg);
    } else if (elem.attachEvent) {
      elem.attachEvent("on" + event, func);
    }
    return dom;
  },
  unbind: function unbind(elem, event, func, bool) {
    bool = bool || false;
    if (elem.removeEventListener) {
      elem.removeEventListener(event, func, bool);
    } else if (elem.detachEvent) {
      elem.detachEvent("on" + event, func);
    }
    return dom;
  },
  addClass: function addClass(elem, className) {
    if (elem.className === undefined) {
      elem.className = className;
    } else if (elem.className !== className) {
      var classes = elem.className.split(/ +/);
      if (classes.indexOf(className) === -1) {
        classes.push(className);
        elem.className = classes.join(" ").replace(/^\s+/, "").replace(/\s+$/, "");
      }
    }
    return dom;
  },
  removeClass: function removeClass(elem, className) {
    if (className) {
      if (elem.className === undefined);
      else if (elem.className === className) {
        elem.removeAttribute("class");
      } else {
        var classes = elem.className.split(/ +/);
        var index = classes.indexOf(className);
        if (index !== -1) {
          classes.splice(index, 1);
          elem.className = classes.join(" ");
        }
      }
    } else {
      elem.className = undefined;
    }
    return dom;
  },
  hasClass: function hasClass(elem, className) {
    return new RegExp("(?:^|\\s+)" + className + "(?:\\s+|$)").test(elem.className) || false;
  },
  getWidth: function getWidth(elem) {
    var style = getComputedStyle(elem);
    return (
      cssValueToPixels(style["border-left-width"]) +
      cssValueToPixels(style["border-right-width"]) +
      cssValueToPixels(style["padding-left"]) +
      cssValueToPixels(style["padding-right"]) +
      cssValueToPixels(style.width)
    );
  },
  getHeight: function getHeight(elem) {
    var style = getComputedStyle(elem);
    return (
      cssValueToPixels(style["border-top-width"]) +
      cssValueToPixels(style["border-bottom-width"]) +
      cssValueToPixels(style["padding-top"]) +
      cssValueToPixels(style["padding-bottom"]) +
      cssValueToPixels(style.height)
    );
  },
  getOffset: function getOffset(elem) {
    var offset = {
      left: 0,
      top: 0,
    };
    if (elem.offsetParent) {
      do {
        offset.left += elem.offsetLeft;
        offset.top += elem.offsetTop;
        elem = elem.offsetParent;
      } while (elem);
    }
    return offset;
  },
  isActive: function isActive(elem) {
    return elem === document.activeElement && (elem.type || elem.href);
  },
};

var BooleanController = (function (_Controller) {
  _inheritsLoose(BooleanController, _Controller);
  function BooleanController(object, property) {
    var _this2;
    _this2 = _Controller.call(this, object, property) || this;
    var _this = _assertThisInitialized(_this2);
    _this2.__prev = _this2.getValue();
    _this2.__checkbox = document.createElement("input");
    _this2.__checkbox.setAttribute("type", "checkbox");
    function onChange() {
      if (!_this._readonly) {
        _this.setValue(!_this.__prev);
      }
    }
    dom.bind(_this2.__checkbox, "change", onChange, false, true);
    _this2.domElement.appendChild(_this2.__checkbox);
    _this2.updateDisplay();
    return _this2;
  }
  var _proto = BooleanController.prototype;
  _proto.setValue = function setValue(v, disableOnChange) {
    if (disableOnChange === void 0) {
      disableOnChange = false;
    }
    var toReturn = _Controller.prototype.setValue.call(this, v, disableOnChange);
    if (this.__onFinishChange && !disableOnChange) {
      this.__onFinishChange.call(this, this.getValue());
    }
    this.__prev = this.getValue();
    return toReturn;
  };
  _proto.updateDisplay = function updateDisplay() {
    if (this.getValue() === true) {
      this.__checkbox.setAttribute("checked", "checked");
      this.__checkbox.checked = true;
      this.__prev = true;
    } else {
      this.__checkbox.checked = false;
      this.__prev = false;
    }
    return _Controller.prototype.updateDisplay.call(this);
  };
  return BooleanController;
})(Controller);

var OptionController = (function (_Controller) {
  _inheritsLoose(OptionController, _Controller);
  function OptionController(object, property, options) {
    var _this2;
    _this2 = _Controller.call(this, object, property) || this;
    var _this = _assertThisInitialized(_this2);
    _this2.__select = document.createElement("select");
    if (Common.isArray(options)) {
      var map = {};
      Common.each(options, function (element) {
        map[element] = element;
      });
      options = map;
    }
    Common.each(options, function (value, key) {
      var opt = document.createElement("option");
      opt.innerHTML = key;
      opt.setAttribute("value", value);
      _this.__select.appendChild(opt);
    });
    _this2.updateDisplay();
    dom.bind(
      _this2.__select,
      "change",
      function () {
        var desiredValue = this.options[this.selectedIndex].value;
        _this.setValue(desiredValue);
      },
      false,
      true
    );
    _this2.domElement.appendChild(_this2.__select);
    return _this2;
  }
  var _proto = OptionController.prototype;
  _proto.setValue = function setValue(v, disableOnChange) {
    if (disableOnChange === void 0) {
      disableOnChange = false;
    }
    if (this._readonly) {
      return this.getValue();
    }
    var toReturn = _Controller.prototype.setValue.call(this, v, disableOnChange);
    if (this.__onFinishChange && !disableOnChange) {
      this.__onFinishChange.call(this, this.getValue());
    }
    return toReturn;
  };
  _proto.updateDisplay = function updateDisplay() {
    if (dom.isActive(this.__select) && !this.forceUpdateDisplay) {
      return this;
    }
    this.__select.value = this.getValue();
    return _Controller.prototype.updateDisplay.call(this);
  };
  return OptionController;
})(Controller);

var StringController = (function (_Controller) {
  _inheritsLoose(StringController, _Controller);
  function StringController(object, property) {
    var _this2;
    _this2 = _Controller.call(this, object, property) || this;
    var _this = _assertThisInitialized(_this2);
    function onChange() {
      if (!_this._readonly) {
        _this.setValue(_this.__input.value);
      }
    }
    function onBlur() {
      if (_this.__onFinishChange) {
        _this.__onFinishChange.call(_this, _this.getValue());
      }
    }
    function onKeyDown(e) {
      if (e.keyCode === 13) {
        this.blur();
      }
    }
    _this2.__input = document.createElement("input");
    _this2.__input.setAttribute("type", "text");
    dom.bind(_this2.__input, "keyup", onChange, false, true);
    dom.bind(_this2.__input, "change", onChange, false, true);
    dom.bind(_this2.__input, "blur", onBlur, false, true);
    dom.bind(_this2.__input, "keydown", onKeyDown, false, true);
    _this2.updateDisplay();
    _this2.domElement.appendChild(_this2.__input);
    return _this2;
  }
  var _proto = StringController.prototype;
  _proto.updateDisplay = function updateDisplay() {
    if (dom.isActive(this.__input)) {
      return this;
    }
    this.__input.value = this.getValue();
    return _Controller.prototype.updateDisplay.call(this);
  };
  return StringController;
})(Controller);

function numDecimals(x) {
  var _x = x.toString();
  if (_x.indexOf(".") > -1) {
    return _x.length - _x.indexOf(".") - 1;
  }
  return 2;
}
var NumberController = (function (_Controller) {
  _inheritsLoose(NumberController, _Controller);
  function NumberController(object, property, params) {
    var _this;
    _this = _Controller.call(this, object, property) || this;
    params = params || {};
    _this.__min = params.min;
    _this.__max = params.max;
    _this.__step = params.step;
    if (Common.isUndefined(_this.__step)) {
      if (_this.initialValue === 0) {
        _this.__impliedStep = 1;
      } else {
        _this.__impliedStep = Math.pow(10, Math.floor(Math.log(Math.abs(_this.initialValue)) / Math.LN10)) / 10;
      }
    } else {
      _this.__impliedStep = _this.__step;
    }
    _this.__precision = numDecimals(_this.__impliedStep);
    return _this;
  }
  var _proto = NumberController.prototype;
  _proto.setValue = function setValue(v, disableOnChange) {
    if (disableOnChange === void 0) {
      disableOnChange = false;
    }
    if (this.__min != null && v < this.__min) {
      v = this.__min;
    } else if (this.__max != null && v > this.__max) {
      v = this.__max;
    }
    if (this.__step != null && v % this.__step !== 0) {
      v = Math.round(v / this.__step) * this.__step;
    }
    return _Controller.prototype.setValue.call(this, v, disableOnChange);
  };
  _proto.min = function min(minValue) {
    this.__min = minValue;
    return this;
  };
  _proto.max = function max(maxValue) {
    this.__max = maxValue;
    return this;
  };
  _proto.step = function step(stepValue) {
    this.__step = stepValue;
    this.__impliedStep = stepValue;
    this.__precision = numDecimals(stepValue);
    if (this.__input) {
      this.__input.setAttribute("step", stepValue);
    }
    return this;
  };
  return NumberController;
})(Controller);

function roundToDecimal(value, decimals) {
  var tenTo = Math.pow(10, decimals);
  return Math.round(value * tenTo) / tenTo;
}
var NumberControllerBox = (function (_NumberController) {
  _inheritsLoose(NumberControllerBox, _NumberController);
  function NumberControllerBox(object, property, params) {
    var _this2;
    _this2 = _NumberController.call(this, object, property, params) || this;
    params = params || {};
    _this2.__suffix = params.suffix || "";
    _this2.__truncationSuspended = false;
    var _this = _assertThisInitialized(_this2);
    var prevY;
    function onKeyDown(e) {
      switch (e.keyCode) {
        case 13:
          _this.__truncationSuspended = true;
          this.blur();
          _this.__truncationSuspended = false;
          onFinish();
          break;
        case 38:
          _this.setValue(_this.getValue() + _this.__impliedStep);
          break;
        case 40:
          _this.setValue(_this.getValue() - _this.__impliedStep);
          break;
      }
    }
    function onChange() {
      var value = _this.__input.value;
      if (params && _this.__suffix) {
        value = value.replace(_this.__suffix, "");
      }
      var attempted = parseFloat(value);
      if (!Common.isNaN(attempted) && !_this._readonly) {
        _this.setValue(attempted);
      }
    }
    function onFinish() {
      if (_this.__onFinishChange) {
        _this.__onFinishChange.call(_this, _this.getValue());
      }
    }
    function onBlur() {
      onFinish();
    }
    function onMouseDrag(e) {
      var diff = prevY - e.clientY;
      _this.setValue(_this.getValue() + diff * _this.__impliedStep);
      prevY = e.clientY;
    }
    function onMouseUp(e) {
      dom.unbind(window, "mousemove", onMouseDrag);
      dom.unbind(window, "mouseup", onMouseUp);
      onFinish();
    }
    function onMouseDown(e) {
      dom.bind(window, "mousemove", onMouseDrag, false, true);
      dom.bind(window, "mouseup", onMouseUp, false, true);
      prevY = e.clientY;
    }
    function onWheel(e) {
      e.preventDefault();
      var direction = -e.deltaY >> 10 || 1;
      _this.setValue(_this.getValue() + direction * _this.__impliedStep);
    }
    _this2.__input = document.createElement("input");
    _this2.__input.setAttribute("type", "text");
    _this2.__up = document.createElement("button");
    _this2.__up.setAttribute(
      "style",
      "position:absolute;right:0;height:10px;top:4px;background-color: #555;border: none;"
    );
    _this2.__down = document.createElement("button");
    _this2.__down.setAttribute(
      "style",
      "position:absolute;right:0;height:10px;top:15px;background-color: #555;border: none;"
    );
    dom.bind(_this2.__up, "mousedown", function () {
      _this.setValue(_this.getValue() + _this.__impliedStep);
    });
    dom.bind(_this2.__down, "mousedown", function () {
      _this.setValue(_this.getValue() - _this.__impliedStep);
    });
    dom.bind(_this2.__input, "change", onChange, false, true);
    dom.bind(_this2.__input, "blur", onBlur, false, true);
    dom.bind(_this2.__input, "mousedown", onMouseDown, false, true);
    dom.bind(_this2.__input, "wheel", onWheel);
    dom.bind(_this2.__input, "keydown", onKeyDown, false, true);
    _this2.updateDisplay();
    _this2.domElement.appendChild(_this2.__input);
    _this2.domElement.appendChild(_this2.__up);
    _this2.domElement.appendChild(_this2.__down);
    return _this2;
  }
  var _proto = NumberControllerBox.prototype;
  _proto.updateDisplay = function updateDisplay() {
    if (dom.isActive(this.__input)) {
      return this;
    }
    this.__input.value = this.__truncationSuspended
      ? this.getValue()
      : roundToDecimal(this.getValue(), this.__precision) + this.__suffix;
    return _NumberController.prototype.updateDisplay.call(this);
  };
  return NumberControllerBox;
})(NumberController);

function map(v, i1, i2, o1, o2) {
  return o1 + (o2 - o1) * ((v - i1) / (i2 - i1));
}
var NumberControllerSlider = (function (_NumberController) {
  _inheritsLoose(NumberControllerSlider, _NumberController);
  function NumberControllerSlider(object, property, min, max, step) {
    var _this2;
    _this2 =
      _NumberController.call(this, object, property, {
        min: min,
        max: max,
        step: step,
      }) || this;
    var _this = _assertThisInitialized(_this2);
    _this2.__background = document.createElement("div");
    _this2.__foreground = document.createElement("div");
    dom.bind(_this2.__background, "mousedown", onMouseDown);
    dom.bind(_this2.__background, "touchstart", onTouchStart, false, true);
    dom.bind(_this2.__background, "wheel", onWheel);
    dom.addClass(_this2.__background, "slider");
    dom.addClass(_this2.__foreground, "slider-fg");
    function onMouseDown(e) {
      document.activeElement.blur();
      dom.bind(window, "mousemove", onMouseDrag);
      dom.bind(window, "mouseup", onMouseUp, false, true);
      onMouseDrag(e);
    }
    function onMouseDrag(e) {
      onDrag(e);
    }
    function onDrag(e) {
      var bgRect = _this.__background.getBoundingClientRect();
      if (!_this._readonly) {
        _this.setValue(map(e.clientX, bgRect.left, bgRect.right, _this.__min, _this.__max));
      }
      return false;
    }
    function onMouseUp(e) {
      dom.unbind(window, "mousemove", onMouseDrag);
      dom.unbind(window, "mouseup", onMouseUp);
      if (_this.__onFinishChange) {
        _this.__onFinishChange.call(_this, _this.getValue());
      }
    }
    function onTouchStart(e) {
      if (e.touches.length !== 1) {
        return;
      }
      document.activeElement.blur();
      dom.bind(window, "touchmove", onTouchMove, false, true);
      dom.bind(window, "touchend", onTouchEnd, false, true);
      _this.__activeTouch = e.targetTouches[0];
      onTouchMove(e);
    }
    function onTouchMove(e) {
      var changed = e.changedTouches;
      for (var i = 0; i < changed.length; i++) {
        if (changed[i].identifier === _this.__activeTouch.identifier) {
          onDrag(changed[i]);
        }
      }
    }
    function onTouchEnd() {
      dom.unbind(window, "touchmove", onTouchMove);
      dom.unbind(window, "touchend", onTouchEnd);
      _this.__activeTouch = null;
      if (_this.__onFinishChange) {
        _this.__onFinishChange.call(_this, _this.getValue());
      }
    }
    function onWheel(e) {
      e.preventDefault();
      var direction = -e.deltaY >> 10 || 1;
      _this.setValue(_this.getValue() + direction * _this.__impliedStep);
    }
    _this2.updateDisplay();
    _this2.__background.appendChild(_this2.__foreground);
    _this2.domElement.appendChild(_this2.__background);
    return _this2;
  }
  var _proto = NumberControllerSlider.prototype;
  _proto.updateDisplay = function updateDisplay() {
    if (this.__input === document.activeElement) {
      return this;
    }
    var value = this.getValue();
    var pct = (value - this.__min) / (this.__max - this.__min);
    this.__foreground.style.width = pct * 100 + "%";
    return _NumberController.prototype.updateDisplay.call(this);
  };
  return NumberControllerSlider;
})(NumberController);

var FunctionController = (function (_Controller) {
  _inheritsLoose(FunctionController, _Controller);
  function FunctionController(object, property, text) {
    var _this2;
    _this2 = _Controller.call(this, object, property) || this;
    var _this = _assertThisInitialized(_this2);
    _this2.__button = document.createElement("div");
    _this2.__button.innerHTML = text === undefined ? "Fire" : text;
    dom.bind(_this2.__button, "click", function (e) {
      e.preventDefault();
      _this.fire();
      dom.addClass(_this.__button.parentElement.parentElement.parentElement, "function--active");
      setTimeout(function () {
        dom.removeClass(_this.__button.parentElement.parentElement.parentElement, "function--active");
      }, 100);
      return false;
    });
    dom.addClass(_this2.__button, "button");
    _this2.domElement.appendChild(_this2.__button);
    return _this2;
  }
  var _proto = FunctionController.prototype;
  _proto.fire = function fire() {
    if (this.__onChange) {
      this.__onChange.call(this, this.getValue());
    }
    this.getValue().call(this.object);
    if (this.__onFinishChange) {
      this.__onFinishChange.call(this, this.getValue());
    }
  };
  return FunctionController;
})(Controller);

var TabbedController = (function (_Controller) {
  _inheritsLoose(TabbedController, _Controller);
  function TabbedController(object, property, text, tabs, displayName) {
    var _this2;
    _this2 = _Controller.call(this, object, property) || this;
    var _this = _assertThisInitialized(_this2);
    _this2.__button = document.createElement("div");
    _this2.__button.innerHTML = text === undefined ? "Fire" : text;
    dom.bind(_this2.__button, "click", function (e) {
      e.preventDefault();
      _this.fire();
      return false;
    });
    dom.addClass(_this2.__button, "button");
    var tabSize = tabs * 2;
    _this2.__button.style.paddingLeft = tabSize.toString() + "em";
    _this2.domElement.appendChild(_this2.__button);
    return _this2;
  }
  var _proto = TabbedController.prototype;
  _proto.fire = function fire() {
    if (this.__onChange) {
      this.__onChange.call(this);
    }
    this.getValue().call(this.object);
    if (this.__onFinishChange) {
      this.__onFinishChange.call(this, this.getValue());
    }
  };
  return TabbedController;
})(Controller);

var ColorController = (function (_Controller) {
  _inheritsLoose(ColorController, _Controller);
  function ColorController(object, property) {
    var _this2;
    _this2 = _Controller.call(this, object, property) || this;
    _this2.__color = new Color(_this2.getValue());
    _this2.__temp = new Color(0);
    var _this = _assertThisInitialized(_this2);
    dom.makeSelectable(_this2.domElement, false);
    _this2.__selector = document.createElement("div");
    _this2.__selector.className = "selector";
    _this2.__saturation_field = document.createElement("div");
    _this2.__saturation_field.className = "saturation-field";
    _this2.__field_knob = document.createElement("div");
    _this2.__field_knob.className = "field-knob";
    _this2.__field_knob_border = "2px solid ";
    _this2.__hue_knob = document.createElement("div");
    _this2.__hue_knob.className = "hue-knob";
    _this2.__hue_field = document.createElement("div");
    _this2.__hue_field.className = "hue-field";
    _this2.__input = document.createElement("input");
    _this2.__input.type = "text";
    _this2.__input_textShadow = ["1px 0px 0px ", "-1px 0px 0px ", "0px 1px 0px ", "0px -1px 0px "];
    dom.bind(
      _this2.__input,
      "keydown",
      function (e) {
        if (e.keyCode === 13) {
          onBlur.call(this);
        }
      },
      false,
      true
    );
    dom.bind(_this2.__input, "blur", onBlur, false, true);
    dom.bind(
      _this2.__selector,
      "mousedown",
      function (e) {
        dom.addClass(this, "drag").bind(window, "mouseup", function (e) {
          dom.removeClass(_this.__selector, "drag");
        });
      },
      false,
      true
    );
    dom.bind(
      _this2.__selector,
      "touchstart",
      function () {
        dom.addClass(this, "drag").bind(
          window,
          "touchend",
          function () {
            dom.removeClass(_this.__selector, "drag");
          },
          false,
          true
        );
      },
      false,
      true
    );
    var valueField = document.createElement("div");
    Common.extend(_this2.__selector.style, {
      width: "122px",
      height: "102px",
      padding: "3px",
      backgroundColor: "#222",
      boxShadow: "0px 1px 3px rgba(0,0,0,0.3)",
    });
    Common.extend(_this2.__field_knob.style, {
      position: "absolute",
      width: "12px",
      height: "12px",
      border: _this2.__field_knob_border + (_this2.__color.v < 0.5 ? "#fff" : "#000"),
      boxShadow: "0px 1px 3px rgba(0,0,0,0.5)",
      borderRadius: "12px",
      zIndex: 1,
    });
    Common.extend(_this2.__hue_knob.style, {
      position: "absolute",
      width: "15px",
      height: "2px",
      borderRight: "4px solid #fff",
      zIndex: 1,
    });
    Common.extend(_this2.__saturation_field.style, {
      width: "100px",
      height: "100px",
      border: "1px solid #555",
      marginRight: "3px",
      display: "inline-block",
      cursor: "pointer",
    });
    Common.extend(valueField.style, {
      width: "100%",
      height: "100%",
      background: "none",
    });
    linearGradient(valueField, "top", "rgba(0,0,0,0)", "#000");
    Common.extend(_this2.__hue_field.style, {
      width: "15px",
      height: "100px",
      border: "1px solid #555",
      cursor: "ns-resize",
      position: "absolute",
      top: "3px",
      right: "3px",
    });
    hueGradient(_this2.__hue_field);
    Common.extend(_this2.__input.style, {
      outline: "none",
      textAlign: "center",
      color: "#fff",
      border: 0,
      fontWeight: "bold",
      textShadow: _this2.__input_textShadow
        .map(function (d) {
          return d + " rgba(0,0,0,0.7)";
        })
        .join(", "),
    });
    dom.bind(_this2.__saturation_field, "mousedown", fieldDown);
    dom.bind(_this2.__saturation_field, "touchstart", fieldDown);
    dom.bind(_this2.__field_knob, "mousedown", fieldDown);
    dom.bind(_this2.__field_knob, "touchstart", fieldDown);
    dom.bind(_this2.__hue_field, "mousedown", fieldDownH);
    dom.bind(_this2.__hue_field, "touchstart", fieldDownH);
    function fieldDown(e) {
      setSV(e);
      dom.bind(window, "mousemove", setSV);
      dom.bind(window, "touchmove", setSV);
      dom.bind(window, "mouseup", fieldUpSV, false, true);
      dom.bind(window, "touchend", fieldUpSV, false, true);
    }
    function fieldDownH(e) {
      setH(e);
      dom.bind(window, "mousemove", setH);
      dom.bind(window, "touchmove", setH);
      dom.bind(window, "mouseup", fieldUpH, false, true);
      dom.bind(window, "touchend", fieldUpH, false, true);
    }
    function fieldUpSV() {
      dom.unbind(window, "mousemove", setSV);
      dom.unbind(window, "touchmove", setSV);
      dom.unbind(window, "mouseup", fieldUpSV);
      dom.unbind(window, "touchend", fieldUpSV);
      onFinish();
    }
    function fieldUpH() {
      dom.unbind(window, "mousemove", setH);
      dom.unbind(window, "touchmove", setH);
      dom.unbind(window, "mouseup", fieldUpH);
      dom.unbind(window, "touchend", fieldUpH);
      onFinish();
    }
    function onBlur() {
      var i = interpret(this.value);
      if (i !== false) {
        _this.__color.__state = i;
        _this.setValue(_this.__color.toOriginal());
      } else {
        this.value = _this.__color.toString();
      }
    }
    function onFinish() {
      if (_this.__onFinishChange) {
        _this.__onFinishChange.call(_this, _this.__color.toOriginal());
      }
    }
    _this2.__saturation_field.appendChild(valueField);
    _this2.__selector.appendChild(_this2.__field_knob);
    _this2.__selector.appendChild(_this2.__saturation_field);
    _this2.__selector.appendChild(_this2.__hue_field);
    _this2.__hue_field.appendChild(_this2.__hue_knob);
    _this2.domElement.appendChild(_this2.__input);
    _this2.domElement.appendChild(_this2.__selector);
    _this2.updateDisplay();
    function setSV(e) {
      if (e.type.indexOf("touch") === -1) {
        e.preventDefault();
      }
      var fieldRect = _this.__saturation_field.getBoundingClientRect();
      var _ref = (e.touches && e.touches[0]) || e,
        clientX = _ref.clientX,
        clientY = _ref.clientY;
      var s = (clientX - fieldRect.left) / (fieldRect.right - fieldRect.left);
      var v = 1 - (clientY - fieldRect.top) / (fieldRect.bottom - fieldRect.top);
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
      if (e.type.indexOf("touch") === -1) {
        e.preventDefault();
      }
      var fieldRect = _this.__hue_field.getBoundingClientRect();
      var _ref2 = (e.touches && e.touches[0]) || e,
        clientY = _ref2.clientY;
      var h = 1 - (clientY - fieldRect.top) / (fieldRect.bottom - fieldRect.top);
      if (h > 1) {
        h = 1;
      } else if (h < 0) {
        h = 0;
      }
      _this.__color.h = h * 360;
      _this.setValue(_this.__color.toOriginal());
      return false;
    }
    return _this2;
  }
  var _proto = ColorController.prototype;
  _proto.updateDisplay = function updateDisplay() {
    var i = interpret(this.getValue());
    if (i !== false) {
      var mismatch = false;
      Common.each(
        Color.COMPONENTS,
        function (component) {
          if (
            !Common.isUndefined(i[component]) &&
            !Common.isUndefined(this.__color.__state[component]) &&
            i[component] !== this.__color.__state[component]
          ) {
            mismatch = true;
            return Common.BREAK;
          }
        },
        this
      );
      if (mismatch) {
        Common.extend(this.__color.__state, i);
      }
    }
    Common.extend(this.__temp.__state, this.__color.__state);
    this.__temp.a = 1;
    var flip = this.__color.v < 0.5 || this.__color.s > 0.5 ? 255 : 0;
    var _flip = 255 - flip;
    Common.extend(this.__field_knob.style, {
      marginLeft: 100 * this.__color.s - 7 + "px",
      marginTop: 100 * (1 - this.__color.v) - 7 + "px",
      backgroundColor: this.__temp.toHexString(),
      border: this.__field_knob_border + "rgb(" + flip + "," + flip + "," + flip + ")",
    });
    this.__hue_knob.style.marginTop = (1 - this.__color.h / 360) * 100 + "px";
    this.__temp.s = 1;
    this.__temp.v = 1;
    linearGradient(this.__saturation_field, "left", "#fff", this.__temp.toHexString());
    this.__input.value = this.__color.toString();
    Common.extend(this.__input.style, {
      backgroundColor: this.__color.toHexString(),
      color: "rgb(" + flip + "," + flip + "," + flip + ")",
      textShadow: this.__input_textShadow
        .map(function (d) {
          return d + " rgba(" + _flip + "," + _flip + "," + _flip + ",0.7)";
        })
        .join(", "),
    });
  };
  return ColorController;
})(Controller);
var vendors = ["-moz-", "-o-", "-webkit-", "-ms-", ""];
function linearGradient(elem, x, a, b) {
  elem.style.background = "";
  Common.each(vendors, function (vendor) {
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

var FileController = (function (_Controller) {
  _inheritsLoose(FileController, _Controller);
  function FileController(object, property) {
    var _this2;
    _this2 = _Controller.call(this, object, property) || this;
    var _this = _assertThisInitialized(_this2);
    function onChange(e) {
      var fileReader = new FileReader();
      fileReader.addEventListener("load", function (file) {
        _this.fire(fileReader.result);
      });
      var file = e.target.files[0];
      fileReader.readAsDataURL(file);
    }
    _this2.__input = document.createElement("input");
    _this2.__input.setAttribute("type", "file");
    dom.bind(_this2.__input, "change", onChange);
    _this2.domElement.appendChild(_this2.__input);
    return _this2;
  }
  var _proto = FileController.prototype;
  _proto.fire = function fire(dataURL) {
    if (this.__onChange) {
      this.__onChange.call(this, dataURL);
    }
    this.getValue().call(this.object, dataURL);
    if (this.__onFinishChange) {
      this.__onFinishChange.call(this, dataURL);
    }
  };
  return FileController;
})(Controller);

var plotter = function plotter(fg, bg, type) {
  var round = Math.round;
  var PR = round(window.devicePixelRatio || 1);
  var WIDTH = 160 * PR;
  var HEIGHT = 60 * PR;
  var GRAPH_X = 3 * PR;
  var GRAPH_Y = 3 * PR;
  var GRAPH_WIDTH = 154 * PR;
  var GRAPH_HEIGHT = 54 * PR;
  var canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  var context = canvas.getContext("2d");
  context.font = "bold " + 9 * PR + "px Helvetica,Arial,sans-serif";
  context.textBaseline = "top";
  context.fillStyle = bg;
  context.fillRect(0, 0, WIDTH, HEIGHT);
  context.fillStyle = fg;
  context.fillRect(GRAPH_X, GRAPH_Y, GRAPH_WIDTH, GRAPH_HEIGHT);
  context.fillStyle = bg;
  context.globalAlpha = 0.9;
  context.fillRect(GRAPH_X, GRAPH_Y, GRAPH_WIDTH, GRAPH_HEIGHT);
  return {
    dom: canvas,
    update: function update(value, maxValue) {
      context.globalAlpha = 1;
      context.fillStyle = fg;
      context.drawImage(
        canvas,
        GRAPH_X + PR,
        GRAPH_Y,
        GRAPH_WIDTH - PR,
        GRAPH_HEIGHT,
        GRAPH_X,
        GRAPH_Y,
        GRAPH_WIDTH - PR,
        GRAPH_HEIGHT
      );
      context.fillRect(GRAPH_X + GRAPH_WIDTH - PR, GRAPH_Y, PR, GRAPH_HEIGHT);
      context.fillStyle = bg;
      context.globalAlpha = 0.9;
      context.fillRect(GRAPH_X + GRAPH_WIDTH - PR, GRAPH_Y, PR, round((1 - value / maxValue) * GRAPH_HEIGHT));
      if (type === "line") {
        context.fillRect(
          GRAPH_X + GRAPH_WIDTH - PR,
          round((1 - value / maxValue) * GRAPH_HEIGHT) + PR + 3,
          PR,
          round((value / maxValue) * GRAPH_HEIGHT)
        );
      }
    },
  };
};

var PlotterController = (function (_Controller) {
  _inheritsLoose(PlotterController, _Controller);
  function PlotterController(object, property, params) {
    var _this;
    _this = _Controller.call(this, object, property) || this;
    params = params || {};
    _this.max = params.max || 3;
    _this.period = params.period || 0;
    _this.prevValue = _this.getValue();
    _this.lastUpdate = Date.now();
    _this.__panel = new plotter(params.fgColor || "#fff", params.bgColor || "#000", params.type || "line");
    _this.domElement.appendChild(_this.__panel.dom);
    return _this;
  }
  var _proto = PlotterController.prototype;
  _proto.updateDisplay = function updateDisplay() {
    var value = this.getValue();
    if (this.period < 1 && value !== this.prevValue) {
      this.__panel.update(value, this.max);
    } else if (Date.now() - this.lastUpdate > this.period) {
      this.__panel.update(value, this.max);
      this.lastUpdate = Date.now() * 2 - this.lastUpdate - this.period;
    }
    this.prevValue = value;
    return _Controller.prototype.updateDisplay.call(this);
  };
  return PlotterController;
})(Controller);

var CustomController = (function (_Controller) {
  _inheritsLoose(CustomController, _Controller);
  function CustomController(object, property) {
    var _this;
    _this = _Controller.call(this, object, property) || this;
    object.constructor(_assertThisInitialized(_this));
    return _this;
  }
  return CustomController;
})(Controller);

navigator.getUserMedia =
  navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

var ImageController = (function (_Controller) {
  _inheritsLoose(ImageController, _Controller);
  function ImageController(object, property, opts) {
    var _this;
    _this = _Controller.call(this, object, property) || this;
    var defaultOptions;
    var disableVideo = false;
    if (opts.defaults) {
      disableVideo = opts.disableVideo;
      defaultOptions = opts.defaults;
    } else {
      defaultOptions = opts;
    }
    _this.__controlContainer = document.createElement("div");
    dom.addClass(_this.__controlContainer, "image-picker");
    _this.videoStreams = [];
    _this.__selectedInputContainer = _this.__controlContainer.appendChild(document.createElement("div"));
    dom.addClass(_this.__selectedInputContainer, "selected-image");
    _this.__swatches = _this.__controlContainer.appendChild(document.createElement("div"));
    dom.addClass(_this.__swatches, "image-swatches");
    _this.__img = _this.__selectedInputContainer.appendChild(document.createElement("img"));
    _this.__img.crossOrigin = "anonymous";
    _this.__video = _this.__selectedInputContainer.appendChild(document.createElement("video"));
    _this.__input = _this.__controlContainer.appendChild(document.createElement("input"));
    _this.__swatchButtons = _this.__swatches.appendChild(document.createElement("div"));
    dom.addClass(_this.__swatchButtons, "swatch-buttons");
    _this.__swatchImages = _this.__swatches.appendChild(document.createElement("div"));
    _this.__disableVideo = disableVideo;
    dom.addClass(_this.__swatchImages, "swatch-images");
    _this.__useCamera = navigator.getUserMedia && !disableVideo;
    if (_this.__useCamera) {
      _this.__camera = _this.__swatchButtons.appendChild(document.createElement("div"));
      _this.__cameraTitle = _this.__camera.appendChild(document.createElement("span"));
      _this.__cameraTitle.innerHTML = "Video";
      _this.__cameraIcon = _this.__camera.appendChild(document.createElement("div"));
      dom.addClass(_this.__cameraIcon, "camera-icon");
      dom.addClass(_this.__camera, "camera-button");
    }
    _this.__plus = _this.__swatchButtons.appendChild(document.createElement("div"));
    _this.__plusTitle = _this.__plus.appendChild(document.createElement("span"));
    _this.__plusTitle.innerHTML = "Image";
    _this.__plusIcon = _this.__plus.appendChild(document.createElement("div"));
    dom.addClass(_this.__plusIcon, "new-image-icon");
    dom.addClass(_this.__plus, "new-image-button");
    defaultOptions.forEach(function (option) {
      _this.addSwatch(option.src, option.videoSrc);
    });
    _this.__video.className = _this.__img.className = "content";
    _this.__video.crossOrigin = "anonymous";
    _this.__video.setAttribute("playsinline", true);
    _this.__input.type = "file";
    _this.__gifImg = _this.__selectedInputContainer.appendChild(document.createElement("img"));
    _this.__gifImg.crossOrigin = "anonymous";
    dom.addClass(_this.__gifImg, "content gif-img");
    _this.__glGif = new SuperGif({
      gif: _this.__gifImg,
    });
    _this.__gifNeedsInitializing = true;
    _this.initializeValue();
    if (_this.__useCamera) {
      dom.bind(_this.__camera, "click", onCameraClick.bind(_assertThisInitialized(_this)));
    }
    dom.bind(_this.__plus, "click", chooseImage.bind(_assertThisInitialized(_this)));
    dom.bind(_this.__input, "change", inputChange.bind(_assertThisInitialized(_this)));
    dom.bind(_this.__img, "dragover", onDragOver.bind(_assertThisInitialized(_this)));
    dom.bind(_this.__img, "dragleave", onDragLeave.bind(_assertThisInitialized(_this)));
    dom.bind(_this.__img, "drop", onDrop.bind(_assertThisInitialized(_this)));
    dom.bind(_this.__video, "dragover", onDragOver.bind(_assertThisInitialized(_this)));
    dom.bind(_this.__video, "dragleave", onDragLeave.bind(_assertThisInitialized(_this)));
    dom.bind(_this.__video, "drop", onDrop.bind(_assertThisInitialized(_this)));
    function chooseImage() {
      this.__input.click();
    }
    function inputChange(e) {
      var file = e.target.files[0];
      file.isSaved = false;
      this.parseFile(file);
    }
    function onDragOver(e) {
      e.preventDefault();
      e.target.classList.add("dragover");
    }
    function onDragLeave(e) {
      e.target.classList.remove("dragover");
    }
    function onDrop(e) {
      e.target.classList.remove("dragover");
      var file = e.originalEvent.dataTransfer.files[0];
      file.isSaved = false;
      this.parseFile(file);
    }
    function onCameraClick() {
      var _this2 = this;
      navigator.mediaDevices
        .getUserMedia({
          video: true,
        })
        .then(function (localMediaStream) {
          _this2.killStream();
          _this2.videoStream = localMediaStream;
          _this2.setValue({
            type: "video-stream",
            value: localMediaStream,
            domElement: _this2.__video,
          });
        })
        ["catch"](function (err) {
          _this2.killStream();
        });
    }
    _this.domElement.appendChild(_this.__controlContainer);
    return _this;
  }
  var _proto = ImageController.prototype;
  _proto.killStream = function killStream() {
    if (!this.videoStream) return;
    this.videoStream.getTracks().forEach(function (track) {
      return track.stop();
    });
  };
  _proto.destruct = function destruct() {
    this.killStream();
  };
  _proto.initializeValue = function initializeValue() {
    var asset = this.getValue();
    if (!asset) {
      return;
    }
    if (asset.type === "gif") {
      if (this.__gifNeedsInitializing) {
        this.setImage(asset.url, true);
      } else {
        this.setValue({
          url: asset.url,
          type: asset.type,
          domElement: this.__glGif.get_canvas(),
        });
      }
    } else if (asset.type === "image") {
      this.setValue({
        url: asset.url,
        type: asset.type,
        domElement: this.__img,
      });
    } else if (asset.type === "video") {
      this.setValue({
        url: asset.url,
        type: asset.type,
        domElement: this.__video,
      });
    }
  };
  _proto.updateDisplay = function updateDisplay() {
    var asset = this.getValue();
    if (!asset) {
      return;
    }
    if (asset.type === "image") {
      this.setImage(asset.url, false);
    } else if (asset.type === "gif") {
      this.setImage(asset.url, true);
    } else if (asset.type === "video") {
      this.setVideo(asset.url);
    } else if (asset.type === "video-stream") {
      this.setVideo(asset.value);
    }
  };
  _proto.parseFile = function parseFile(file) {
    var type = file.type.split("/")[0];
    if (this.__glGif) this.__glGif.pause();
    if (type === "image") {
      var _url = file.urlOverride || URL.createObjectURL(file);
      var isAnimated = file.type.split("/")[1] === "gif" || file.animatedOverride;
      if (!this.__disableVideo && isAnimated) {
        if (this.__gifNeedsInitializing) {
          this.setImage(_url, true);
        } else {
          this.setValue({
            url: _url,
            type: "gif",
            domElement: this.__glGif.get_canvas(),
          });
        }
      } else if (!isAnimated) {
        this.setValue({
          url: _url,
          type: "image",
          domElement: this.__img,
        });
        this.setImage(_url, false);
      }
    } else if (!this.__disableVideo && type === "video") {
      this.setValue({
        url: url,
        type: "video",
        domElement: this.__video,
      });
      this.setVideo();
    }
  };
  _proto.setImage = function setImage(url, isAnimated) {
    var _this3 = this;
    if (this.__skipSetImage) {
      this.__skipSetImage = false;
      return;
    }
    this.__isVideo = false;
    this.__isAnimated = isAnimated;
    if (isAnimated) {
      this.__img.src = "";
      this.__img.style.display = "none";
      this.__gifImg.src = url;
      if (this.__glGif.get_canvas()) {
        this.__glGif.get_canvas().style.display = "block";
      }
      this.__glGif.load(function (err) {
        if (!err) {
          _this3.__glGif.play()["catch"](function (e) {
            return console.log(e);
          });
          if (_this3.__gifNeedsInitializing) {
            _this3.__gifNeedsInitializing = false;
            _this3.__skipSetImage = true;
            _this3.setValue({
              url: url,
              type: "gif",
              domElement: _this3.__glGif.get_canvas(),
            });
          }
        }
      });
    } else {
      if (this.__glGif.get_canvas()) {
        this.__glGif.get_canvas().style.display = "none";
      }
      this.__img.src = url;
      this.__img.style.display = "block";
    }
    this.__video.style.display = "none";
    this.__video.src = "";
  };
  _proto.setVideo = function setVideo() {
    var asset = this.getValue();
    if (asset.type === "video-stream") {
      this.__video.srcObject = asset.value;
    } else {
      this.killStream();
      this.__video.src = asset.url;
    }
    this.__isVideo = true;
    this.__isAnimated = true;
    this.__video.loop = true;
    this.__video.volume = 0;
    this.__video.play()["catch"](function (e) {
      console.log(e, e.message, e.name);
    });
    this.__img.src = "data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAA=";
    this.__img.style.display = "none";
    if (this.__glGif.get_canvas()) {
      this.__glGif.get_canvas().style.display = "none";
    }
    this.__video.style.display = "block";
  };
  _proto.addSwatch = function addSwatch(src, videoSrc) {
    var _this4 = this;
    var swatch = this.__swatchImages.appendChild(document.createElement("img"));
    swatch.src = src;
    swatch.videoSrc = videoSrc;
    swatch.className = "swatch";
    dom.bind(swatch, "click", function () {
      if (videoSrc) {
        _this4.setValue({
          url: videoSrc,
          type: "video",
          domElement: _this4.__video,
        });
      } else {
        var isAnimated = src.split(".").pop() === "gif";
        if (isAnimated) {
          if (_this4.__gifNeedsInitializing) {
            _this4.setImage(url, true);
          } else {
            _this4.setValue({
              url: src,
              type: "gif",
              domElement: _this4.__glGif.get_canvas(),
            });
          }
        } else {
          _this4.setValue({
            url: src,
            type: "image",
            domElement: _this4.__img,
          });
        }
      }
    });
  };
  return ImageController;
})(Controller);

var ArrayController = (function (_Controller) {
  _inheritsLoose(ArrayController, _Controller);
  function ArrayController(object, property) {
    var _this2;
    _this2 = _Controller.call(this, object, property) || this;
    var _this = _assertThisInitialized(_this2);
    _this2.__div = document.createElement("div");
    _this2.__inputs = [];
    _this2.__new = document.createElement("input");
    _this2.__new.setAttribute("type", "text");
    dom.bind(_this2.__new, "keydown", function (e) {
      if (e.keyCode === 13) {
        var values = _this.getValue();
        values.push(_this.__new.value);
        _this.__new.value = "";
        _this.updateDisplay();
      }
    });
    _this2.__div.appendChild(_this2.__new);
    _this2.updateDisplay();
    _this2.domElement.appendChild(_this2.__div);
    return _this2;
  }
  var _proto = ArrayController.prototype;
  _proto.updateDisplay = function updateDisplay() {
    for (var i = 0; i < this.__inputs.length; i++) {
      if (dom.isActive(this.__inputs[i])) {
        return;
      }
    }
    var _this = this;
    this.__inputs.forEach(function (i) {
      _this.__div.removeChild(i.parentElement);
    });
    this.__inputs = [];
    this.getValue().forEach(function (v) {
      var group = document.createElement("div");
      dom.addClass(group, "array-input");
      var input = document.createElement("input");
      group.appendChild(input);
      input.setAttribute("type", "text");
      input.value = v;
      var remove = document.createElement("span");
      remove.innerHTML = "&nbsp;";
      dom.addClass(remove, "remove-icon");
      group.appendChild(remove);
      dom.bind(remove, "click", onRemove);
      dom.bind(input, "keyup", onChange);
      dom.bind(input, "change", onChange);
      dom.bind(input, "blur", onBlur);
      dom.bind(input, "keydown", function (e) {
        if (e.keyCode === 13) {
          this.blur();
        }
      });
      _this.__div.insertBefore(group, _this.__new);
      _this.__inputs.push(input);
    });
    function onRemove(e) {
      var _loop = function _loop(_i) {
        if (_this.__inputs[_i].parentElement === e.target.parentElement) {
          var values = _this.getValue().filter(function (v) {
            return v !== _this.__inputs[_i].value;
          });
          _this.setValue(values);
        }
      };
      for (var _i = 0; _i < _this.__inputs.length; _i++) {
        _loop(_i);
      }
    }
    function onChange() {
      if (_this.__changing) {
        return;
      }
      _this.__changing = true;
      var values = _this.__inputs.map(function (i) {
        return i.value;
      });
      _this.setValue(values);
      _this.__changing = false;
    }
    function onBlur() {
      if (_this.__onFinishChange) {
        _this.__onFinishChange.call(_this, _this.getValue());
      }
    }
  };
  return ArrayController;
})(Controller);

var saveDialogueContents =
  '<div id="dg-save" class="dg dialogue">\n  Here\'s the new load parameter for your <code>GUI</code>\'s constructor:\n\n  <textarea id="dg-new-constructor"></textarea>\n\n  <div id="dg-save-locally">\n    <input id="dg-local-storage" type="checkbox">\n    Automatically save values to <code>localStorage</code> on exit.\n\n    <div id="dg-local-explain">\n      The values saved to <code>localStorage</code> will override those passed to <code>dat.GUI</code>\'s constructor.\n      This makes it easier to work incrementally, but <code>localStorage</code> is fragile, and your friends may not see\n      the same values you do.\n    </div>\n  </div>\n</div>\n';

function pos2vec(pos, min, max) {
  return [pos[0] * (max[0] - min[0]) + min[0], pos[1] * (max[1] - min[1]) + min[1]];
}
function vec2pos(vec, min, max) {
  return [(vec[0] - min[0]) / (max[0] - min[0]), (vec[1] - min[1]) / (max[1] - min[1])];
}
var VectorController = (function (_Controller) {
  _inheritsLoose(VectorController, _Controller);
  function VectorController(object, property, min, max) {
    var _this2;
    if (min === void 0) {
      min = [0, 0];
    }
    if (max === void 0) {
      max = [1, 1];
    }
    _this2 =
      _Controller.call(this, object, property, {
        min: min,
        max: max,
      }) || this;
    _this2.__min = min;
    _this2.__max = max;
    _this2.__vec = _this2.getValue();
    _this2.__temp = [0, 0];
    var _this = _assertThisInitialized(_this2);
    _this2.domElement = document.createElement("div");
    dom.makeSelectable(_this2.domElement, false);
    _this2.__selector = document.createElement("div");
    _this2.__selector.className = "vector-selector";
    _this2.__pos_field = document.createElement("div");
    _this2.__pos_field.className = "saturation-field";
    _this2.__field_knob = document.createElement("div");
    _this2.__field_knob.className = "field-knob";
    dom.bind(_this2.__selector, "mousedown", function () {
      dom.addClass(this, "drag").bind(window, "mouseup", function () {
        dom.removeClass(_this.__selector, "drag");
      });
    });
    dom.bind(_this2.__selector, "touchstart", function () {
      dom.addClass(this, "drag").bind(window, "touchend", function () {
        dom.removeClass(_this.__selector, "drag");
      });
    });
    Common.extend(_this2.__selector.style, {
      width: "52px",
      height: "52px",
      padding: "3px",
      backgroundColor: "#222",
      boxShadow: "0px 1px 3px rgba(0,0,0,0.3)",
    });
    Common.extend(_this2.__field_knob.style, {
      position: "absolute",
      width: "12px",
      height: "12px",
      borderRadius: "12px",
      zIndex: 1,
    });
    Common.extend(_this2.__pos_field.style, {
      width: "50px",
      height: "50px",
      marginRight: "3px",
      display: "inline-block",
      cursor: "pointer",
    });
    dom.bind(_this2.__pos_field, "mousedown", fieldDown);
    dom.bind(_this2.__pos_field, "touchstart", fieldDown);
    dom.bind(_this2.__field_knob, "mousedown", fieldDown);
    dom.bind(_this2.__field_knob, "touchstart", fieldDown);
    function fieldDown(e) {
      setSV(e);
      dom.bind(window, "mousemove", setSV);
      dom.bind(window, "touchmove", setSV);
      dom.bind(window, "mouseup", fieldUpSV);
      dom.bind(window, "touchend", fieldUpSV);
    }
    function fieldUpSV() {
      dom.unbind(window, "mousemove", setSV);
      dom.unbind(window, "touchmove", setSV);
      dom.unbind(window, "mouseup", fieldUpSV);
      dom.unbind(window, "touchend", fieldUpSV);
      onFinish();
    }
    function onFinish() {
      if (_this.__onFinishChange) {
        _this.__onFinishChange.call(_this, _this.__vec);
      }
    }
    _this2.__selector.appendChild(_this2.__field_knob);
    _this2.__selector.appendChild(_this2.__pos_field);
    _this2.domElement.appendChild(_this2.__selector);
    _this2.updateDisplay();
    function setSV(e) {
      if (e.type.indexOf("touch") === -1) {
        e.preventDefault();
      }
      var fieldRect = _this.__pos_field.getBoundingClientRect();
      var _ref = (e.touches && e.touches[0]) || e,
        clientX = _ref.clientX,
        clientY = _ref.clientY;
      var x = (clientX - fieldRect.left) / (fieldRect.right - fieldRect.left);
      var y = 1 - (clientY - fieldRect.top) / (fieldRect.bottom - fieldRect.top);
      if (x > 1) {
        x = 1;
      } else if (x < 0) {
        x = 0;
      }
      if (y > 1) {
        y = 1;
      } else if (y < 0) {
        y = 0;
      }
      _this.__vec = pos2vec([x, y], _this.__min, _this.__max);
      _this.setValue(_this.__vec);
      return false;
    }
    return _this2;
  }
  var _proto = VectorController.prototype;
  _proto.updateDisplay = function updateDisplay() {
    this.__vec = this.getValue();
    var offset = vec2pos(this.__vec, this.__min, this.__max);
    Common.extend(this.__field_knob.style, {
      marginLeft: 50 * offset[0] - 7 + "px",
      marginTop: 50 * (1 - offset[1]) - 7 + "px",
    });
    this.__temp[0] = 1;
    this.__temp[1] = 1;
  };
  return VectorController;
})(Controller);

var TextAreaController = (function (_Controller) {
  _inheritsLoose(TextAreaController, _Controller);
  function TextAreaController(object, property) {
    var _this2;
    _this2 = _Controller.call(this, object, property) || this;
    var _this = _assertThisInitialized(_this2);
    _this2.__input = document.createElement("textarea");
    dom.bind(_this2.__input, "keyup", onChange);
    dom.bind(_this2.__input, "change", onChange);
    dom.bind(_this2.__input, "blur", onBlur);
    function onChange() {
      _this.setValue(_this.__input.value);
    }
    function onBlur() {
      if (_this.__onFinishChange) {
        _this.__onFinishChange.call(_this, _this.getValue());
      }
    }
    _this2.updateDisplay();
    _this2.domElement.appendChild(_this2.__input);
    return _this2;
  }
  var _proto = TextAreaController.prototype;
  _proto.updateDisplay = function updateDisplay() {
    if (dom.isActive(this.__input)) {
      return this;
    }
    this.__input.value = this.getValue();
    return _Controller.prototype.updateDisplay.call(this);
  };
  return TextAreaController;
})(Controller);

var OptionController$1 = (function (_Controller) {
  _inheritsLoose(OptionController, _Controller);
  function OptionController(object, property, params, options) {
    var _this2;
    _this2 = _Controller.call(this, object, property, "option", options) || this;
    var _this = _assertThisInitialized(_this2);
    _this2.CUSTOM_FLAG = "";
    params = params || {};
    _this2.__select = document.createElement("select");
    if (common.isArray(params)) {
      var map = {};
      common.each(params, function (element) {
        map[element] = element;
      });
      params = map;
    }
    common.each(params, function (value, key) {
      var opt = document.createElement("option");
      opt.innerHTML = value;
      opt.setAttribute("value", key);
      _this.__select.appendChild(opt);
    });
    if (params.custom) {
      var opt = document.createElement("option");
      opt.innerHTML = params.custom.display || "Custom";
      opt.setAttribute("value", _this.CUSTOM_FLAG);
      _this.__select.appendChild(opt);
      _this2.__custom_controller = params.custom.controller;
    }
    _this2.updateDisplay();
    dom.bind(_this2.__select, "change", function () {
      var value = this.options[this.selectedIndex].value;
      if (value === _this.CUSTOM_FLAG) {
        value = _this.__custom_controller.getValue();
      }
      _this.setValue(value);
    });
    if (_this2.__custom_controller) {
      _this2.__custom_controller.onChange(function () {
        var value = this.getValue();
        _this.setValue(value);
      });
    }
    _this2.domElement.appendChild(_this2.__select);
    if (_this2.__custom_controller) {
      _this2.domElement.appendChild(_this2.__custom_controller.el);
    }
    return _this2;
  }
  var _proto = OptionController.prototype;
  _proto.setValue = function setValue(v) {
    var toReturn = _Controller.prototype.setValue.call(this, v);
    return toReturn;
  };
  _proto.updateDisplay = function updateDisplay() {
    var value = this.getValue();
    var custom = true;
    if (value !== this.CUSTOM_FLAG) {
      common.each(this.__select.options, function (option) {
        if (value === option.value) {
          custom = false;
        }
      });
    }
    this.__select.value = custom ? this.CUSTOM_FLAG : value;
    if (this.__custom_controller) {
      this.__custom_controller.el.style.display = custom ? "block" : "none";
    }
    return _Controller.prototype.updateDisplay.call(this);
  };
  return OptionController;
})(Controller);

var NullController = (function (_Controller) {
  _inheritsLoose(NullController, _Controller);
  function NullController(object, property, options) {
    var _this2;
    _this2 = _Controller.call(this, object, property, "null", options) || this;
    var _this = _assertThisInitialized(_this2);
    _this2.__prev = _this2.getValue();
    _this2.__elem = document.createElement("em");
    _this2.domElement.appendChild(_this2.__elem);
    _this2.updateDisplay();
    return _this2;
  }
  var _proto = NullController.prototype;
  _proto.updateDisplay = function updateDisplay() {
    this.__elem.innerText = "<null>";
    return _Controller.prototype.updateDisplay.call(this);
  };
  return NullController;
})(Controller);

var UndefinedController = (function (_Controller) {
  _inheritsLoose(UndefinedController, _Controller);
  function UndefinedController(object, property, options) {
    var _this2;
    _this2 = _Controller.call(this, object, property, "undefined", options) || this;
    var _this = _assertThisInitialized(_this2);
    _this2.__prev = _this2.getValue();
    _this2.__elem = document.createElement("em");
    _this2.domElement.appendChild(_this2.__elem);
    _this2.updateDisplay();
    return _this2;
  }
  var _proto = UndefinedController.prototype;
  _proto.updateDisplay = function updateDisplay() {
    this.__elem.innerText = "<undefined>";
    return _Controller.prototype.updateDisplay.call(this);
  };
  return UndefinedController;
})(Controller);

var ARR_SLICE$1 = Array.prototype.slice;
var controllerFactory = function controllerFactory(object, property) {
  for (var _len = arguments.length, optionalArgs = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    optionalArgs[_key - 2] = arguments[_key];
  }
  var initialValue = object[property];
  var optlist = optionalArgs[0];
  if (optlist != null && (Common.isArray(optlist) || Common.isObject(optlist))) {
    return new OptionController(object, property, optlist);
  }
  if (Common.isNumber(initialValue)) {
    var min = optionalArgs[0],
      max = optionalArgs[1],
      step = optionalArgs[2],
      enumeration = optionalArgs[3];
    if (Common.isNumber(min) && Common.isNumber(max)) {
      return new NumberControllerSlider(object, property, min, max, step, enumeration);
    }
    return new NumberControllerBox(object, property, {
      min: min,
      max: max,
      step: step,
    });
  }
  if (
    (Common.isArray(initialValue) && initialValue.length >= 3 && initialValue.length <= 4) ||
    (Common.isObject(initialValue) && initialValue.h && initialValue.s && initialValue.v) ||
    (Common.isString(initialValue) &&
      initialValue[0] === "#" &&
      (initialValue.length === 4 || initialValue.length === 7))
  ) {
    return new ColorController(object, property);
  }
  if (Common.isArray(initialValue) && initialValue.length === 2) {
    if (arguments.length > 3) {
      return new VectorController(object, property, arguments[2], arguments[3]);
    }
    return new VectorController(object, property);
  }
  if (Common.isString(initialValue)) {
    return new StringController(object, property);
  }
  if (Common.isFunction(initialValue) && arguments[2] !== undefined) {
    return new TabbedController(object, property, "", arguments[2] || 0, arguments[3] || "Object");
  }
  if (Common.isFunction(initialValue)) {
    var arg1 = optionalArgs[0];
    var opts = ARR_SLICE$1.call(optionalArgs, 1);
    if (opts.length === 0) {
      opts = undefined;
    }
    return new FunctionController(object, property, arg1, opts);
  }
  if (Common.isBoolean(initialValue)) {
    return new BooleanController(object, property);
  }
  if (Common.isArray(initialValue)) {
    return new ArrayController(object, property);
  }
  if (Common.isObject(initialValue)) {
    return new OptionController$1(object, property);
  }
  if (initialValue === null) {
    return new NullController(object, property);
  }
  if (initialValue === undefined && property in object) {
    return new UndefinedController(object, property);
  }
  return null;
};

var NumberControllerAnimator = (function (_NumberController) {
  _inheritsLoose(NumberControllerAnimator, _NumberController);
  function NumberControllerAnimator(object, property, params) {
    var _this2;
    _this2 = _NumberController.call(this, object, property, params) || this;
    var _this = _assertThisInitialized(_this2);
    dom.addClass(_this2.domElement, "button-container");
    _this2.__animationMode = null;
    _this2.__sineButton = document.createElement("button");
    dom.addClass(_this2.__sineButton, "sine-button");
    _this2.__sawButton = document.createElement("button");
    dom.addClass(_this2.__sawButton, "saw-button");
    dom.bind(_this2.__sawButton, "click", toggleSaw);
    dom.bind(_this2.__sineButton, "click", toggleSine);
    function toggleSaw(e) {
      e.stopPropagation();
      e.preventDefault();
      if (_this.__animationMode === "saw") {
        stopAnimating();
        dom.removeClass(_this.__sawButton, "saw-button--activated");
      } else {
        if (_this.__animationMode === "sine") {
          dom.removeClass(_this.__sineButton, "sine-button--activated");
        }
        _this.__animationMode = "saw";
        dom.addClass(_this.__sawButton, "saw-button--activated");
        animate();
      }
    }
    function toggleSine(e) {
      e.stopPropagation();
      e.preventDefault();
      if (_this.__animationMode === "sine") {
        stopAnimating();
        dom.removeClass(_this.__sineButton, "sine-button--activated");
      } else {
        if (_this.__animationMode === "saw") {
          dom.removeClass(_this.__sawButton, "saw-button--activated");
        }
        _this.__animationMode = "sine";
        dom.addClass(_this.__sineButton, "sine-button--activated");
        animate();
      }
    }
    function animate() {
      if (_this.__animationMode === null) return;
      var percent;
      if (_this.__animationMode === "sine") {
        percent = Math.sin(Date.now() / 1000) / 2 + 0.5;
      } else if (_this.__animationMode === "saw") {
        percent = (Date.now() / 2000) % 1;
      }
      if (_this.__min !== undefined && _this.__max !== undefined) {
        _this.setValue((_this.__max - _this.__min) * percent + _this.__min);
      } else {
        _this.setValue(percent);
      }
      requestAnimationFrame(animate);
    }
    function stopAnimating() {
      _this.__animationMode = null;
    }
    _this2.updateDisplay();
    _this2.domElement.appendChild(_this2.__sawButton);
    _this2.domElement.appendChild(_this2.__sineButton);
    return _this2;
  }
  return NumberControllerAnimator;
})(NumberController);

function clipFunc(min, max) {
  return function (v) {
    if (v < min) {
      return min;
    }
    if (v > max) {
      return max;
    }
    return v;
  };
}
var clip01 = clipFunc(0.0, 1.0);
function cubicFunc(a, b, c, d) {
  return function (t) {
    var t2 = t * t;
    var t3 = t2 * t;
    var mt = 1 - t;
    var mt2 = mt * mt;
    var mt3 = mt * mt2;
    return a * mt3 + 3 * b * mt2 * t + 3 * c * mt * t2 + d * t3;
  };
}
function cubicFuncDeriv(a, b, c, d) {
  return function (t) {
    var t2 = t * t;
    var mt = 1 - t;
    var mt2 = mt * mt;
    return a * mt2 + 2 * b * mt * t + c * t2;
  };
}
function sign(n) {
  return n >= 0.0 ? 1 : -1;
}
var EPSILON = 0.0001;
var EasingFunctionPoint = function EasingFunctionPoint(coord) {
  var _this = this;
  if (Array.isArray(coord) && coord.length == 4) {
    ["x", "y", "l", "r"].forEach(function (d, i) {
      _this[d] = coord[i];
    });
  } else if (typeof coord === "object") {
    ["x", "y", "l", "r"].forEach(function (d) {
      _this[d] = coord[d];
    });
  } else {
    throw new Error("Couldn't parse point arguments");
  }
};
var EasingFunction = function EasingFunction(_points) {
  var rawPoints = _points || [
    {
      x: 0,
      y: 0,
      l: 0,
      r: 0.5,
    },
    {
      x: 1,
      y: 1,
      l: 0.5,
      r: 0,
    },
  ];
  var points = [];
  rawPoints.forEach(function (p) {
    points.push(new EasingFunctionPoint(p));
  });
  this.points = points;
};
EasingFunction.Point = EasingFunctionPoint;
EasingFunction.prototype = {
  toString: function toString() {
    return "something";
  },
  movePoint: function movePoint(index, type, x, y) {
    var p = this.points[index];
    if (type == "LEFT") {
      p.l = x - p.x;
    } else if (type == "RIGHT") {
      p.r = x - p.x;
    } else {
      p.x = x;
      p.y = y;
    }
    this.constrainPoints();
  },
  constrainPoints: function constrainPoints() {
    var pl;
    var p;
    var pr;
    var _this = this;
    var last = function last(i) {
      return i == _this.points.length - 1;
    };
    for (var i = 0; i < this.points.length; i++) {
      p = this.points[i];
      pl = i > 0 ? this.points[i - 1] : undefined;
      pr = !last(i) ? this.points[i + 1] : undefined;
      p.x = clip01(p.x);
      p.y = clip01(p.y);
      if (i == 0) {
        p.x = 0.0;
      }
      if (last(i)) {
        p.x = 1.0;
      }
      if (pr !== undefined && p.x > pr.x) {
        p.x = pr.x;
      }
      if (pl !== undefined) {
        p.l = clipFunc(pl.x - p.x, 0)(p.l);
      } else {
        p.l = 0;
      }
      if (pr !== undefined) {
        p.r = clipFunc(0, pr.x - p.x)(p.r);
      } else {
        p.r = 0;
      }
    }
  },
  findPoint: function findPoint(x, y, r) {
    r = r || 0.035;
    var dx;
    var dy;
    var h;
    var minD = Infinity;
    var minIndex;
    this.points.forEach(function (p, i) {
      dx = x - p.x;
      dy = y - p.y;
      h = dx * dx + dy * dy;
      if (h < r * r && minD > h) {
        minD = h;
        minIndex = i;
      }
    });
    return {
      index: minIndex,
      type: Number.isInteger(minIndex) ? "ANCHOR" : undefined,
    };
  },
  findPointWithHandle: function findPointWithHandle(x, y, r) {
    r = r || 0.035;
    var dx;
    var dy;
    var h;
    var minD = Infinity;
    var minIndex;
    var minType;
    var candidates;
    var d;
    var type;
    var _this = this;
    this.points.forEach(function (p, i) {
      if (i == 0) {
        candidates = [
          [p.r, "RIGHT"],
          [0.0, "ANCHOR"],
        ];
      } else if (i == _this.points.length - 1) {
        candidates = [
          [p.l, "LEFT"],
          [0.0, "ANCHOR"],
        ];
      } else {
        candidates = [
          [p.r, "RIGHT"],
          [p.l, "LEFT"],
          [0.0, "ANCHOR"],
        ];
      }
      candidates.forEach(function (cand) {
        d = cand[0];
        type = cand[1];
        dx = x - p.x - d;
        dy = y - p.y;
        h = dx * dx + dy * dy;
        if (h < r * r && minD > h) {
          minD = h;
          minIndex = i;
          minType = type;
        }
      });
    });
    return {
      index: minIndex,
      type: minType,
    };
  },
  addPoint: function addPoint(x, y) {
    for (var i = 1; i < this.points.length - 1; i++) {
      if (x <= this.points[i].x) {
        break;
      }
    }
    var point = new EasingFunctionPoint({
      x: x,
      y: y,
      l: 0.0,
      r: 0.0,
    });
    this.points.splice(i, 0, point);
    this.constrainPoints();
    return point;
  },
  deletePoint: function deletePoint(i) {
    if (i == 0 || i == this.points.length - 1) {
      return false;
    }
    this.points.splice(i, 1);
    return true;
  },
  getSegments: function getSegments() {
    var segments = [];
    var p1;
    var p2;
    for (var i = 0; i < this.points.length - 1; i++) {
      p1 = this.points[i];
      p2 = this.points[i + 1];
      segments.push([p1.x, p1.y, p1.x + p1.r, p1.y, p2.x + p2.l, p2.y, p2.x, p2.y]);
    }
    return segments;
  },
  getSegmentByX: function getSegmentByX(x) {
    var p1;
    var p2;
    for (var i = 1; i < this.points.length - 1; i++) {
      if (x <= this.points[i].x) {
        break;
      }
    }
    p1 = this.points[i - 1];
    p2 = this.points[i];
    return [p1.x, p1.y, p1.x + p1.r, p1.y, p2.x + p2.l, p2.y, p2.x, p2.y];
  },
  calculateY: function calculateY(x) {
    x = clip01(x);
    if (x < EPSILON) {
      x = EPSILON;
    }
    var segment = this.getSegmentByX(x);
    var funcX = cubicFunc(segment[0], segment[2], segment[4], segment[6]);
    var funcY = cubicFunc(segment[1], segment[3], segment[5], segment[7]);
    var derivX = cubicFuncDeriv(segment[0], segment[2], segment[4], segment[6]);
    var t = 0.5;
    var dt;
    var slope;
    for (var i = 0; i < 20; i++) {
      dt = funcX(t) - x;
      if (Math.abs(dt) < EPSILON) {
        return funcY(clip01(t));
      }
      slope = derivX(t);
      t -= dt / slope;
    }
    var funcXd = function funcXd(t) {
      return funcX(t) - x;
    };
    var t1 = 0.0;
    var t2 = 1.0;
    var st1 = sign(funcXd(t1));
    var st2 = sign(funcXd(t2));
    var st;
    var diff;
    for (var i = 0; i < 30; i++) {
      t = (t1 + t2) / 2;
      diff = funcXd(t);
      if (Math.abs(diff) < EPSILON) {
        return funcY(t);
      }
      st = sign(diff);
      if (st == st1) {
        t1 = t;
      } else if (st == st2) {
        t2 = t;
      }
    }
    return funcY(t);
  },
};

var EasingFunctionController = (function (_Controller) {
  _inheritsLoose(EasingFunctionController, _Controller);
  function EasingFunctionController(object, property) {
    var _this2;
    _this2 = _Controller.call(this, object, property) || this;
    var _this = _assertThisInitialized(_this2);
    _this2.domElement = document.createElement("div");
    dom.makeSelectable(_this2.domElement, false);
    _this2.__func = new EasingFunction(object[property]);
    _this2.__cursor = 0.0;
    _this2.__mouse_over = false;
    _this2.__point_over = null;
    _this2.__point_selected = null;
    _this2.__point_selected_type = null;
    _this2.__point_moving = false;
    var width = 146;
    var height = 80;
    var rectView = {
      top: 1,
      left: 3,
      width: width - 2,
      height: height - 16,
    };
    var rV = rectView;
    _this2.__thumbnail = document.createElement("canvas");
    _this2.__thumbnail.width = width * 2;
    _this2.__thumbnail.height = height * 2;
    _this2.__thumbnail.className = "easing-thumbnail";
    _this2.__ctx = _this2.__thumbnail.getContext("2d");
    _this2.__ctx.scale(2, 2);
    dom.bind(_this2.__thumbnail, "contextmenu", function (e) {
      e.preventDefault();
    });
    dom.bind(_this2.__thumbnail, "mouseover", onMouseOver);
    dom.bind(_this2.__thumbnail, "mouseout", onMouseOut);
    dom.bind(_this2.__thumbnail, "mousedown", onMouseDown);
    dom.bind(_this2.__thumbnail, "dblclick", onDoubleClick);
    dom.bind(_this2.__thumbnail, "mousemove", onMouseMove);
    dom.bind(_this2.__thumbnail, "mouseup", onMouseUp);
    dom.bind(_this2.__thumbnail, "mouseup", onMouseUp);
    function toNorm(elem, e) {
      var mouseX = e.pageX - elem.offsetLeft;
      var mouseY = e.pageY - elem.offsetTop;
      return [0 + (mouseX - rV.left + 1) / (rV.width - 2), 1 - (mouseY - rV.top - 2) / rV.height];
    }
    function onMouseDown(e) {
      e.preventDefault();
      var coord = toNorm(this, e);
      var point;
      var index;
      var type;
      if (Number.isInteger(_this.__point_selected)) {
        point = _this.__func.findPointWithHandle(coord[0], coord[1]);
      } else {
        point = _this.__func.findPoint(coord[0], coord[1]);
      }
      index = point.index;
      type = point.type;
      if (index !== undefined) {
        if (e.button == 2 && type == "ANCHOR") {
          var delete_successful = _this.__func.deletePoint(index);
          if (delete_successful) {
            index = undefined;
          }
        }
      }
      if (index !== undefined) {
        if (_this.__point_selected == index) {
          _this.__point_selected_type = type;
        } else {
          _this.__point_selected = index;
          _this.__point_selected_type = "ANCHOR";
        }
        _this.__point_moving = true;
      } else {
        _this.__point_selected = null;
        _this.__point_selected_type = null;
        _this.__point_moving = false;
      }
      _this.updateDisplay();
    }
    function onDoubleClick(e) {
      e.preventDefault();
      var coord = toNorm(this, e);
      var point = _this.__func.addPoint(coord[0], coord[1]);
      _this.__point_selected = point.index;
      _this.__point_selected_type = point.type;
      _this.__point_moving = true;
      _this.updateDisplay();
    }
    function onMouseOver(e) {
      _this.__mouse_over = true;
      _this.updateDisplay();
    }
    function onMouseOut(e) {
      _this.__mouse_over = false;
      _this.__point_moving = false;
      _this.updateDisplay();
    }
    function onMouseMove(e) {
      e.preventDefault();
      var coord = toNorm(this, e);
      if (Number.isInteger(_this.__point_selected) && _this.__point_moving) {
        _this.__func.movePoint(_this.__point_selected, _this.__point_selected_type, coord[0], coord[1]);
      } else {
        var _this$__func$findPoin = _this.__func.findPoint(coord[0], coord[1]),
          index = _this$__func$findPoin.index;
        if (index !== undefined) {
          _this.__point_over = index;
        } else {
          _this.__point_over = null;
        }
      }
      _this.updateDisplay();
    }
    function onMouseUp(e) {
      e.preventDefault();
      _this.__point_moving = false;
      _this.updateDisplay();
    }
    common.extend(_this2.__thumbnail.style, {
      width: width + "px",
      height: height + "px",
      cursor: "crosshair",
    });
    _this2.updateDisplay();
    _this2.domElement.appendChild(_this2.__thumbnail);
    return _this2;
  }
  var _proto = EasingFunctionController.prototype;
  _proto.clear = function clear() {
    _this.__ctx.clearRect(0, 0, width, height);
  };
  _proto.drawRuler = function drawRuler() {
    var ctx = _this.__ctx;
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#930";
    beginPath();
    moveTo(0, 0);
    lineTo(1, 0);
    moveTo(0, 1);
    lineTo(1, 1);
    stroke();
    for (var i = 0; i <= 4; i++) {
      var x = i / 4.01;
      ctx.strokeStyle = "#c97";
      beginPath();
      moveTo(x, 0);
      lineTo(x, -0.04);
      stroke();
      ctx.strokeStyle = "#333";
      beginPath();
      moveTo(x, 0.01);
      lineTo(x, 0.99);
      stroke();
    }
    ctx.font = "10px";
    ctx.fillStyle = "#977";
    p = toCoord(0, -0.17);
    ctx.fillText("0.0", p[0], p[1]);
    p = toCoord(0.25, -0.17);
    ctx.fillText(".25", p[0] - 8, p[1]);
    p = toCoord(0.5, -0.17);
    ctx.fillText(".50", p[0] - 8, p[1]);
    p = toCoord(0.75, -0.17);
    ctx.fillText(".75", p[0] - 8, p[1]);
    p = toCoord(1, -0.17);
    ctx.fillText("1.0", p[0] - 14, p[1]);
  };
  _proto.drawEasingFunction = function drawEasingFunction(easing_func) {
    var ctx = _this.__ctx;
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 1;
    beginPath();
    easing_func.getSegments().forEach(function (s, i) {
      moveTo.apply(null, s.slice(0, 2));
      curveTo.apply(null, s.slice(2));
    });
    stroke();
    if (!_this.__mouse_over) {
      return;
    }
    ctx.fillStyle = "#fff";
    ctx.strokeStyle = "#f90";
    ctx.lineWidth = 2;
    easing_func.points.forEach(function (p, i) {
      if (_this.__mouseo_over && i === _this.__point_over) {
        return;
      }
      if (i === _this.__point_selected) {
        return;
      }
      beginPath();
      circle(p.x, p.y, 3);
      closePath();
      fill();
      stroke();
    });
    var p;
    if (Number.isInteger(_this.__point_over)) {
      p = easing_func.points[_this.__point_over];
      ctx.strokeStyle = "#f3d";
      beginPath();
      circle(p.x, p.y, 3);
      closePath();
      fill();
      stroke();
    }
    if (Number.isInteger(_this.__point_selected)) {
      p = easing_func.points[_this.__point_selected];
      ctx.strokeStyle = "#f3d";
      ctx.fillStyle = "#fff";
      beginPath();
      moveTo(p.x + p.l + 0.01, p.y);
      lineTo(p.x + p.r - 0.01, p.y);
      stroke();
      ["l", "r"].forEach(function (dir) {
        beginPath();
        circle(p.x + p[dir], p.y, 2);
        fill();
        stroke();
      });
      beginPath();
      square(p.x, p.y, 3);
      fill();
      stroke();
    }
  };
  _proto.setCursor = function setCursor(x) {
    var y = _this.__func.calculateY(x);
    _this.__ctx.fillStyle = "#ff0";
    _this.__ctx.strokeStyle = "#ff0";
    _this.__ctx.lineWidth = 1;
    beginPath();
    circle(x, y, 3);
    closePath();
    fill();
    beginPath();
    moveTo(x, 0);
    lineTo(x, 1);
    closePath();
    stroke();
    return y;
  };
  _proto.setValue = function setValue(v) {
    var toReturn = _Controller.prototype.setValue.call(this, v);
    if (this.__onFinishChange) {
      this.__onFinishChange.call(this, this.getValue());
    }
    return toReturn;
  };
  _proto.updateDisplay = function updateDisplay() {
    this.clear();
    this.drawRuler();
    this.drawEasingFunction(this.__func);
  };
  return EasingFunctionController;
})(Controller);

var GradientController = (function (_Controller) {
  _inheritsLoose(GradientController, _Controller);
  function GradientController(object, property, params) {
    var _this2;
    _this2 = _Controller.call(this, object, property) || this;
    var _this = _assertThisInitialized(_this2);
    _this2.domElement = document.createElement("div");
    dom.makeSelectable(_this2.domElement, false);
    _this2.__selector = document.createElement("div");
    _this2.__selector.className = "selector";
    _this2.__saturation_field = document.createElement("div");
    _this2.__saturation_field.className = "saturation-field";
    _this2.__input = document.createElement("input");
    _this2.__input.type = "text";
    _this2.__input_textShadow = "1px 1px 2px";
    dom.bind(_this2.__input, "keydown", function (e) {
      if (e.keyCode === 13) {
        onBlur.call(this);
      }
    });
    dom.bind(_this2.__input, "blur", onBlur);
    function onBlur() {
      var value = JSON.parse(this.value);
      _this.setValue(value);
    }
    dom.bind(_this2.__selector, "mousedown", function () {
      dom.addClass(this, "drag").bind(window, "mouseup", function () {
        dom.removeClass(_this.__selector, "drag");
      });
    });
    var valueField = document.createElement("div");
    Common.extend(_this2.__selector.style, {
      width: "150px",
      padding: "0px",
      lineHeight: "18px",
      backgroundColor: "#222",
      boxShadow: "0px 1px 3px rgba(0,0,0,0.3)",
    });
    for (var i = 0; i < params.length; i++) {
      var item = document.createElement("canvas");
      item.value = params[i];
      item.width = 150;
      item.height = 18;
      var context = item.getContext("2d");
      var grd = context.createLinearGradient(0, 0, 150, 0);
      for (var key in params[i]) {
        grd.addColorStop(key, params[i][key]);
      }
      dom.bind(item, "click", function () {
        _this.setValue(this.value);
        _this.updateDisplay();
        onFinish();
      });
      context.fillStyle = grd;
      context.fillRect(0, 0, item.width, item.height);
      Common.extend(item.style, {
        width: "150px",
      });
      _this2.__saturation_field.appendChild(item);
    }
    _this2.__selector.appendChild(_this2.__saturation_field);
    _this2.domElement.appendChild(_this2.__input);
    _this2.domElement.appendChild(_this2.__selector);
    function onFinish() {
      if (_this.__onFinishChange) {
        _this.__onFinishChange.call(_this, _this.getValue());
      }
    }
    _this2.updateDisplay();
    return _this2;
  }
  var _proto = GradientController.prototype;
  _proto.updateDisplay = function updateDisplay() {
    var value = this.getValue();
    var arr = [];
    for (var key in value) {
      arr.push({
        percent: key,
        color: value[key],
      });
    }
    arr.sort(function (a, b) {
      return a.percent - b.percent;
    });
    this.__input.value = JSON.stringify(value);
    var backgroundColor = "-webkit-linear-gradient(left";
    for (var i = 0; i < arr.length; i++) {
      backgroundColor += ", " + arr[i].color + " " + arr[i].percent * 100 + "%";
    }
    backgroundColor += ")";
    Common.extend(this.__input.style, {
      background: backgroundColor,
      color: "#fff",
      textShadow: this.__input_textShadow + " #000",
    });
  };
  return GradientController;
})(Controller);

function requestAnimationFrame$1(callback, element) {
  setTimeout(callback, 1000 / 60);
}
var requestAnimationFrame$2 =
  window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.oRequestAnimationFrame ||
  window.msRequestAnimationFrame ||
  requestAnimationFrame$1;

var CenteredDiv = (function () {
  function CenteredDiv() {
    this.backgroundElement = document.createElement("div");
    Common.extend(this.backgroundElement.style, {
      backgroundColor: "rgba(0,0,0,0.8)",
      top: 0,
      left: 0,
      display: "none",
      zIndex: "1000",
      opacity: 0,
      WebkitTransition: "opacity 0.2s linear",
      transition: "opacity 0.2s linear",
    });
    dom.makeFullscreen(this.backgroundElement);
    this.backgroundElement.style.position = "fixed";
    this.domElement = document.createElement("div");
    Common.extend(this.domElement.style, {
      position: "fixed",
      display: "none",
      zIndex: "1001",
      opacity: 0,
      WebkitTransition: "-webkit-transform 0.2s ease-out, opacity 0.2s linear",
      transition: "transform 0.2s ease-out, opacity 0.2s linear",
    });
    document.body.appendChild(this.backgroundElement);
    document.body.appendChild(this.domElement);
    var _this = this;
    dom.bind(this.backgroundElement, "click", function () {
      _this.hide();
    });
  }
  var _proto = CenteredDiv.prototype;
  _proto.show = function show() {
    var _this = this;
    this.backgroundElement.style.display = "block";
    this.domElement.style.display = "block";
    this.domElement.style.opacity = 0;
    this.domElement.style.webkitTransform = "scale(1.1)";
    this.layout();
    Common.defer(function () {
      _this.backgroundElement.style.opacity = 1;
      _this.domElement.style.opacity = 1;
      _this.domElement.style.webkitTransform = "scale(1)";
    });
  };
  _proto.hide = function hide() {
    var _this = this;
    var hide = function hide() {
      _this.domElement.style.display = "none";
      _this.backgroundElement.style.display = "none";
      dom.unbind(_this.domElement, "webkitTransitionEnd", hide);
      dom.unbind(_this.domElement, "transitionend", hide);
      dom.unbind(_this.domElement, "oTransitionEnd", hide);
    };
    dom.bind(this.domElement, "webkitTransitionEnd", hide);
    dom.bind(this.domElement, "transitionend", hide);
    dom.bind(this.domElement, "oTransitionEnd", hide);
    this.backgroundElement.style.opacity = 0;
    this.domElement.style.opacity = 0;
    this.domElement.style.webkitTransform = "scale(1.1)";
  };
  _proto.layout = function layout() {
    this.domElement.style.left = window.innerWidth / 2 - dom.getWidth(this.domElement) / 2 + "px";
    this.domElement.style.top = window.innerHeight / 2 - dom.getHeight(this.domElement) / 2 + "px";
  };
  return CenteredDiv;
})();

function autocomplete(settings) {
  var doc = document;
  var container = doc.createElement("div");
  var containerStyle = container.style;
  var userAgent = navigator.userAgent;
  var mobileFirefox = userAgent.indexOf("Firefox") !== -1 && userAgent.indexOf("Mobile") !== -1;
  var debounceWaitMs = settings.debounceWaitMs || 0;
  var keyUpEventName = mobileFirefox ? "input" : "keyup";
  var items = [];
  var inputValue = "";
  var minLen = settings.minLength;
  var selected;
  var keypressCounter = 0;
  var debounceTimer;
  if (!settings.input) {
    throw new Error("input undefined");
  }
  var input = settings.input;
  container.className = "autocomplete " + (settings.className || "");
  containerStyle.position = "fixed";
  function detach() {
    var parent = container.parentNode;
    if (parent) {
      parent.removeChild(container);
    }
  }
  function clearDebounceTimer() {
    if (debounceTimer) {
      window.clearTimeout(debounceTimer);
    }
  }
  function attach() {
    if (!container.parentNode) {
      doc.body.appendChild(container);
    }
  }
  function containerDisplayed() {
    return !!container.parentNode;
  }
  function clear() {
    keypressCounter++;
    items = [];
    inputValue = "";
    selected = undefined;
    detach();
  }
  function updatePosition() {
    if (!containerDisplayed()) {
      return;
    }
    containerStyle.height = "auto";
    containerStyle.width = input.offsetWidth + "px";
    var inputRect = input.getBoundingClientRect();
    var top = inputRect.top + input.offsetHeight;
    var maxHeight = window.innerHeight - top;
    if (maxHeight < 0) {
      maxHeight = 0;
    }
    containerStyle.top = top + "px";
    containerStyle.bottom = "";
    containerStyle.left = inputRect.left + "px";
    containerStyle.maxHeight = maxHeight + "px";
    if (settings.customize) {
      settings.customize(input, inputRect, container, maxHeight);
    }
  }
  function update() {
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    var render = function render(item, currentValue) {
      var itemElement = doc.createElement("div");
      itemElement.textContent = item.label || "";
      return itemElement;
    };
    if (settings.render) {
      render = settings.render;
    }
    var renderGroup = function renderGroup(groupName, currentValue) {
      var groupDiv = doc.createElement("div");
      groupDiv.textContent = groupName;
      return groupDiv;
    };
    if (settings.renderGroup) {
      renderGroup = settings.renderGroup;
    }
    var fragment = doc.createDocumentFragment();
    var prevGroup = "#9?$";
    items.forEach(function (item) {
      if (item.group && item.group !== prevGroup) {
        prevGroup = item.group;
        var groupDiv = renderGroup(item.group, inputValue);
        if (groupDiv) {
          groupDiv.className += " group";
          fragment.appendChild(groupDiv);
        }
      }
      var div = render(item, inputValue);
      if (div) {
        div.addEventListener("click", function (ev) {
          settings.onSelect(item, input);
          clear();
          ev.preventDefault();
          ev.stopPropagation();
        });
        if (item === selected) {
          div.className += " selected";
          if (typeof settings.onPick === "function") {
            settings.onPick(item);
          }
        }
        fragment.appendChild(div);
      }
    });
    container.appendChild(fragment);
    if (items.length < 1) {
      if (settings.emptyMsg) {
        var empty = doc.createElement("div");
        empty.className = "empty";
        empty.textContent = settings.emptyMsg;
        container.appendChild(empty);
      } else {
        clear();
        return;
      }
    }
    attach();
    updatePosition();
    updateScroll();
  }
  function updateIfDisplayed() {
    if (containerDisplayed()) {
      update();
    }
  }
  function resizeEventHandler() {
    updateIfDisplayed();
  }
  function scrollEventHandler(e) {
    if (e.target !== container) {
      updateIfDisplayed();
    } else {
      e.preventDefault();
    }
  }
  function keyup(ev) {
    var keyCode = ev.which || ev.keyCode || 0;
    var ignore = [38, 13, 27, 39, 37, 16, 17, 18, 20, 91, 9];
    for (var _i = 0, ignore_1 = ignore; _i < ignore_1.length; _i++) {
      var key = ignore_1[_i];
      if (keyCode === key) {
        return;
      }
    }
    if (keyCode === 40 && containerDisplayed()) {
      return;
    }
    var savedKeypressCounter = ++keypressCounter;
    var val = input.value;
    if (val.length >= minLen) {
      clearDebounceTimer();
      debounceTimer = window.setTimeout(function () {
        settings.fetch(val, function (elements) {
          if (keypressCounter === savedKeypressCounter && elements) {
            items = elements;
            inputValue = val;
            selected = items.length > 0 ? items[0] : undefined;
            update();
          }
        });
      }, debounceWaitMs);
    } else {
      clear();
    }
  }
  function focus(ev) {
    var val = input.value;
    if (val.length === 0) {
      settings.fetch(val, function (elements) {
        items = elements;
        inputValue = val;
        selected = items.length > 0 ? items[0] : undefined;
        update();
      });
    }
  }
  function updateScroll() {
    var elements = container.getElementsByClassName("selected");
    if (elements.length > 0) {
      var element = elements[0];
      var previous = element.previousElementSibling;
      if (previous && previous.className.indexOf("group") !== -1 && !previous.previousElementSibling) {
        element = previous;
      }
      if (element.offsetTop < container.scrollTop) {
        container.scrollTop = element.offsetTop;
      } else {
        var selectBottom = element.offsetTop + element.offsetHeight;
        var containerBottom = container.scrollTop + container.offsetHeight;
        if (selectBottom > containerBottom) {
          container.scrollTop += selectBottom - containerBottom;
        }
      }
    }
  }
  function selectPrev() {
    if (items.length < 1) {
      selected = undefined;
    } else {
      if (selected === items[0]) {
        selected = items[items.length - 1];
      } else {
        for (var i = items.length - 1; i > 0; i--) {
          if (selected === items[i] || i === 1) {
            selected = items[i - 1];
            break;
          }
        }
      }
    }
  }
  function selectNext() {
    if (items.length < 1) {
      selected = undefined;
    }
    if (!selected || selected === items[items.length - 1]) {
      selected = items[0];
      return;
    }
    for (var i = 0; i < items.length - 1; i++) {
      if (selected === items[i]) {
        selected = items[i + 1];
        break;
      }
    }
  }
  function keydown(ev) {
    var keyCode = ev.which || ev.keyCode || 0;
    if (keyCode === 38 || keyCode === 40 || keyCode === 27) {
      var containerIsDisplayed = containerDisplayed();
      if (keyCode === 27) {
        clear();
      } else {
        if (!containerDisplayed || items.length < 1) {
          return;
        }
        keyCode === 38 ? selectPrev() : selectNext();
        update();
      }
      ev.preventDefault();
      if (containerIsDisplayed) {
        ev.stopPropagation();
      }
      return;
    }
    if (keyCode === 13 && selected) {
      settings.onSelect(selected, input);
      clear();
    }
  }
  function blur() {
    setTimeout(function () {
      if (doc.activeElement !== input) {
        clear();
      }
    }, 200);
  }
  function destroy() {
    input.removeEventListener("keydown", keydown);
    input.removeEventListener("focus", focus);
    input.removeEventListener(keyUpEventName, keyup);
    input.removeEventListener("blur", blur);
    window.removeEventListener("resize", resizeEventHandler);
    doc.removeEventListener("scroll", scrollEventHandler, true);
    clearDebounceTimer();
    clear();
    keypressCounter++;
  }
  input.addEventListener("focus", focus);
  input.addEventListener("keydown", keydown);
  input.addEventListener(keyUpEventName, keyup);
  input.addEventListener("blur", blur);
  window.addEventListener("resize", resizeEventHandler);
  doc.addEventListener("scroll", scrollEventHandler, true);
  return {
    destroy: destroy,
  };
}

var ARR_SLICE$2 = Array.prototype.slice;
var CSS_NAMESPACE = "dg";
var HIDE_KEY_CODE = 72;
var CLOSE_BUTTON_HEIGHT = 20;
var DEFAULT_DEFAULT_PRESET_NAME = "Default";
var SUPPORTS_LOCAL_STORAGE = (function () {
  try {
    return "localStorage" in window && !!window.localStorage;
  } catch (e) {
    return false;
  }
})();
var SAVE_DIALOGUE;
var autoPlaceVirgin = true;
var Editor;
var modalTitle;
var autoPlaceContainer;
var hide = false;
var hideableGuis = [];
var GUI = (function () {
  function GUI(params) {
    var _this = this;
    params = params || {};
    this.domElement = document.createElement("div");
    this.__ul = document.createElement("ul");
    this.domElement.appendChild(this.__ul);
    dom.addClass(this.domElement, CSS_NAMESPACE);
    this.__folders = {};
    this.__controllers = [];
    this.__rememberedObjects = [];
    this.__rememberedObjectIndecesToControllers = [];
    this.__listening = [];
    params = Common.defaults(params, {
      closeOnTop: false,
      autoPlace: true,
      width: GUI.DEFAULT_WIDTH,
      showCloseButton: true,
    });
    params = Common.defaults(params, {
      resizable: params.autoPlace,
      hideable: params.autoPlace,
    });
    if (!Common.isUndefined(params.load)) {
      if (params.preset) {
        params.load.preset = params.preset;
      }
    } else {
      params.load = {
        preset: DEFAULT_DEFAULT_PRESET_NAME,
      };
    }
    if (Common.isUndefined(params.parent) && params.hideable) {
      hideableGuis.push(this);
    }
    params.resizable = Common.isUndefined(params.parent) && params.resizable;
    if (params.autoPlace && Common.isUndefined(params.scrollable)) {
      params.scrollable = true;
    }
    var useLocalStorage =
      SUPPORTS_LOCAL_STORAGE && window.localStorage.getItem(getLocalStorageHash(this, "isLocal")) === "true";
    this.saveToLocalStorageIfPossible = function () {
      if (SUPPORTS_LOCAL_STORAGE && window.localStorage.getItem(getLocalStorageHash(_this, "isLocal")) === "true") {
        window.localStorage.setItem(getLocalStorageHash(_this, "gui"), JSON.stringify(_this.getSaveObject()));
      }
    };
    var titleRow;
    Object.defineProperties(this, {
      lightTheme: {
        set: function set(v) {
          params.lightTheme = v;
          if (v) dom.addClass(_this.domElement, GUI.CLASS_LIGHT_THEME);
          else dom.removeClass(_this.domElement, GUI.CLASS_LIGHT_THEME);
        },
        get: function get() {
          return params.lightTheme;
        },
      },
      showCloseButton: {
        set: function set(v) {
          params.showCloseButton = v;
          if (v) dom.removeClass(_this.__closeButton, GUI.CLASS_DISPLAY_NONE);
          else dom.addClass(_this.__closeButton, GUI.CLASS_DISPLAY_NONE);
        },
        get: function get() {
          return params.showCloseButton;
        },
      },
      parent: {
        get: function get() {
          return params.parent;
        },
      },
      scrollable: {
        get: function get() {
          return params.scrollable;
        },
      },
      autoPlace: {
        get: function get() {
          return params.autoPlace;
        },
      },
      closeOnTop: {
        get: function get() {
          return params.closeOnTop;
        },
      },
      preset: {
        get: function get() {
          if (_this.parent) {
            return _this.getRoot().preset;
          }
          return params.load.preset;
        },
        set: function set(v) {
          if (_this.parent) {
            _this.getRoot().preset = v;
          } else {
            params.load.preset = v;
          }
          setPresetSelectIndex(this);
          _this.revert();
        },
      },
      width: {
        get: function get() {
          return params.width;
        },
        set: function set(v) {
          params.width = v;
          setWidth(_this, v);
        },
      },
      name: {
        get: function get() {
          return params.name || "";
        },
        set: function set(v) {
          if (v !== params.name && _this.__folders[v] !== undefined) {
            throw new Error("name collision: another sibling GUI folder has the same name");
          }
          params.name = v;
          if (titleRow) {
            titleRow.innerHTML = params.name;
          }
        },
      },
      title: {
        get: function get() {
          return params.title;
        },
        set: function set(v) {
          params.title = v;
          if (titleRow) {
            if (Common.isString(params.title)) {
              titleRow.setAttribute("title", params.title);
            } else {
              titleRow.removeAttribute("title");
            }
          }
        },
      },
      closed: {
        get: function get() {
          return params.closed;
        },
        set: function set(v) {
          params.closed = v;
          if (params.closed) {
            dom.addClass(_this.__ul, GUI.CLASS_CLOSED);
          } else {
            dom.removeClass(_this.__ul, GUI.CLASS_CLOSED);
          }
          _this.onResize();
          if (_this.__closeButton) {
            _this.__closeButton.innerHTML = v ? GUI.TEXT_OPEN : GUI.TEXT_CLOSED;
          }
        },
      },
      load: {
        get: function get() {
          return params.load;
        },
      },
      useLocalStorage: {
        get: function get() {
          return useLocalStorage;
        },
        set: function set(bool) {
          if (SUPPORTS_LOCAL_STORAGE) {
            useLocalStorage = bool;
            if (bool) {
              dom.bind(window, "unload", _this.saveToLocalStorageIfPossible);
            } else {
              dom.unbind(window, "unload", _this.saveToLocalStorageIfPossible);
            }
            window.localStorage.setItem(getLocalStorageHash(_this, "isLocal"), bool);
          }
        },
      },
    });
    if (Common.isUndefined(params.parent)) {
      this.closed = params.closed || false;
      dom.addClass(this.domElement, GUI.CLASS_MAIN);
      dom.makeSelectable(this.domElement, false);
      if (params.lightTheme) {
        dom.addClass(this.domElement, GUI.CLASS_LIGHT_THEME);
      }
      if (SUPPORTS_LOCAL_STORAGE) {
        if (useLocalStorage) {
          _this.useLocalStorage = true;
          var savedGui = window.localStorage.getItem(getLocalStorageHash(this, "gui"));
          if (savedGui) {
            params.load = JSON.parse(savedGui);
          }
        }
      }
      this.__closeButton = document.createElement("div");
      this.__closeButton.innerHTML = GUI.TEXT_CLOSED;
      dom.addClass(this.__closeButton, GUI.CLASS_CLOSE_BUTTON);
      if (params.closeOnTop) {
        dom.addClass(this.__closeButton, GUI.CLASS_CLOSE_TOP);
        this.domElement.insertBefore(this.__closeButton, this.domElement.childNodes[0]);
      } else {
        dom.addClass(this.__closeButton, GUI.CLASS_CLOSE_BOTTOM);
        this.domElement.appendChild(this.__closeButton);
      }
      if (!params.showCloseButton) {
        dom.addClass(this.__closeButton, GUI.CLASS_DISPLAY_NONE);
      }
      dom.bind(this.__closeButton, "click", function () {
        _this.closed = !_this.closed;
      });
    } else {
      if (params.closed === undefined) {
        params.closed = true;
      }
      var titleRowName = document.createTextNode(params.name);
      dom.addClass(titleRowName, "controller-name");
      titleRow = addRow(_this, titleRowName);
      if (Common.isString(params.title)) {
        titleRow.setAttribute("title", params.title);
      }
      var onClickTitle = function onClickTitle(e) {
        e.preventDefault();
        _this.closed = !_this.closed;
        return false;
      };
      dom.addClass(this.__ul, GUI.CLASS_CLOSED);
      dom.addClass(titleRow, "title");
      dom.bind(titleRow, "click", onClickTitle);
      if (!params.closed) {
        this.closed = false;
      }
    }
    if (params.autoPlace) {
      if (Common.isUndefined(params.parent)) {
        if (autoPlaceVirgin) {
          autoPlaceContainer = document.createElement("div");
          dom.addClass(autoPlaceContainer, CSS_NAMESPACE);
          dom.addClass(autoPlaceContainer, GUI.CLASS_AUTO_PLACE_CONTAINER);
          document.body.appendChild(autoPlaceContainer);
          autoPlaceVirgin = false;
        }
        autoPlaceContainer.appendChild(this.domElement);
        dom.addClass(this.domElement, GUI.CLASS_AUTO_PLACE);
      }
      if (!this.parent) {
        setWidth(_this, params.width);
      }
    }
    function __resizeHandler() {
      _this.onResizeDebounced();
    }
    dom.bind(window, "resize", __resizeHandler);
    dom.bind(this.__ul, "webkitTransitionEnd", __resizeHandler);
    dom.bind(this.__ul, "transitionend", __resizeHandler);
    dom.bind(this.__ul, "oTransitionEnd", __resizeHandler);
    this.onResize();
    if (params.resizable) {
      addResizeHandle(this);
    }
    function resetWidth() {
      var root = _this.getRoot();
      root.width += 1;
      Common.defer(function () {
        root.width -= 1;
      });
    }
    if (!params.parent) {
      resetWidth();
    }
    if (Common.isObject(params.object)) {
      Common.each(params.object, function (property, propertyName) {
        _this.add(params.object, propertyName);
      });
    }
  }
  var _proto = GUI.prototype;
  _proto.getControllerByName = function getControllerByName(name, recurse) {
    var controllers = this.__controllers;
    var i = controllers.length;
    while (--i > -1) {
      if (controllers[i].property === name) {
        return controllers[i];
      }
    }
    var folders = this.__folders;
    var tryFI;
    if (recurse) {
      for (i in folders) {
        tryFI = folders[i].getControllerByName(name, true);
        if (tryFI != null) return tryFI;
      }
    }
    return null;
  };
  _proto.getFolderByName = function getFolderByName(name) {
    return this.__folders[name];
  };
  _proto.getAllControllers = function getAllControllers(recurse, myArray) {
    if (recurse == undefined) recurse = true;
    var i;
    var arr = myArray != null ? myArray : [];
    var controllers = this.__controllers;
    for (i in controllers) {
      arr.push(controllers[i]);
    }
    if (recurse) {
      var folders = this.__folders;
      for (i in folders) {
        folders[i].getAllControllers(true, arr);
      }
    }
    return arr;
  };
  _proto.getAllGUIs = function getAllGUIs(recurse, myArray) {
    if (recurse == undefined) recurse = true;
    var i;
    var arr = myArray != null ? myArray : [this];
    var folders = this.__folders;
    for (i in folders) {
      arr.push(folders[i]);
    }
    if (recurse) {
      for (i in folders) {
        folders[i].getAllGUIs(true, arr);
      }
    }
    return arr;
  };
  _proto.toggleHide = function toggleHide() {
    hide = !hide;
    Common.each(hideableGuis, function (gui) {
      gui.domElement.style.display = hide ? "none" : "";
    });
  };
  _proto._keydownHandler = function _keydownHandler(e) {
    if (
      document.activeElement &&
      document.activeElement.type !== "text" &&
      document.activeElement.nodeName.toString().toLowerCase() !== "textarea" &&
      (e.which === HIDE_KEY_CODE || e.keyCode === HIDE_KEY_CODE)
    ) {
      GUI.toggleHide();
    }
  };
  _proto.add = function add(object, property, label) {
    for (var _len = arguments.length, factoryArgs = new Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
      factoryArgs[_key - 3] = arguments[_key];
    }
    return _add(this, object, property, label, {
      custom: object instanceof CustomController,
      factoryArgs: factoryArgs,
    });
  };
  _proto.openExportWindow = function openExportWindow(title, content) {
    if (Common.isUndefined(SAVE_DIALOGUE)) {
      SAVE_DIALOGUE = new CenteredDiv();
      SAVE_DIALOGUE.domElement.innerHTML = saveDialogueContents;
      modalTitle = document.getElementById("dg-title");
      var JsonMode = ace.require("ace/mode/json").Mode;
      Editor = ace.edit("dg-new-editor");
      Editor.setTheme("ace/theme/solarized_dark");
      Editor.session.setMode(new JsonMode());
      Editor.setReadOnly(true);
    }
    if (this.autoPlace) {
      setWidth(this, this.width);
    }
    modalTitle.innerHTML = title;
    Editor.setValue(JSON.stringify(content, undefined, 2));
    SAVE_DIALOGUE.show();
    Editor.focus();
  };
  _proto.addColor = function addColor(object, property, label) {
    return _add(this, object, property, label, {
      color: true,
    });
  };
  _proto.addTextArea = function addTextArea(object, property) {
    return _add(this, object, property, {
      multiline: true,
    });
  };
  _proto.addEasingFunction = function addEasingFunction(object, property) {
    return _add(this, object, property, {
      easing: true,
    });
  };
  _proto.addPlotter = function addPlotter(object, property, max, period, type, fgColor, bgColor) {
    return _add(this, object, property, {
      plotter: true,
      max: max || 10,
      period: typeof period === "number" ? period : 500,
      type: type || "line",
      fgColor: fgColor || "#fff",
      bgColor: bgColor || "#000",
    });
  };
  _proto.addFile = function addFile(object, property) {
    return _add(this, object, property, {
      file: true,
    });
  };
  _proto.addCustomController = function addCustomController(object, property) {
    return _add(this, object, property, {
      custom: true,
      factoryArgs: Array.prototype.slice.call(arguments, 2),
    });
  };
  _proto.addGradient = function addGradient(object, property, label) {
    return _add(this, object, property, label, {
      gradient: true,
      factoryArgs: Array.prototype.slice.call(arguments, 3),
    });
  };
  _proto.addImage = function addImage(object, property, label) {
    return _add(this, object, property, label, {
      factoryArgs: Array.prototype.slice.call(arguments, 3),
      image: true,
    });
  };
  _proto.remove = function remove(controller) {
    var lIndex = this.__listening.indexOf(controller);
    if (lIndex !== -1) {
      this.__listening.splice(lIndex, 1);
    }
    if (controller.destruct) {
      controller.destruct();
    }
    this.__ul.removeChild(controller.__li);
    this.__controllers.splice(this.__controllers.indexOf(controller), 1);
    var _this = this;
    Common.defer(function () {
      _this.onResize();
    });
  };
  _proto.destroy = function destroy() {
    if (this.parent) {
      throw new Error(
        "Only the root GUI should be removed with .destroy(). " +
          "For subfolders, use gui.removeFolder(folder) instead."
      );
    }
    if (this.autoPlace) {
      autoPlaceContainer.removeChild(this.domElement);
    }
    var _this = this;
    Common.each(this.__folders, function (folder, name) {
      _this.removeFolder(name);
    });
    dom.unbind(window, "keydown", GUI._keydownHandler, false);
    removeListeners(this);
    for (var i = this.__listening.length - 1; i >= 0; i--) {
      this.__listening.splice(i, 1);
    }
  };
  _proto.addFolder = function addFolder(name, title) {
    if (this.__folders[name] !== undefined) {
      throw new Error('You already have a folder in this GUI by the name "' + name + '"');
    }
    var newGuiParams = {
      name: name,
      parent: this,
      title: title,
    };
    newGuiParams.autoPlace = this.autoPlace;
    if (this.load && this.load.folders && this.load.folders[name]) {
      newGuiParams.closed = this.load.folders[name].closed;
      newGuiParams.load = this.load.folders[name];
    }
    var gui = new GUI(newGuiParams);
    this.__folders[name] = gui;
    var li = addRow(this, gui.domElement);
    dom.addClass(li, "folder");
    return gui;
  };
  _proto.removeFolder = function removeFolder(name) {
    var folder = this.__folders[name];
    if (!folder) {
      console.error('There is no folder in this GUI by the name "' + name + '"');
      return;
    }
    folder.close();
    this.__ul.removeChild(folder.domElement.parentElement);
    delete this.__folders[folder.name];
    if (this.load && this.load.folders && this.load.folders[folder.name]) {
      delete this.load.folders[folder.name];
    }
    removeListeners(folder);
    var _this = this;
    Common.each(folder.__folders, function (subfolder) {
      folder.removeFolder(subfolder);
    });
    Common.defer(function () {
      _this.onResize();
    });
  };
  _proto.open = function open() {
    this.closed = false;
  };
  _proto.close = function close() {
    this.closed = true;
  };
  _proto.hide = function hide() {
    this.domElement.style.display = "none";
  };
  _proto.show = function show() {
    this.domElement.style.display = "";
  };
  _proto.onFinishRevert = function onFinishRevert(fn) {
    this.__onFinishRevert = fn;
    return this;
  };
  _proto.onResize = function onResize() {
    var root = this.getRoot();
    if (root.scrollable) {
      var _dom$getOffset = dom.getOffset(root.__ul),
        top = _dom$getOffset.top;
      var h = 0;
      Common.each(root.__ul.childNodes, function (node) {
        if (!(root.autoPlace && node === root.__save_row)) {
          h += dom.getHeight(node);
        }
      });
      if (root.domElement.clientHeight - CLOSE_BUTTON_HEIGHT < h) {
        dom.addClass(root.domElement, GUI.CLASS_TOO_TALL);
        root.__ul.style.height = root.domElement.clientHeight - CLOSE_BUTTON_HEIGHT + "px";
      } else {
        dom.removeClass(root.domElement, GUI.CLASS_TOO_TALL);
        root.__ul.style.height = "auto";
      }
    }
    if (root.__resize_handle) {
      Common.defer(function () {
        root.__resize_handle.style.height = root.__ul.offsetHeight + "px";
      });
    }
    if (root.__closeButton) {
      root.__closeButton.style.width = root.width + "px";
    }
  };
  _proto.remember = function remember() {
    if (Common.isUndefined(SAVE_DIALOGUE)) {
      SAVE_DIALOGUE = new CenteredDiv();
      SAVE_DIALOGUE.domElement.innerHTML = saveDialogueContents;
    }
    if (this.parent) {
      throw new Error("You can only call remember on a top level GUI.");
    }
    var _this = this;
    Common.each(ARR_SLICE$2.call(arguments), function (object) {
      if (_this.__rememberedObjects.length === 0) {
        addSaveMenu(_this);
      }
      if (_this.__rememberedObjects.indexOf(object) === -1) {
        _this.__rememberedObjects.push(object);
      }
    });
    if (this.autoPlace) {
      this.width += 40;
      setWidth(this, this.width);
    }
    return this;
  };
  _proto.getRoot = function getRoot() {
    var gui = this;
    while (gui.parent) {
      gui = gui.parent;
    }
    return gui;
  };
  _proto.getSaveObject = function getSaveObject() {
    var toReturn = this.load;
    toReturn.closed = this.closed;
    if (this.__rememberedObjects.length > 0) {
      toReturn.preset = this.preset;
      if (!toReturn.remembered) {
        toReturn.remembered = {};
      }
      toReturn.remembered[this.preset] = getCurrentPreset(this);
    }
    toReturn.folders = {};
    Common.each(this.__folders, function (element, key) {
      toReturn.folders[key] = element.getSaveObject();
    });
    return toReturn;
  };
  _proto.save = function save() {
    if (!this.load.remembered) {
      this.load.remembered = {};
    }
    this.load.remembered[this.preset] = getCurrentPreset(this);
    markPresetModified(this, false);
    this.saveToLocalStorageIfPossible();
    return this;
  };
  _proto.saveAs = function saveAs(presetName) {
    if (!this.load.remembered) {
      this.load.remembered = {};
      this.load.remembered[DEFAULT_DEFAULT_PRESET_NAME] = getCurrentPreset(this, true);
    }
    this.load.remembered[presetName] = getCurrentPreset(this);
    this.preset = presetName;
    addPresetOption(this, presetName, true);
    this.saveToLocalStorageIfPossible();
    return this;
  };
  _proto.revert = function revert(gui) {
    var _this = this.getRoot();
    Common.each(
      this.__controllers,
      function (controller) {
        if (!this.getRoot().load.remembered) {
          controller.setValue(controller.initialValue, true);
        } else {
          recallSavedValue(gui || this.getRoot(), controller);
        }
        if (!_this.__onFinishRevert && controller.__onFinishChange) {
          controller.__onFinishChange.call(controller, controller.getValue());
        }
      },
      this
    );
    Common.each(this.__folders, function (folder) {
      folder.revert(folder);
    });
    if (!gui) {
      markPresetModified(this.getRoot(), false);
    }
    if (_this === this && _this.__onFinishRevert) {
      _this.__onFinishRevert.call(_this);
    }
    return this;
  };
  _proto.deleteSave = function deleteSave() {
    if (this.preset === DEFAULT_DEFAULT_PRESET_NAME) {
      return;
    }
    var opt = this.__preset_select[this.__preset_select.selectedIndex];
    this.__preset_select.removeChild(opt);
    this.__preset_select.selectedIndex = 0;
    delete this.load.remembered[this.preset];
    this.preset = DEFAULT_DEFAULT_PRESET_NAME;
    this.saveToLocalStorageIfPossible();
    return this;
  };
  _proto.listen = function listen(controller) {
    var init = this.__listening.length === 0;
    this.__listening.push(controller);
    if (init) {
      updateDisplays(this.__listening);
    }
    return this;
  };
  _proto.updateDisplay = function updateDisplay() {
    Common.each(this.__controllers, function (controller) {
      controller.updateDisplay();
    });
    Common.each(this.__folders, function (folder) {
      folder.updateDisplay();
    });
    return this;
  };
  return GUI;
})();
GUI.plugins = {
  autocomplete: autocomplete,
};
GUI.CLASS_AUTO_PLACE = "a";
GUI.CLASS_AUTO_PLACE_CONTAINER = "ac";
GUI.CLASS_MAIN = "main";
GUI.CLASS_CONTROLLER_ROW = "cr";
GUI.CLASS_TOO_TALL = "taller-than-window";
GUI.CLASS_CLOSED = "closed";
GUI.CLASS_CLOSE_BUTTON = "close-button";
GUI.CLASS_CLOSE_TOP = "close-top";
GUI.CLASS_CLOSE_BOTTOM = "close-bottom";
GUI.CLASS_DRAG = "drag";
GUI.CLASS_DISPLAY_NONE = "display-none";
GUI.CLASS_LIGHT_THEME = "light-theme";
GUI.DEFAULT_WIDTH = 245;
GUI.TEXT_CLOSED = "Close Controls";
GUI.TEXT_OPEN = "Open Controls";
dom.bind(window, "keydown", GUI._keydownHandler, false);
GUI.onResizeDebounced = Common.debounce(function () {
  this.onResize();
}, 50);
function _add(gui, object, property, label, params) {
  if (!(object instanceof CustomController) && !params.custom && object[property] === undefined) {
    throw new Error('Object "' + object + '" has no property "' + property + '"');
  }
  var controller;
  var value = object[property];
  if (params.color) {
    controller = new ColorController(object, property);
  } else if (params.easing) {
    controller = new EasingFunctionController(object, property);
  } else if (params.multiline) {
    controller = new TextAreaController(object, property);
  } else if (params.gradient) {
    controller = new GradientController(object, property, params.factoryArgs[0]);
  } else if (params.image) {
    controller = new ImageController(object, property, params.factoryArgs[0]);
  } else if (params.plotter) {
    controller = new PlotterController(object, property, params);
    gui.listen(controller);
  } else if (params.file) {
    controller = new FileController(object, property);
  } else if (object instanceof CustomController && property === undefined) {
    controller = object;
  } else if (!(object instanceof CustomController) && params.custom && object[property] === undefined) {
    controller = new CustomController(object, property);
  } else {
    var factoryArgs =
      object instanceof CustomController
        ? [property].concat(params.factoryArgs)
        : [object, property].concat(params.factoryArgs);
    controller = controllerFactory.apply(gui, factoryArgs);
  }
  if (!controller) {
    throw new Error(
      "Object " +
        object +
        ' has a (probably null-ed) property "' +
        property +
        '" for which you did not explicitly specify a suitable controller'
    );
  }
  if (params.before instanceof Controller) {
    params.before = params.before.__li;
  }
  recallSavedValue(gui, controller);
  dom.addClass(controller.domElement, "c");
  var name =
    params.custom && controller instanceof CustomController === false
      ? object instanceof CustomController
        ? object.domElement
        : new CustomController(object).domElement
      : document.createElement("span");
  if (label !== null) {
    name.innerHTML = label;
  } else if (!params.custom) {
    name.innerHTML = controller.property;
  }
  dom.addClass(name, "property-name");
  var container = document.createElement("div");
  container.appendChild(name);
  container.appendChild(controller.domElement);
  var li = addRow(gui, container, params.before);
  dom.addClass(li, GUI.CLASS_CONTROLLER_ROW);
  if (controller instanceof ColorController) {
    dom.addClass(li, "color");
  } else if (controller instanceof PlotterController) {
    dom.addClass(li, "plotter");
  } else if (controller instanceof FileController) {
    dom.addClass(li, "file");
  } else if (controller instanceof ImageController) {
    dom.addClass(li, "image");
  } else {
    dom.addClass(li, typeof controller.getValue());
  }
  augmentController(gui, li, controller);
  gui.__controllers.push(controller);
  return controller;
}
function addRow(gui, dom, liBefore) {
  var li = document.createElement("li");
  if (dom) {
    li.appendChild(dom);
  }
  if (liBefore) {
    gui.__ul.insertBefore(li, liBefore);
  } else {
    gui.__ul.appendChild(li);
  }
  gui.onResize();
  return li;
}
function removeListeners(gui) {
  dom.unbind(window, "resize", gui.__resizeHandler);
  if (gui.saveToLocalStorageIfPossible) {
    dom.unbind(window, "unload", gui.saveToLocalStorageIfPossible);
  }
}
function markPresetModified(gui, modified) {
  var opt = gui.__preset_select[gui.__preset_select.selectedIndex];
  if (modified) {
    opt.innerHTML = opt.value + "*";
  } else {
    opt.innerHTML = opt.value;
  }
}
function augmentController(gui, li, controller) {
  controller.__li = li;
  controller.__gui = gui;
  Common.extend(controller, {
    options: function options(_options) {
      if (arguments.length > 1) {
        var nextSibling = controller.__li.nextElementSibling;
        controller.remove();
        return _add(gui, controller.object, controller.property, controller.label, {
          before: nextSibling,
          factoryArgs: [Common.toArray(arguments)],
        });
      }
      if (Common.isArray(_options) || Common.isObject(_options)) {
        var _nextSibling = controller.__li.nextElementSibling;
        controller.remove();
        return _add(gui, controller.object, controller.property, controller.label, {
          before: _nextSibling,
          factoryArgs: [_options],
        });
      }
    },
    name: function name(_name) {
      controller.__li.firstElementChild.firstElementChild.innerHTML = _name;
      return controller;
    },
    title: function title(v) {
      if (Common.isString(v)) {
        controller.__li.setAttribute("title", v);
      } else {
        controller.__li.removeAttribute("title");
      }
      return controller;
    },
    listen: function listen(forceUpdateDisplay) {
      controller.forceUpdateDisplay = !!forceUpdateDisplay;
      controller.__gui.listen(controller);
      return controller;
    },
    remove: function remove() {
      controller.__gui.remove(controller);
      return controller;
    },
  });
  if (controller instanceof NumberControllerSlider) {
    var box = new NumberControllerBox(controller.object, controller.property, {
      min: controller.__min,
      max: controller.__max,
      step: controller.__step,
    });
    Common.each(["updateDisplay", "onChange", "onFinishChange", "step", "min", "max"], function (method) {
      var pc = controller[method];
      var pb = box[method];
      controller[method] = box[method] = function () {
        var args = ARR_SLICE$2.call(arguments);
        pc.apply(controller, args);
        return pb.apply(box, args);
      };
    });
    dom.addClass(li, "has-slider");
    controller.domElement.insertBefore(box.domElement, controller.domElement.firstElementChild);
    var animateButtons = new NumberControllerAnimator(controller.object, controller.property, {
      min: controller.__min,
      max: controller.__max,
      step: controller.__step,
    });
    Common.each(["updateDisplay", "onChange", "onFinishChange", "step"], function (method) {
      var pc = controller[method];
      var pb = animateButtons[method];
      controller[method] = animateButtons[method] = function () {
        var args = Array.prototype.slice.call(arguments);
        pb.apply(animateButtons, args);
        return pc.apply(controller, args);
      };
    });
    dom.addClass(li, "has-animate-buttons");
    controller.domElement.insertBefore(animateButtons.domElement, controller.domElement.firstElementChild);
  } else if (controller instanceof NumberControllerBox) {
    var r = function r(returned) {
      if (Common.isNumber(controller.__min) && Common.isNumber(controller.__max)) {
        var oldName = controller.__li.firstElementChild.firstElementChild.innerHTML;
        var wasListening = controller.__gui.__listening.indexOf(controller) > -1;
        controller.remove();
        var newController = _add(gui, controller.object, controller.property, controller.label, {
          before: controller.__li.nextElementSibling,
          factoryArgs: [controller.__min, controller.__max, controller.__step],
        });
        newController.name(oldName);
        if (wasListening) newController.listen();
        return newController;
      }
      return returned;
    };
    controller.min = Common.compose(r, controller.min);
    controller.max = Common.compose(r, controller.max);
  } else if (controller instanceof BooleanController) {
    dom.bind(li, "click", function () {
      dom.fakeEvent(controller.__checkbox, "click");
    });
    dom.bind(controller.__checkbox, "click", function (e) {
      e.stopPropagation();
    });
  } else if (controller instanceof FunctionController || controller instanceof TabbedController) {
    dom.bind(li, "click", function () {
      dom.fakeEvent(controller.__button, "click");
    });
    dom.bind(li, "mouseover", function () {
      dom.addClass(controller.__button, "hover");
    });
    dom.bind(li, "mouseout", function () {
      dom.removeClass(controller.__button, "hover");
    });
  } else if (controller instanceof ColorController) {
    dom.addClass(li, "color");
    controller.updateDisplay = Common.compose(function (val) {
      li.style.borderLeftColor = controller.__color.toHexString();
      return val;
    }, controller.updateDisplay);
    controller.updateDisplay();
  } else if (controller instanceof ArrayController) {
    dom.addClass(li, "array");
    controller.updateDisplay = Common.compose(function (val) {
      li.style.height = (controller.__inputs.length + 1) * 26 + "px";
    }, controller.updateDisplay);
    controller.updateDisplay();
  } else if (controller instanceof GradientController) {
    li.style.borderLeft = "3px solid #2FA1D6";
  } else if (controller instanceof VectorController) {
    dom.addClass(li, "vector");
  } else if (controller instanceof FileController) {
    dom.addClass(li, "file");
  }
  controller.setValue = Common.compose(function (val) {
    if (gui.getRoot().__preset_select && controller.isModified()) {
      markPresetModified(gui.getRoot(), true);
    }
    return val;
  }, controller.setValue);
}
function recallSavedValue(gui, controller) {
  var root = gui.getRoot();
  var matchedIndex = root.__rememberedObjects.indexOf(controller.object);
  if (matchedIndex !== -1) {
    var controllerMap = root.__rememberedObjectIndecesToControllers[matchedIndex];
    if (controllerMap === undefined) {
      controllerMap = {};
      root.__rememberedObjectIndecesToControllers[matchedIndex] = controllerMap;
    }
    controllerMap[controller.property] = controller;
    if (root.load && root.load.remembered) {
      var presetMap = root.load.remembered;
      var preset;
      if (presetMap[gui.preset]) {
        preset = presetMap[gui.preset];
      } else if (presetMap[DEFAULT_DEFAULT_PRESET_NAME]) {
        preset = presetMap[DEFAULT_DEFAULT_PRESET_NAME];
      } else {
        return;
      }
      if (preset[matchedIndex] && preset[matchedIndex][controller.property] !== undefined) {
        var value = preset[matchedIndex][controller.property];
        controller.initialValue = value;
        controller.setValue(value, true);
      }
    }
  }
}
function getLocalStorageHash(gui, key) {
  var namespace = window.localStorage.getItem("dat.gui.namespace") || document.location.href;
  return "dat.gui." + namespace + "." + key;
}
function addPresetOption(gui, name, setSelected) {
  var opt = document.createElement("option");
  opt.innerHTML = name;
  opt.value = name;
  gui.__preset_select.appendChild(opt);
  if (setSelected) {
    gui.__preset_select.selectedIndex = gui.__preset_select.length - 1;
  }
}
function showHideExplain(gui, explain) {
  explain.style.display = gui.useLocalStorage ? "block" : "none";
}
function addSaveMenu(gui) {
  var div = (gui.__save_row = document.createElement("li"));
  dom.addClass(gui.domElement, "has-save");
  gui.__ul.insertBefore(div, gui.__ul.firstChild);
  dom.addClass(div, "save-row");
  var gears = document.createElement("span");
  gears.innerHTML = "&nbsp;";
  dom.addClass(gears, "button gears");
  var button = document.createElement("span");
  button.innerHTML = "Save";
  dom.addClass(button, "button");
  dom.addClass(button, "save");
  var button2 = document.createElement("span");
  button2.innerHTML = "New";
  dom.addClass(button2, "button");
  dom.addClass(button2, "save-as");
  var button3 = document.createElement("span");
  button3.innerHTML = "Revert";
  dom.addClass(button3, "button");
  dom.addClass(button3, "revert");
  var button4 = document.createElement("span");
  button4.innerHTML = "Delete";
  dom.addClass(button4, "button");
  dom.addClass(button4, "delete");
  var select = (gui.__preset_select = document.createElement("select"));
  if (gui.load && gui.load.remembered) {
    Common.each(gui.load.remembered, function (value, key) {
      addPresetOption(gui, key, key === gui.preset);
    });
  } else {
    addPresetOption(gui, DEFAULT_DEFAULT_PRESET_NAME, false);
  }
  dom.bind(select, "change", function () {
    for (var index = 0; index < gui.__preset_select.length; index++) {
      gui.__preset_select[index].innerHTML = gui.__preset_select[index].value;
    }
    gui.preset = this.value;
  });
  div.appendChild(select);
  div.appendChild(gears);
  div.appendChild(button);
  div.appendChild(button2);
  div.appendChild(button3);
  div.appendChild(button4);
  if (SUPPORTS_LOCAL_STORAGE) {
    var explain = document.getElementById("dg-local-explain");
    var localStorageCheckBox = document.getElementById("dg-local-storage");
    var saveLocally = document.getElementById("dg-save-locally");
    saveLocally.style.display = "block";
    if (window.localStorage.getItem(getLocalStorageHash(gui, "isLocal")) === "true") {
      localStorageCheckBox.setAttribute("checked", "checked");
    }
    showHideExplain(gui, explain);
    dom.bind(localStorageCheckBox, "change", function () {
      gui.useLocalStorage = !gui.useLocalStorage;
      showHideExplain(gui, explain);
    });
  }
  var newConstructorTextArea = document.getElementById("dg-new-constructor");
  dom.bind(newConstructorTextArea, "keydown", function (e) {
    if (e.metaKey && (e.which === 67 || e.keyCode === 67)) {
      SAVE_DIALOGUE.hide();
    }
  });
  dom.bind(gears, "click", function () {
    newConstructorTextArea.innerHTML = JSON.stringify(gui.getSaveObject(), undefined, 2);
    SAVE_DIALOGUE.show();
    newConstructorTextArea.focus();
    newConstructorTextArea.select();
  });
  dom.bind(button, "click", function () {
    gui.save();
  });
  dom.bind(button2, "click", function () {
    var presetName = prompt("Enter a new preset name.");
    if (presetName) {
      gui.saveAs(presetName);
    }
  });
  dom.bind(button3, "click", function () {
    gui.revert();
  });
  dom.bind(button4, "click", function () {
    if (gui.preset === DEFAULT_DEFAULT_PRESET_NAME) {
      alert("Default preset can't be deleted.");
      return;
    }
    if (!confirm('Are you sure you want to delete preset "' + gui.preset + '"?')) {
      return;
    }
    gui.deleteSave();
  });
}
function addResizeHandle(gui) {
  var pmouseX;
  gui.__resize_handle = document.createElement("div");
  Common.extend(gui.__resize_handle.style, {
    width: "6px",
    marginLeft: "-3px",
    height: "200px",
    cursor: "ew-resize",
    position: "absolute",
  });
  function drag(e) {
    e.preventDefault();
    gui.width += pmouseX - e.clientX;
    gui.onResize();
    pmouseX = e.clientX;
    return false;
  }
  function dragStop() {
    dom.removeClass(gui.__closeButton, GUI.CLASS_DRAG);
    dom.unbind(window, "mousemove", drag);
    dom.unbind(window, "mouseup", dragStop);
  }
  function dragStart(e) {
    e.preventDefault();
    pmouseX = e.clientX;
    dom.addClass(gui.__closeButton, GUI.CLASS_DRAG);
    dom.bind(window, "mousemove", drag);
    dom.bind(window, "mouseup", dragStop);
    return false;
  }
  dom.bind(gui.__resize_handle, "mousedown", dragStart);
  dom.bind(gui.__closeButton, "mousedown", dragStart);
  gui.domElement.insertBefore(gui.__resize_handle, gui.domElement.firstElementChild);
}
function setWidth(gui, w) {
  gui.domElement.style.width = w + "px";
  if (gui.__save_row && gui.autoPlace) {
    gui.__save_row.style.width = w + "px";
  }
  if (gui.__closeButton) {
    gui.__closeButton.style.width = w + "px";
  }
}
function getCurrentPreset(gui, useInitialValues) {
  var toReturn = {};
  Common.each(gui.__rememberedObjects, function (val, index) {
    var savedValues = {};
    var controllerMap = gui.__rememberedObjectIndecesToControllers[index];
    Common.each(controllerMap, function (controller, property) {
      savedValues[property] = useInitialValues ? controller.initialValue : controller.getValue();
    });
    toReturn[index] = savedValues;
  });
  return toReturn;
}
function setPresetSelectIndex(gui) {
  for (var index = 0; index < gui.__preset_select.length; index++) {
    if (gui.__preset_select[index].value === gui.preset) {
      gui.__preset_select.selectedIndex = index;
    }
  }
}
function updateDisplays(controllerArray) {
  if (controllerArray.length !== 0) {
    requestAnimationFrame$2(function () {
      updateDisplays(controllerArray);
    });
  }
  Common.each(controllerArray, function (c) {
    c.updateDisplay();
  });
}

var color = {
  Color: Color,
  math: ColorMath,
  interpret: interpret,
};
var controllers = {
  Controller: Controller,
  BooleanController: BooleanController,
  OptionController: OptionController,
  StringController: StringController,
  NumberController: NumberController,
  NumberControllerBox: NumberControllerBox,
  NumberControllerSlider: NumberControllerSlider,
  FunctionController: FunctionController,
  TabbedController: TabbedController,
  ColorController: ColorController,
  FileController: FileController,
  PlotterController: PlotterController,
  CustomController: CustomController,
  ImageController: ImageController,
  ArrayController: ArrayController,
};
var dom$1 = {
  dom: dom,
};
var gui = {
  GUI: GUI,
};
var GUI$1 = GUI;
var datGUI = {
  color: color,
  controllers: controllers,
  dom: dom$1,
  gui: gui,
  GUI: GUI$1,
};

export default datGUI;
export { GUI$1 as GUI, color, controllers, dom$1 as dom, gui };
