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

(function (global, factory) {
  typeof exports === "object" && typeof module !== "undefined"
    ? factory(exports)
    : typeof define === "function" && define.amd
    ? define(["exports"], factory)
    : ((global = global || self), factory((global.dat = {})));
})(this, function (exports) {
  "use strict";

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
      return obj !== obj;
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
      return obj === obj + "";
    },
    isBoolean: function isBoolean(obj) {
      return obj === false || obj === true;
    },
    isFunction: function isFunction(obj) {
      return obj instanceof Function;
    },
    hasOwnProperty: function hasOwnProperty(obj, prop) {
      var proto = obj.constructor.prototype;
      var proto_prop;
      try {
        proto_prop = proto[prop];
      } catch (err) {
        console.warn('property "' + prop + '" is unaccessible in prototype of object', obj);
      }
      return prop in obj && (!(prop in proto) || proto_prop !== obj[prop]);
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
      this.__onChange = undefined;
      this.__onFinishChange = undefined;
    }
    var _proto = Controller.prototype;
    _proto.onChange = function onChange(fnc) {
      this.__onChange = fnc;
      return this;
    };
    _proto.onFinishChange = function onFinishChange(fnc) {
      this.__onFinishChange = fnc;
      return this;
    };
    _proto.setValue = function setValue(newValue) {
      this.object[this.property] = newValue;
      if (this.__onChange) {
        this.__onChange.call(this, newValue);
      }
      this.updateDisplay();
      return this;
    };
    _proto.getValue = function getValue() {
      return this.object[this.property];
    };
    _proto.updateDisplay = function updateDisplay() {
      return this;
    };
    _proto.isModified = function isModified() {
      return this.initialValue !== this.getValue();
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
    bind: function bind(elem, event, func, bool) {
      bool = bool || false;
      if (elem.addEventListener) {
        elem.addEventListener(event, func, bool);
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
        _this.setValue(!_this.__prev);
      }
      dom.bind(_this2.__checkbox, "change", onChange, false);
      _this2.domElement.appendChild(_this2.__checkbox);
      _this2.updateDisplay();
      return _this2;
    }
    var _proto = BooleanController.prototype;
    _proto.setValue = function setValue(v) {
      var toReturn = _Controller.prototype.setValue.call(this, v);
      if (this.__onFinishChange) {
        this.__onFinishChange.call(this, this.getValue());
      }
      this.__prev = this.getValue();
      return toReturn;
    };
    _proto.updateDisplay = function updateDisplay() {
      if (this.getValue() === true) {
        this.__checkbox.setAttribute("checked", "checked");
        this.__checkbox.checked = true;
      } else {
        this.__checkbox.checked = false;
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
      dom.bind(_this2.__select, "change", function () {
        var desiredValue = this.options[this.selectedIndex].value;
        _this.setValue(desiredValue);
      });
      _this2.domElement.appendChild(_this2.__select);
      return _this2;
    }
    var _proto = OptionController.prototype;
    _proto.setValue = function setValue(v) {
      var toReturn = _Controller.prototype.setValue.call(this, v);
      if (this.__onFinishChange) {
        this.__onFinishChange.call(this, this.getValue());
      }
      return toReturn;
    };
    _proto.updateDisplay = function updateDisplay() {
      if (dom.isActive(this.__select)) {
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
        _this.setValue(_this.__input.value);
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
      dom.bind(_this2.__input, "keyup", onChange);
      dom.bind(_this2.__input, "change", onChange);
      dom.bind(_this2.__input, "blur", onBlur);
      dom.bind(_this2.__input, "keydown", onKeyDown);
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
    return 0;
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
    _proto.setValue = function setValue(v) {
      if (this.__min != null && v < this.__min) {
        v = this.__min;
      } else if (this.__max != null && v > this.__max) {
        v = this.__max;
      }
      if (this.__step != null && v % this.__step !== 0) {
        v = Math.round(v / this.__step) * this.__step;
      }
      return _Controller.prototype.setValue.call(this, v);
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
      _this2.__truncationSuspended = false;
      var _this = _assertThisInitialized(_this2);
      var prev_y;
      function onKeyDown(e) {
        if (e.keyCode === 13) {
          _this.__truncationSuspended = true;
          this.blur();
          _this.__truncationSuspended = false;
        }
      }
      function onChange(e) {
        var attempted = parseFloat(_this.__input.value);
        if (!Common.isNaN(attempted)) {
          _this.setValue(attempted);
        }
      }
      function onBlur(e) {
        onChange();
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
      function onMouseUp(e) {
        dom.unbind(window, "mousemove", onMouseDrag);
        dom.unbind(window, "mouseup", onMouseUp);
      }
      _this2.__input = document.createElement("input");
      _this2.__input.setAttribute("type", "text");
      dom.bind(_this2.__input, "change", onChange);
      dom.bind(_this2.__input, "blur", onBlur);
      dom.bind(_this2.__input, "mousedown", onMouseDown);
      dom.bind(_this2.__input, "keydown", onKeyDown);
      _this2.updateDisplay();
      _this2.domElement.appendChild(_this2.__input);
      return _this2;
    }
    var _proto = NumberControllerBox.prototype;
    _proto.updateDisplay = function updateDisplay() {
      if (dom.isActive(this.__input)) {
        return this;
      }
      this.__input.value = this.__truncationSuspended
        ? this.getValue()
        : roundToDecimal(this.getValue(), this.__precision);
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
      dom.addClass(_this2.__background, "slider");
      dom.addClass(_this2.__foreground, "slider-fg");
      function onMouseDown(e) {
        dom.bind(window, "mousemove", onMouseDrag);
        dom.bind(window, "mouseup", onMouseUp);
        onMouseDrag(e);
      }
      function onMouseDrag(e) {
        e.preventDefault();
        var offset = dom.getOffset(_this.__background);
        var width = dom.getWidth(_this.__background);
        _this.setValue(map(e.clientX, offset.left, offset.left + width, _this.__min, _this.__max));
        return false;
      }
      function onMouseUp(e) {
        dom.unbind(window, "mousemove", onMouseDrag);
        dom.unbind(window, "mouseup", onMouseUp);
        if (_this.__onFinishChange) {
          _this.__onFinishChange.call(_this, _this.getValue());
        }
      }
      _this2.updateDisplay();
      _this2.__background.appendChild(_this2.__foreground);
      _this2.domElement.appendChild(_this2.__background);
      return _this2;
    }
    var _proto = NumberControllerSlider.prototype;
    _proto.updateDisplay = function updateDisplay() {
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
        return false;
      });
      dom.addClass(_this2.__button, "button");
      _this2.domElement.appendChild(_this2.__button);
      return _this2;
    }
    var _proto = FunctionController.prototype;
    _proto.fire = function fire() {
      if (this.__onChange) {
        this.__onChange.call(this);
      }
      this.getValue().call(this.object);
      if (this.__onFinishChange) {
        this.__onFinishChange.call(this, this.getValue());
      }
    };
    return FunctionController;
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
      dom.bind(_this2.__input, "keydown", function (e) {
        if (e.keyCode === 13) {
          onBlur.call(this);
        }
      });
      dom.bind(_this2.__input, "blur", onBlur);
      dom.bind(_this2.__selector, "mousedown", function (e) {
        dom.addClass(this, "drag").bind(window, "mouseup", function (e) {
          dom.removeClass(_this.__selector, "drag");
        });
      });
      var value_field = document.createElement("div");
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
      Common.extend(value_field.style, {
        width: "100%",
        height: "100%",
        background: "none",
      });
      linearGradient(value_field, "top", "rgba(0,0,0,0)", "#000");
      Common.extend(_this2.__hue_field.style, {
        width: "15px",
        height: "100px",
        display: "inline-block",
        border: "1px solid #555",
        cursor: "ns-resize",
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
      dom.bind(_this2.__field_knob, "mousedown", fieldDown);
      dom.bind(_this2.__hue_field, "mousedown", function (e) {
        setH(e);
        dom.bind(window, "mousemove", setH);
        dom.bind(window, "mouseup", unbindH);
      });
      function fieldDown(e) {
        setSV(e);
        dom.bind(window, "mousemove", setSV);
        dom.bind(window, "mouseup", unbindSV);
      }
      function unbindSV() {
        dom.unbind(window, "mousemove", setSV);
        dom.unbind(window, "mouseup", unbindSV);
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
      function unbindH() {
        dom.unbind(window, "mousemove", setH);
        dom.unbind(window, "mouseup", unbindH);
      }
      _this2.__saturation_field.appendChild(value_field);
      _this2.__selector.appendChild(_this2.__field_knob);
      _this2.__selector.appendChild(_this2.__saturation_field);
      _this2.__selector.appendChild(_this2.__hue_field);
      _this2.__hue_field.appendChild(_this2.__hue_knob);
      _this2.domElement.appendChild(_this2.__input);
      _this2.domElement.appendChild(_this2.__selector);
      _this2.updateDisplay();
      function setSV(e) {
        e.preventDefault();
        var w = dom.getWidth(_this.__saturation_field);
        var h = dom.getHeight(_this.__saturation_field);
        var o = dom.getOffset(_this.__saturation_field);
        var s = (e.clientX - o.left + document.body.scrollLeft) / w;
        var v = 1 - (e.clientY - o.top + document.body.scrollTop) / h;
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
        var s = dom.getHeight(_this.__hue_field);
        var o = dom.getOffset(_this.__hue_field);
        var h = 1 - (e.clientY - o.top + document.body.scrollTop) / s;
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
        backgroundColor: this.__temp.toString(),
        border: this.__field_knob_border + "rgb(" + flip + "," + flip + "," + flip + ")",
      });
      this.__hue_knob.style.marginTop = (1 - this.__color.h / 360) * 100 + "px";
      this.__temp.s = 1;
      this.__temp.v = 1;
      linearGradient(this.__saturation_field, "left", "#fff", this.__temp.toString());
      this.__input.value = this.__color.toString();
      Common.extend(this.__input.style, {
        backgroundColor: this.__color.toString(),
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

  var UndefinedController = (function (_Controller) {
    _inheritsLoose(UndefinedController, _Controller);
    function UndefinedController(object, property) {
      var _this2;
      _this2 = _Controller.call(this, object, property) || this;
      var _this = _assertThisInitialized(_this2);
      _this2.__input = document.createElement("input");
      _this2.__input.setAttribute("type", "text");
      _this2.__input.setAttribute("disabled", true);
      _this2.domElement.appendChild(_this2.__input);
      return _this2;
    }
    var _proto = UndefinedController.prototype;
    _proto.updateDisplay = function updateDisplay() {
      if (this.__onFinishChange) {
        if (!common.isUndefined(this.object[this.property])) {
          this.__onFinishChange.call(this.object[this.property]);
        }
      }
      return _Controller.prototype.updateDisplay.call(this);
    };
    return UndefinedController;
  })(Controller);

  function requestAnimationFrame(callback, element) {
    setTimeout(callback, 1000 / 60);
  }
  var requestAnimationFrame$1 =
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    requestAnimationFrame;

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

  var ARR_SLICE$1 = Array.prototype.slice;
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
  var auto_place_virgin = true;
  var auto_place_container;
  var hide = false;
  var hideable_guis = [];
  var GUI = (function () {
    function GUI(params) {
      var _this = this;
      this.domElement = document.createElement("div");
      this.__ul = document.createElement("ul");
      this.domElement.appendChild(this.__ul);
      dom.addClass(this.domElement, CSS_NAMESPACE);
      this.__folders = {};
      this.__controllers = [];
      this.__rememberedObjects = [];
      this.__rememberedObjectIndecesToControllers = [];
      this.__listening = [];
      params = params || {};
      params = Common.defaults(params, {
        autoPlace: true,
        width: GUI.DEFAULT_WIDTH,
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
        hideable_guis.push(this);
      }
      params.resizable = Common.isUndefined(params.parent) && params.resizable;
      if (params.autoPlace && Common.isUndefined(params.scrollable)) {
        params.scrollable = true;
      }
      var use_local_storage =
        SUPPORTS_LOCAL_STORAGE && localStorage.getItem(getLocalStorageHash(this, "isLocal")) === "true";
      var saveToLocalStorage;
      Object.defineProperties(this, {
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
            return params.name;
          },
          set: function set(v) {
            if (v !== params.name && _this.__folders[v] !== undefined) {
              throw new Error("name collision: another sibling GUI folder has the same name");
            }
            params.name = v;
            if (title_row_name) {
              title_row_name.innerHTML = params.name;
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
            return use_local_storage;
          },
          set: function set(bool) {
            if (SUPPORTS_LOCAL_STORAGE) {
              use_local_storage = bool;
              if (bool) {
                dom.bind(window, "unload", saveToLocalStorage);
              } else {
                dom.unbind(window, "unload", saveToLocalStorage);
              }
              localStorage.setItem(getLocalStorageHash(_this, "isLocal"), bool);
            }
          },
        },
      });
      if (Common.isUndefined(params.parent)) {
        params.closed = false;
        dom.addClass(this.domElement, GUI.CLASS_MAIN);
        dom.makeSelectable(this.domElement, false);
        if (SUPPORTS_LOCAL_STORAGE) {
          if (use_local_storage) {
            _this.useLocalStorage = true;
            var saved_gui = localStorage.getItem(getLocalStorageHash(this, "gui"));
            if (saved_gui) {
              params.load = JSON.parse(saved_gui);
            }
          }
        }
        this.__closeButton = document.createElement("div");
        this.__closeButton.innerHTML = GUI.TEXT_CLOSED;
        dom.addClass(this.__closeButton, GUI.CLASS_CLOSE_BUTTON);
        this.domElement.appendChild(this.__closeButton);
        dom.bind(this.__closeButton, "click", function () {
          _this.closed = !_this.closed;
        });
      } else {
        if (params.closed === undefined) {
          params.closed = true;
        }
        var title_row_name = document.createTextNode(params.name);
        dom.addClass(title_row_name, "controller-name");
        var title_row = addRow(_this, title_row_name);
        var on_click_title = function on_click_title(e) {
          e.preventDefault();
          _this.closed = !_this.closed;
          return false;
        };
        dom.addClass(this.__ul, GUI.CLASS_CLOSED);
        dom.addClass(title_row, "title");
        dom.bind(title_row, "click", on_click_title);
        if (!params.closed) {
          this.closed = false;
        }
      }
      if (params.autoPlace) {
        if (Common.isUndefined(params.parent)) {
          if (auto_place_virgin) {
            auto_place_container = document.createElement("div");
            dom.addClass(auto_place_container, CSS_NAMESPACE);
            dom.addClass(auto_place_container, GUI.CLASS_AUTO_PLACE_CONTAINER);
            document.body.appendChild(auto_place_container);
            auto_place_virgin = false;
          }
          auto_place_container.appendChild(this.domElement);
          dom.addClass(this.domElement, GUI.CLASS_AUTO_PLACE);
        }
        if (!this.parent) {
          setWidth(_this, params.width);
        }
      }
      function __resizeHandler() {
        _this.onResize();
      }
      dom.bind(settings.WINDOW, "resize", __resizeHandler);
      dom.bind(this.__ul, "webkitTransitionEnd", __resizeHandler);
      dom.bind(this.__ul, "transitionend", __resizeHandler);
      dom.bind(this.__ul, "oTransitionEnd", __resizeHandler);
      this.onResize();
      if (params.resizable) {
        addResizeHandle(this);
      }
      saveToLocalStorage = function saveToLocalStorage() {
        if (SUPPORTS_LOCAL_STORAGE && localStorage.getItem(getLocalStorageHash(_this, "isLocal")) === "true") {
          localStorage.setItem(getLocalStorageHash(_this, "gui"), JSON.stringify(_this.getSaveObject()));
        }
      };
      this.saveToLocalStorageIfPossible = saveToLocalStorage;
      var root = _this.getRoot();
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
    }
    var _proto = GUI.prototype;
    _proto.toggleHide = function toggleHide() {
      hide = !hide;
      Common.each(hideable_guis, function (gui) {
        gui.domElement.style.zIndex = hide ? -999 : 999;
        gui.domElement.style.opacity = hide ? 0 : 1;
      });
    };
    _proto._keydownHandler = function _keydownHandler(e) {
      if (document.activeElement.type !== "text" && (e.which === HIDE_KEY_CODE || e.keyCode == HIDE_KEY_CODE)) {
        GUI.toggleHide();
      }
    };
    _proto.add = function add(object, property) {
      return _add(this, object, property, {
        factoryArgs: Array.prototype.slice.call(arguments, 2),
      });
    };
    _proto.addColor = function addColor(object, property) {
      return _add(this, object, property, {
        color: true,
      });
    };
    _proto.remove = function remove(controller) {
      this.__ul.removeChild(controller.__li);
      var ixl = this.__listening.indexOf(controller);
      if (ixl > 0) this.__listening.pop(ixl);
      this.__controllers.pop(this.__controllers.indexOf(controller));
      var _this = this;
      Common.defer(function () {
        _this.onResize();
      });
    };
    _proto.destroy = function destroy() {
      if (this.autoPlace) {
        auto_place_container.removeChild(this.domElement);
      }
    };
    _proto.addFolder = function addFolder(name) {
      if (this.__folders[name] !== undefined) {
        throw new Error('You already have a folder in this GUI by the name "' + name + '"');
      }
      var new_gui_params = {
        name: name,
        parent: this,
      };
      new_gui_params.autoPlace = this.autoPlace;
      if (this.load && this.load.folders && this.load.folders[name]) {
        new_gui_params.closed = this.load.folders[name].closed;
        new_gui_params.load = this.load.folders[name];
      }
      var gui = new GUI(new_gui_params);
      this.__folders[name] = gui;
      var li = addRow(this, gui.domElement);
      dom.addClass(li, "folder");
      return gui;
    };
    _proto.open = function open() {
      this.closed = false;
    };
    _proto.close = function close() {
      this.closed = true;
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
        if (window.innerHeight - top - CLOSE_BUTTON_HEIGHT < h) {
          dom.addClass(root.domElement, GUI.CLASS_TOO_TALL);
          root.__ul.style.height = window.innerHeight - top - CLOSE_BUTTON_HEIGHT + "px";
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
      Common.each(ARR_SLICE$1.call(arguments), function (object) {
        if (_this.__rememberedObjects.length === 0) {
          addSaveMenu(_this);
        }
        if (_this.__rememberedObjects.indexOf(object) === -1) {
          _this.__rememberedObjects.push(object);
        }
      });
      if (this.autoPlace) {
        setWidth(this, this.width);
      }
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
    };
    _proto.revert = function revert(gui) {
      Common.each(
        this.__controllers,
        function (controller) {
          if (!this.getRoot().load.remembered) {
            controller.setValue(controller.initialValue);
          } else {
            recallSavedValue(gui || this.getRoot(), controller);
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
    };
    _proto.listen = function listen(controller) {
      var init = this.__listening.length == 0;
      this.__listening.push(controller);
      if (init) {
        updateDisplays(this.__listening);
      }
    };
    _proto.updateDisplay = function updateDisplay() {
      for (var c in this.__controllers) {
        this.__controllers[c].updateDisplay();
      }
      for (var f in this.__folders) {
        this.__folders[f].updateDisplay();
      }
    };
    return GUI;
  })();
  GUI.CLASS_AUTO_PLACE = "a";
  GUI.CLASS_AUTO_PLACE_CONTAINER = "ac";
  GUI.CLASS_MAIN = "main";
  GUI.CLASS_CONTROLLER_ROW = "cr";
  GUI.CLASS_TOO_TALL = "taller-than-window";
  GUI.CLASS_CLOSED = "closed";
  GUI.CLASS_CLOSE_BUTTON = "close-button";
  GUI.CLASS_DRAG = "drag";
  GUI.DEFAULT_WIDTH = 245;
  GUI.TEXT_CLOSED = "Close Controls";
  GUI.TEXT_OPEN = "Open Controls";
  function _add(gui, object, property, params) {
    if (!(property in object)) {
      throw new Error("Object " + object + ' has no property "' + property + '"');
    }
    var controller;
    if (params.color) {
      controller = new ColorController(object, property);
    } else {
      var factoryArgs = [object, property].concat(params.factoryArgs);
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
    var name = document.createElement("span");
    dom.addClass(name, "property-name");
    name.innerHTML = controller.property;
    var container = document.createElement("div");
    container.appendChild(name);
    container.appendChild(controller.domElement);
    var li = addRow(gui, container, params.before);
    dom.addClass(li, GUI.CLASS_CONTROLLER_ROW);
    dom.addClass(li, typeof controller.getValue());
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
      gui.__ul.insertBefore(li, params.before);
    } else {
      gui.__ul.appendChild(li);
    }
    gui.onResize();
    return li;
  }
  function augmentController(gui, li, controller) {
    controller.__li = li;
    controller.__gui = gui;
    Common.extend(controller, {
      options: function options(_options) {
        if (arguments.length > 1) {
          controller.remove();
          return _add(gui, controller.object, controller.property, {
            before: controller.__li.nextElementSibling,
            factoryArgs: [Common.toArray(arguments)],
          });
        }
        if (Common.isArray(_options) || Common.isObject(_options)) {
          controller.remove();
          return _add(gui, controller.object, controller.property, {
            before: controller.__li.nextElementSibling,
            factoryArgs: [_options],
          });
        }
      },
      name: function name(_name) {
        controller.__li.firstElementChild.firstElementChild.innerHTML = _name;
        return controller;
      },
      listen: function listen() {
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
      Common.each(["updateDisplay", "onChange", "onFinishChange"], function (method) {
        var pc = controller[method];
        var pb = box[method];
        controller[method] = box[method] = function () {
          var args = ARR_SLICE$1.call(arguments);
          pc.apply(controller, args);
          return pb.apply(box, args);
        };
      });
      dom.addClass(li, "has-slider");
      controller.domElement.insertBefore(box.domElement, controller.domElement.firstElementChild);
    } else if (controller instanceof NumberControllerBox) {
      var r = function r(returned) {
        if (Common.isNumber(controller.__min) && Common.isNumber(controller.__max)) {
          controller.remove();
          var newController = _add(gui, controller.object, controller.property, {
            before: controller.__li.nextElementSibling,
            factoryArgs: [controller.__min, controller.__max, controller.__step],
          });
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
    } else if (controller instanceof FunctionController) {
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
      controller.updateDisplay = Common.compose(function (r) {
        li.style.borderLeftColor = controller.__color.toString();
        return r;
      }, controller.updateDisplay);
      controller.updateDisplay();
    } else if (controller instanceof UndefinedController) {
      controller.__onFinishChange = function (val) {
        controller.remove();
        return _add(gui, controller.object, controller.property, {
          before: controller.__li.nextElementSibling,
        });
      };
    }
    controller.setValue = Common.compose(function (r) {
      if (gui.getRoot().__preset_select && controller.isModified()) {
        markPresetModified(gui.getRoot(), true);
      }
      return r;
    }, controller.setValue);
  }
  function recallSavedValue(gui, controller) {
    var root = gui.getRoot();
    var matched_index = root.__rememberedObjects.indexOf(controller.object);
    if (matched_index !== -1) {
      var controller_map = root.__rememberedObjectIndecesToControllers[matched_index];
      if (controller_map === undefined) {
        controller_map = {};
        root.__rememberedObjectIndecesToControllers[matched_index] = controller_map;
      }
      controller_map[controller.property] = controller;
      if (root.load && root.load.remembered) {
        var preset_map = root.load.remembered;
        var preset;
        if (preset_map[gui.preset]) {
          preset = preset_map[gui.preset];
        } else if (preset_map[DEFAULT_DEFAULT_PRESET_NAME]) {
          preset = preset_map[DEFAULT_DEFAULT_PRESET_NAME];
        } else {
          return;
        }
        if (preset[matched_index] && preset[matched_index][controller.property] !== undefined) {
          var value = preset[matched_index][controller.property];
          controller.initialValue = value;
          controller.setValue(value);
        }
      }
    }
  }
  function getLocalStorageHash(gui, key) {
    return document.location.href + "." + key;
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
    function showHideExplain() {
      explain.style.display = gui.useLocalStorage ? "block" : "none";
    }
    if (SUPPORTS_LOCAL_STORAGE) {
      var saveLocally = document.getElementById("dg-save-locally");
      var _explain = document.getElementById("dg-local-explain");
      saveLocally.style.display = "block";
      var localStorageCheckBox = document.getElementById("dg-local-storage");
      if (localStorage.getItem(getLocalStorageHash(gui, "isLocal")) === "true") {
        localStorageCheckBox.setAttribute("checked", "checked");
      }
      showHideExplain();
      dom.bind(localStorageCheckBox, "change", function () {
        gui.useLocalStorage = !gui.useLocalStorage;
        showHideExplain();
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
  }
  function addResizeHandle(gui) {
    gui.__resize_handle = document.createElement("div");
    Common.extend(gui.__resize_handle.style, {
      width: "6px",
      marginLeft: "-3px",
      height: "200px",
      cursor: "ew-resize",
      position: "absolute",
    });
    var pmouseX;
    dom.bind(gui.__resize_handle, "mousedown", dragStart);
    dom.bind(gui.__closeButton, "mousedown", dragStart);
    gui.domElement.insertBefore(gui.__resize_handle, gui.domElement.firstElementChild);
    function dragStart(e) {
      e.preventDefault();
      pmouseX = e.clientX;
      dom.addClass(gui.__closeButton, GUI.CLASS_DRAG);
      dom.bind(window, "mousemove", drag);
      dom.bind(window, "mouseup", dragStop);
      return false;
    }
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
      var saved_values = {};
      var controller_map = gui.__rememberedObjectIndecesToControllers[index];
      Common.each(controller_map, function (controller, property) {
        saved_values[property] = useInitialValues ? controller.initialValue : controller.getValue();
      });
      toReturn[index] = saved_values;
    });
    return toReturn;
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
  function setPresetSelectIndex(gui) {
    for (var index = 0; index < gui.__preset_select.length; index++) {
      if (gui.__preset_select[index].value === gui.preset) {
        gui.__preset_select.selectedIndex = index;
      }
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
  function updateDisplays(controllerArray) {
    if (controllerArray.length !== 0) {
      requestAnimationFrame$1(function () {
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
    ColorController: ColorController,
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

  exports.GUI = GUI$1;
  exports.color = color;
  exports.controllers = controllers;
  exports.default = datGUI;
  exports.dom = dom$1;
  exports.gui = gui;

  Object.defineProperty(exports, "__esModule", { value: true });
});
