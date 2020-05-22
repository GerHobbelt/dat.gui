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

/** @namespace */
var dat = dat || {};

/** @namespace */
dat.gui = dat.gui || {};

/** @namespace */
dat.utils = dat.utils || {};

/** @namespace */
dat.controllers = dat.controllers || {};

/** @namespace */
dat.dom = dat.dom || {};

/** @namespace */
dat.color = dat.color || {};

dat.gui.settings = (function () {
  return {
    WINDOW: window.GUI_WINDOW || window,
    DOCUMENT: document.GUI_DOCUMENT || document,
  };
})();
dat.easing = dat.easing || {};

dat.utils.css = (function (settings) {
  return {
    load: function (url, doc) {
      doc = doc || settings.DOCUMENT;
      var link = doc.createElement("link");
      link.type = "text/css";
      link.rel = "stylesheet";
      link.href = url;
      doc.getElementsByTagName("head")[0].appendChild(link);
    },
    inject: function (css, doc) {
      doc = doc || settings.DOCUMENT;
      var injected = settings.DOCUMENT.createElement("style");
      injected.type = "text/css";
      injected.innerHTML = css;
      doc.getElementsByTagName("head")[0].appendChild(injected);
    },
  };
})(dat.gui.settings);

dat.utils.common = (function () {
  var ARR_EACH = Array.prototype.forEach;
  var ARR_SLICE = Array.prototype.slice;

  /**
   * Band-aid methods for things that should be a lot easier in JavaScript.
   * Implementation and structure inspired by underscore.js
   * http://documentcloud.github.com/underscore/
   */

  return {
    BREAK: {},

    extend: function (target) {
      this.each(
        ARR_SLICE.call(arguments, 1),
        function (obj) {
          for (var key in obj) if (!this.isUndefined(obj[key])) target[key] = obj[key];
        },
        this
      );

      return target;
    },

    defaults: function (target) {
      this.each(
        ARR_SLICE.call(arguments, 1),
        function (obj) {
          for (var key in obj) if (this.isUndefined(target[key])) target[key] = obj[key];
        },
        this
      );

      return target;
    },

    compose: function () {
      var toCall = ARR_SLICE.call(arguments);
      return function () {
        var args = ARR_SLICE.call(arguments);
        for (var i = toCall.length - 1; i >= 0; i--) {
          args = [toCall[i].apply(this, args)];
        }
        return args[0];
      };
    },

    each: function (obj, itr, scope) {
      if (!obj) return;

      if (ARR_EACH && obj.forEach && obj.forEach === ARR_EACH) {
        obj.forEach(itr, scope);
      } else if (obj.length === obj.length + 0) {
        // Is number but not NaN

        for (var key = 0, l = obj.length; key < l; key++) {
          if (key in obj && itr.call(scope, obj[key], key) === this.BREAK) return;
        }
      } else {
        for (var key in obj) if (itr.call(scope, obj[key], key) === this.BREAK) return;
      }
    },

    defer: function (fnc) {
      setTimeout(fnc, 0);
    },

    toArray: function (obj) {
      if (obj.toArray) return obj.toArray();
      return ARR_SLICE.call(obj);
    },

    isUndefined: function (obj) {
      return obj === undefined;
    },

    isNull: function (obj) {
      return obj === null;
    },

    isNaN: function (obj) {
      return obj !== obj;
    },

    isArray:
      Array.isArray ||
      function (obj) {
        return obj.constructor === Array;
      },

    isObject: function (obj) {
      return obj === Object(obj);
    },

    isNumber: function (obj) {
      return obj === obj + 0;
    },

    isString: function (obj) {
      return obj === obj + "";
    },

    isBoolean: function (obj) {
      return obj === false || obj === true;
    },

    isFunction: function (obj) {
      return Object.prototype.toString.call(obj) === "[object Function]";
    },
  };
})();

dat.controllers.Controller = (function (settings, common) {
  /**
   * @class An "abstract" class that represents a given property of an object.
   *
   * @param {Object} object The object to be manipulated
   * @param {string} property The name of the property to be manipulated
   *
   * @member dat.controllers
   */
  var Controller = function (object, property) {
    this.initialValue = object[property];

    /**
     * Those who extend this class will put their DOM elements in here.
     * @type {DOMElement}
     */
    this.domElement = settings.DOCUMENT.createElement("div");

    /**
     * The object to manipulate
     * @type {Object}
     */
    this.object = object;

    /**
     * The name of the property to manipulate
     * @type {String}
     */
    this.property = property;

    /**
     * The function to be called on change.
     * @type {Function}
     * @ignore
     */
    this.__onChange = undefined;

    /**
     * The function to be called on finishing change.
     * @type {Function}
     * @ignore
     */
    this.__onFinishChange = undefined;
  };

  common.extend(
    Controller.prototype,

    /** @lends dat.controllers.Controller.prototype */
    {
      /**
       * Specify that a function fire every time someone changes the value with
       * this Controller.
       *
       * @param {Function} fnc This function will be called whenever the value
       * is modified via this Controller.
       * @returns {dat.controllers.Controller} this
       */
      onChange: function (fnc) {
        this.__onChange = fnc;
        return this;
      },

      /**
       * Specify that a function fire every time someone "finishes" changing
       * the value wih this Controller. Useful for values that change
       * incrementally like numbers or strings.
       *
       * @param {Function} fnc This function will be called whenever
       * someone "finishes" changing the value via this Controller.
       * @returns {dat.controllers.Controller} this
       */
      onFinishChange: function (fnc) {
        this.__onFinishChange = fnc;
        return this;
      },

      /**
       * Change the value of <code>object[property]</code>
       *
       * @param {Object} newValue The new value of <code>object[property]</code>
       */
      setValue: function (newValue) {
        this.object[this.property] = newValue;
        if (this.__onChange) {
          this.__onChange.call(this, newValue);
        }
        this.updateDisplay();
        return this;
      },

      /**
       * Gets the value of <code>object[property]</code>
       *
       * @returns {Object} The current value of <code>object[property]</code>
       */
      getValue: function () {
        return this.object[this.property];
      },

      /**
       * Set the drop handler
       *
       * @param {function} handler
       */
      setDropHandler: function (handler) {
        this.domElement.ondragover = function (event) {
          event.preventDefault();
        };
        this.domElement.ondrop = function (event) {
          event.preventDefault();
          handler.call(this, event.dataTransfer.getData("text"));
        };

        return this;
      },

      /**
       * Refreshes the visual display of a Controller in order to keep sync
       * with the object's current value.
       * @returns {dat.controllers.Controller} this
       */
      updateDisplay: function () {
        return this;
      },

      /**
       * @returns {Boolean} true if the value has deviated from initialValue
       */
      isModified: function () {
        return this.initialValue !== this.getValue();
      },
    }
  );

  return Controller;
})(dat.gui.settings, dat.utils.common);

dat.dom.dom = (function (settings, common) {
  var EVENT_MAP = {
    HTMLEvents: ["change"],
    MouseEvents: ["click", "mousemove", "mousedown", "mouseup", "mouseover"],
    KeyboardEvents: ["keydown"],
  };

  var EVENT_MAP_INV = {};
  common.each(EVENT_MAP, function (v, k) {
    common.each(v, function (e) {
      EVENT_MAP_INV[e] = k;
    });
  });

  var CSS_VALUE_PIXELS = /(\d+(\.\d+)?)px/;

  function cssValueToPixels(val) {
    if (val === "0" || common.isUndefined(val)) return 0;

    var match = val.match(CSS_VALUE_PIXELS);

    if (!common.isNull(match)) {
      return parseFloat(match[1]);
    }

    // TODO ...ems? %?

    return 0;
  }

  /**
   * @namespace
   * @member dat.dom
   */
  var dom = {
    /**
     *
     * @param elem
     * @param selectable
     */
    makeSelectable: function (elem, selectable) {
      if (elem === undefined || elem.style === undefined) return;

      elem.onselectstart = selectable
        ? function () {
            return false;
          }
        : function () {};

      elem.style.MozUserSelect = selectable ? "auto" : "none";
      elem.style.KhtmlUserSelect = selectable ? "auto" : "none";
      elem.unselectable = selectable ? "on" : "off";
    },

    /**
     *
     * @param elem
     * @param horizontal
     * @param vertical
     */
    makeFullscreen: function (elem, horizontal, vertical) {
      if (common.isUndefined(horizontal)) horizontal = true;
      if (common.isUndefined(vertical)) vertical = true;

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

    /**
     *
     * @param elem
     * @param eventType
     * @param params
     */
    fakeEvent: function (elem, eventType, params, aux) {
      params = params || {};
      var className = EVENT_MAP_INV[eventType];
      if (!className) {
        throw new Error("Event type " + eventType + " not supported.");
      }
      var evt = settings.DOCUMENT.createEvent(className);
      switch (className) {
        case "MouseEvents":
          var clientX = params.x || params.clientX || 0;
          var clientY = params.y || params.clientY || 0;
          evt.initMouseEvent(
            eventType,
            params.bubbles || false,
            params.cancelable || true,
            settings.WINDOW,
            params.clickCount || 1,
            0, // screen X
            0, // screen Y
            clientX, // client X
            clientY, // client Y
            false,
            false,
            false,
            false,
            0,
            null
          );
          break;
        case "KeyboardEvents":
          var init = evt.initKeyboardEvent || evt.initKeyEvent; // webkit || moz
          common.defaults(params, {
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
            settings.WINDOW,
            params.ctrlKey,
            params.altKey,
            params.shiftKey,
            params.metaKey,
            params.keyCode,
            params.charCode
          );
          break;
        default:
          evt.initEvent(eventType, params.bubbles || false, params.cancelable || true);
          break;
      }
      common.defaults(evt, aux);
      elem.dispatchEvent(evt);
    },

    /**
     *
     * @param elem
     * @param event
     * @param func
     * @param bool
     */
    bind: function (elem, event, func, bool) {
      bool = bool || false;
      if (elem.addEventListener) elem.addEventListener(event, func, bool);
      else if (elem.attachEvent) elem.attachEvent("on" + event, func);
      return dom;
    },

    /**
     *
     * @param elem
     * @param event
     * @param func
     * @param bool
     */
    unbind: function (elem, event, func, bool) {
      bool = bool || false;
      if (elem.removeEventListener) elem.removeEventListener(event, func, bool);
      else if (elem.detachEvent) elem.detachEvent("on" + event, func);
      return dom;
    },

    /**
     *
     * @param elem
     * @param className
     */
    addClass: function (elem, className) {
      if (elem.className === undefined) {
        elem.className = className;
      } else if (elem.className !== className) {
        var classes = elem.className.split(/ +/);
        if (classes.indexOf(className) == -1) {
          classes.push(className);
          elem.className = classes.join(" ").replace(/^\s+/, "").replace(/\s+$/, "");
        }
      }
      return dom;
    },

    /**
     *
     * @param elem
     * @param className
     */
    removeClass: function (elem, className) {
      if (className) {
        if (elem.className === undefined) {
          // elem.className = className;
        } else if (elem.className === className) {
          elem.removeAttribute("class");
        } else {
          var classes = elem.className.split(/ +/);
          var index = classes.indexOf(className);
          if (index != -1) {
            classes.splice(index, 1);
            elem.className = classes.join(" ");
          }
        }
      } else {
        elem.className = undefined;
      }
      return dom;
    },

    hasClass: function (elem, className) {
      return new RegExp("(?:^|\\s+)" + className + "(?:\\s+|$)").test(elem.className) || false;
    },

    /**
     *
     * @param elem
     */
    getWidth: function (elem) {
      var style = getComputedStyle(elem);

      return (
        cssValueToPixels(style["border-left-width"]) +
        cssValueToPixels(style["border-right-width"]) +
        cssValueToPixels(style["padding-left"]) +
        cssValueToPixels(style["padding-right"]) +
        cssValueToPixels(style.width)
      );
    },

    /**
     *
     * @param elem
     */
    getHeight: function (elem) {
      var style = getComputedStyle(elem);

      return (
        cssValueToPixels(style["border-top-width"]) +
        cssValueToPixels(style["border-bottom-width"]) +
        cssValueToPixels(style["padding-top"]) +
        cssValueToPixels(style["padding-bottom"]) +
        cssValueToPixels(style.height)
      );
    },

    /**
     *
     * @param elem
     */
    getOffset: function (elem) {
      var offset = { left: 0, top: 0 };
      if (elem.offsetParent) {
        do {
          offset.left += elem.offsetLeft;
          offset.top += elem.offsetTop;
        } while ((elem = elem.offsetParent));
      }
      return offset;
    },

    // http://stackoverflow.com/posts/2684561/revisions
    /**
     *
     * @param elem
     */
    isActive: function (elem) {
      return elem === settings.DOCUMENT.activeElement && (elem.type || elem.href);
    },
  };

  return dom;
})(dat.gui.settings, dat.utils.common);

dat.controllers.OptionController = (function (settings, Controller, dom, common) {
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
  var OptionController = function (object, property, options) {
    OptionController.superclass.call(this, object, property);

    var _this = this;

    /**
     * The drop down menu
     * @ignore
     */
    this.__select = settings.DOCUMENT.createElement("select");

    if (common.isArray(options)) {
      var map = {};
      common.each(options, function (element) {
        map[element] = element;
      });
      options = map;
    }

    common.each(options, function (value, key) {
      var opt = settings.DOCUMENT.createElement("option");
      opt.innerHTML = key;
      opt.setAttribute("value", value);
      _this.__select.appendChild(opt);
    });

    // Acknowledge original value
    this.updateDisplay();

    dom.bind(this.__select, "change", function () {
      var desiredValue = this.options[this.selectedIndex].value;
      _this.setValue(desiredValue);
    });

    this.domElement.appendChild(this.__select);
  };

  OptionController.superclass = Controller;

  common.extend(
    OptionController.prototype,
    Controller.prototype,

    {
      setValue: function (v) {
        var toReturn = OptionController.superclass.prototype.setValue.call(this, v);
        if (this.__onFinishChange) {
          this.__onFinishChange.call(this, this.getValue());
        }
        return toReturn;
      },

      updateDisplay: function () {
        this.__select.value = this.getValue();
        return OptionController.superclass.prototype.updateDisplay.call(this);
      },
    }
  );

  return OptionController;
})(dat.gui.settings, dat.controllers.Controller, dat.dom.dom, dat.utils.common);

dat.controllers.NumberController = (function (Controller, common) {
  /**
   * @class Represents a given property of an object that is a number.
   *
   * @extends dat.controllers.Controller
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
  var NumberController = function (object, property, params) {
    NumberController.superclass.call(this, object, property);

    params = params || {};

    this.__min = params.min;
    this.__max = params.max;
    this.__step = params.step;

    if (common.isUndefined(this.__step)) {
      if (this.initialValue == 0) {
        this.__impliedStep = 1; // What are we, psychics?
      } else {
        // Hey Doug, check this out.
        this.__impliedStep = Math.pow(10, Math.floor(Math.log(Math.abs(this.initialValue)) / Math.LN10)) / 10;
      }
    } else {
      this.__impliedStep = this.__step;
    }

    this.__precision = numDecimals(this.__impliedStep);
  };

  NumberController.superclass = Controller;

  common.extend(
    NumberController.prototype,
    Controller.prototype,

    /** @lends dat.controllers.NumberController.prototype */
    {
      setValue: function (v) {
        if (this.__min !== undefined && v < this.__min) {
          v = this.__min;
        } else if (this.__max !== undefined && v > this.__max) {
          v = this.__max;
        }

        if (this.__step !== undefined && v % this.__step != 0) {
          v = Math.round(v / this.__step) * this.__step;
        }

        return NumberController.superclass.prototype.setValue.call(this, v);
      },

      /**
       * Specify a minimum value for <code>object[property]</code>.
       *
       * @param {Number} minValue The minimum value for
       * <code>object[property]</code>
       * @returns {dat.controllers.NumberController} this
       */
      min: function (v) {
        this.__min = v;
        return this;
      },

      /**
       * Specify a maximum value for <code>object[property]</code>.
       *
       * @param {Number} maxValue The maximum value for
       * <code>object[property]</code>
       * @returns {dat.controllers.NumberController} this
       */
      max: function (v) {
        this.__max = v;
        return this;
      },

      /**
       * Specify a step value that dat.controllers.NumberController
       * increments by.
       *
       * @param {Number} stepValue The step value for
       * dat.controllers.NumberController
       * @default if minimum and maximum specified increment is 1% of the
       * difference otherwise stepValue is 1
       * @returns {dat.controllers.NumberController} this
       */
      step: function (v) {
        this.__step = v;
        this.__impliedStep = v;
        this.__precision = numDecimals(v);
        if (this.__valueControllerBox !== undefined) {
          this.__valueControllerBox.__step = this.__step;
          this.__valueControllerBox.__impliedStep = this.__impliedStep;
          this.__valueControllerBox.__precision = this.__precision;
        }
        return this;
      },
    }
  );

  function numDecimals(x) {
    x = x.toString();
    if (x.indexOf(".") > -1) {
      return x.length - x.indexOf(".") - 1;
    } else {
      return 0;
    }
  }

  return NumberController;
})(dat.controllers.Controller, dat.utils.common);

dat.controllers.NumberControllerBox = (function (settings, NumberController, dom, common) {
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
  var NumberControllerBox = function (object, property, params) {
    this.__truncationSuspended = false;
    this.__mouseIsDown = false;

    NumberControllerBox.superclass.call(this, object, property, params);

    var _this = this;

    /**
     * {Number} Previous mouse y position
     * @ignore
     */
    var prev_y;

    this.__input = settings.DOCUMENT.createElement("input");

    if (this.__step != undefined) {
      this.__input.setAttribute("step", this.__step);
      this.__input.setAttribute("type", "number");
    } else this.__input.setAttribute("type", "text");

    // Makes it so manually specified values are not truncated.

    dom.bind(this.__input, "input", onInput);
    dom.bind(this.__input, "change", onChange);
    dom.bind(this.__input, "blur", onBlur);
    dom.bind(this.__input, "mousedown", onMouseDownDetect);
    // dom.bind(this.__input, 'mousedown', onMouseDown);
    dom.bind(this.__input, "keydown", function (e) {
      // When pressing entire, you can be as precise as you want.
      if (e.keyCode === 13) {
        _this.__truncationSuspended = true;
        this.blur();
        _this.__truncationSuspended = false;
      } else if ((e.keyCode === 38 || e.keyCode === 40) && _this.__step) {
        onChange();
      }
    });

    function onMouseDownDetect() {
      _this.__mouseIsDown = true;
      dom.bind(window, "mouseup", onMouseUpDetect);
    }

    function onMouseUpDetect() {
      _this.__mouseIsDown = false;
      dom.unbind(window, "mouseup", onMouseUpDetect);
    }

    function onChange() {
      var attempted = parseFloat(_this.__input.value);
      if (!common.isNaN(attempted)) _this.setValue(attempted);
    }

    function onInput() {
      if (!_this.__mouseIsDown) {
        return;
      }
      var attempted = parseFloat(_this.__input.value);
      if (!common.isNaN(attempted)) _this.setValue(attempted);
    }

    function onBlur() {
      var attempted = parseFloat(_this.__input.value);
      if (!common.isNaN(attempted)) _this.setValue(attempted);
      else _this.updateDisplay();

      if (_this.__onFinishChange) {
        _this.__onFinishChange.call(_this, _this.getValue());
      }
    }

    function onMouseDown(e) {
      dom.bind(settings.WINDOW, "mousemove", onMouseDrag);
      dom.bind(settings.WINDOW, "mouseup", onMouseUp);
      prev_y = e.clientY;
    }

    function onMouseDrag(e) {
      var diff = prev_y - e.clientY;
      _this.setValue(_this.getValue() + diff * _this.__impliedStep);

      prev_y = e.clientY;
    }

    function onMouseUp() {
      dom.unbind(settings.WINDOW, "mousemove", onMouseDrag);
      dom.unbind(settings.WINDOW, "mouseup", onMouseUp);
    }

    this.updateDisplay();

    this.domElement.appendChild(this.__input);
  };

  NumberControllerBox.superclass = NumberController;

  common.extend(
    NumberControllerBox.prototype,
    NumberController.prototype,

    {
      updateDisplay: function () {
        this.__input.value = this.__truncationSuspended
          ? this.getValue()
          : roundToDecimal(this.getValue(), this.__precision);
        return NumberControllerBox.superclass.prototype.updateDisplay.call(this);
      },
      step: function (v) {
        if (this.__input.getAttribute("type") != "number") this.__input.setAttribute("type", "number");
        this.__input.setAttribute("step", v);
        return NumberControllerBox.superclass.prototype.step.apply(this, arguments);
      },
    }
  );

  function roundToDecimal(value, decimals) {
    var tenTo = Math.pow(10, decimals);
    return Math.round(value * tenTo) / tenTo;
  }

  return NumberControllerBox;
})(dat.gui.settings, dat.controllers.NumberController, dat.dom.dom, dat.utils.common);

dat.controllers.NumberControllerSlider = (function (settings, NumberController, dom, css, common, styleSheet) {
  /**
   * @class Represents a given property of an object that is a number, contains
   * a minimum and maximum, and provides a slider element with which to
   * manipulate it. It should be noted that the slider element is made up of
   * <code>&lt;div&gt;</code> tags, <strong>not</strong> the html5
   * <code>&lt;slider&gt;</code> element.
   *
   * @extends dat.controllers.Controller
   * @extends dat.controllers.NumberController
   *
   * @param {Object} object The object to be manipulated
   * @param {string} property The name of the property to be manipulated
   * @param {Number} minValue Minimum allowed value
   * @param {Number} maxValue Maximum allowed value
   * @param {Number} stepValue Increment by which to change value
   * @param {Object} enumeration Dynamic object of key value pairs for enumerable values/ranges
   *
   * @member dat.controllers
   */
  var NumberControllerSlider = function (object, property, min, max, step, enumeration) {
    NumberControllerSlider.superclass.call(this, object, property, { min: min, max: max, step: step });

    var _this = this;

    this.__background = settings.DOCUMENT.createElement("div");
    this.__label = document.createElement("div");
    this.__foreground = settings.DOCUMENT.createElement("div");

    function getEnumArr(hash) {
      var arr = [];
      var k;
      for (k in hash) {
        arr.push({ key: k, value: hash[k] });
      }
      arr = arr.sort(function (a, b) {
        var result = true ? a.value < b.value : a.value > b.value;
        return result ? 1 : -1;
      });

      return arr.length > 0 ? arr : null;
    }

    if (enumeration) {
      this.enumeration = getEnumArr(enumeration);
    }

    this.__label.style.visibility = enumeration ? "visible" : "hidden";

    dom.bind(this.__background, "mousedown", onMouseDown);

    dom.addClass(this.__background, "slider");
    dom.addClass(this.__label, "label");
    dom.addClass(this.__foreground, "slider-fg");

    function onMouseDown(e) {
      dom.bind(settings.WINDOW, "mousemove", onMouseDrag);
      dom.bind(settings.WINDOW, "mouseup", onMouseUp);

      onMouseDrag(e);
    }

    function onMouseDrag(e) {
      e.preventDefault();

      var offset = dom.getOffset(_this.__background);
      var width = dom.getWidth(_this.__background);

      _this.setValue(map(e.clientX, offset.left, offset.left + width, _this.__min, _this.__max));

      return false;
    }

    function onMouseUp() {
      dom.unbind(settings.WINDOW, "mousemove", onMouseDrag);
      dom.unbind(settings.WINDOW, "mouseup", onMouseUp);
      if (_this.__onFinishChange) {
        _this.__onFinishChange.call(_this, _this.getValue());
      }
    }

    this.updateDisplay();

    this.__background.appendChild(this.__foreground);
    this.__background.appendChild(this.__label);
    this.domElement.appendChild(this.__background);
  };

  NumberControllerSlider.superclass = NumberController;

  /**
   * Injects default stylesheet for slider elements.
   */
  NumberControllerSlider.useDefaultStyles = function () {
    css.inject(styleSheet);
  };

  common.extend(
    NumberControllerSlider.prototype,
    NumberController.prototype,

    {
      updateDisplay: function () {
        var value = this.getValue();
        var pct = (value - this.__min) / (this.__max - this.__min);
        this.__foreground.style.width = pct * 100 + "%";

        this.__label.innerHTML = value;

        if (this.enumeration) {
          var chosenValue = null;
          var chosenIndex = null;
          var i = this.enumeration.length;
          while (--i > -1) {
            chosenValue = this.enumeration[i].value;
            if (value < chosenValue) {
              break;
            }
            chosenIndex = i;
          }

          if (chosenIndex == null) {
            chosenValue = "";
          } else chosenValue = this.enumeration[chosenIndex].key;

          this.__label.innerHTML = chosenValue;
        }

        return NumberControllerSlider.superclass.prototype.updateDisplay.call(this);
      },
    }
  );

  function map(v, i1, i2, o1, o2) {
    return o1 + (o2 - o1) * ((v - i1) / (i2 - i1));
  }

  return NumberControllerSlider;
})(
  dat.gui.settings,
  dat.controllers.NumberController,
  dat.dom.dom,
  dat.utils.css,
  dat.utils.common,
  "/**\r\n * dat-gui JavaScript Controller Library\r\n * http://code.google.com/p/dat-gui\r\n *\r\n * Copyright 2011 Data Arts Team, Google Creative Lab\r\n *\r\n * Licensed under the Apache License, Version 2.0 (the \"License\");\r\n * you may not use this file except in compliance with the License.\r\n * You may obtain a copy of the License at\r\n *\r\n * http://www.apache.org/licenses/LICENSE-2.0\r\n */\r\n\r\n.slider {\r\n  box-shadow: inset 0 2px 4px rgba(0,0,0,0.15);\r\n  height: 1em;\r\n  border-radius: 1em;\r\n  background-color: #eee;\r\n  padding: 0 0.5em;\r\n  overflow: hidden;\r\n}\r\n\r\n.slider-fg {\r\n  padding: 1px 0 2px 0;\r\n  background-color: #aaa;\r\n  height: 1em;\r\n  margin-left: -0.5em;\r\n  padding-right: 0.5em;\r\n  border-radius: 1em 0 0 1em;\r\n}\r\n\r\n.slider-fg:after {\r\n  display: inline-block;\r\n  border-radius: 1em;\r\n  background-color: #fff;\r\n  border:  1px solid #aaa;\r\n  content: '';\r\n  float: right;\r\n  margin-right: -1em;\r\n  margin-top: -1px;\r\n  height: 0.9em;\r\n  width: 0.9em;\r\n}"
);

dat.controllers.TextAreaController = (function (Controller, dom, common) {
  /**
   * @class Provides a text area to alter the text property of an object.
   *
   * @extends dat.controllers.Controller
   *
   * @param {Object} object The object to be manipulated
   * @param {string} property The name of the property to be manipulated
   *
   * @member dat.controllers
   */
  var TextAreaController = function (object, property) {
    TextAreaController.superclass.call(this, object, property);

    var _this = this;

    this.__input = document.createElement("textarea");
    // this.__input.setAttribute('type', 'text');

    dom.bind(this.__input, "keyup", onChange);
    dom.bind(this.__input, "change", onChange);
    dom.bind(this.__input, "blur", onBlur);
    /*
    dom.bind(this.__input, 'keydown', function(e) {
      if (e.keyCode === 13) {
        this.blur();
      }
    });
    */

    function onChange() {
      _this.setValue(_this.__input.value);
    }

    function onBlur() {
      if (_this.__onFinishChange) {
        _this.__onFinishChange.call(_this, _this.getValue());
      }
    }

    this.updateDisplay();

    this.domElement.appendChild(this.__input);
  };

  TextAreaController.superclass = Controller;

  common.extend(
    TextAreaController.prototype,
    Controller.prototype,

    {
      updateDisplay: function () {
        // Stops the caret from moving on account of:
        // keyup -> setValue -> updateDisplay
        if (!dom.isActive(this.__input)) {
          this.__input.value = this.getValue();
        }
        return TextAreaController.superclass.prototype.updateDisplay.call(this);
      },
    }
  );

  return TextAreaController;
})(dat.controllers.Controller, dat.dom.dom, dat.utils.common);

dat.controllers.FunctionController = (function (settings, Controller, dom, common) {
  /**
   * @class Provides a GUI interface to fire a specified method, a property of an object.
   *
   * @extends dat.controllers.Controller
   *
   * @param {Object} object The object to be manipulated
   * @param {string} property The name of the property to be manipulated
   *
   * @member dat.controllers
   */
  var FunctionController = function (object, property, text) {
    FunctionController.superclass.call(this, object, property);

    var _this = this;

    this.__button = settings.DOCUMENT.createElement("div");
    this.__button.innerHTML = text === undefined ? "Fire" : text;
    dom.bind(this.__button, "click", function (e) {
      e.preventDefault();
      _this.fire();
      return false;
    });

    dom.addClass(this.__button, "button");

    this.domElement.appendChild(this.__button);
  };

  FunctionController.superclass = Controller;

  common.extend(FunctionController.prototype, Controller.prototype, {
    fire: function () {
      if (this.__onChange) {
        this.__onChange.call(this);
      }
      this.getValue().call(this.object);
      if (this.__onFinishChange) {
        this.__onFinishChange.call(this, this.getValue());
      }
    },
  });

  return FunctionController;
})(dat.gui.settings, dat.controllers.Controller, dat.dom.dom, dat.utils.common);

dat.controllers.BooleanController = (function (settings, Controller, dom, common) {
  /**
   * @class Provides a checkbox input to alter the boolean property of an object.
   * @extends dat.controllers.Controller
   *
   * @param {Object} object The object to be manipulated
   * @param {string} property The name of the property to be manipulated
   *
   * @member dat.controllers
   */
  var BooleanController = function (object, property) {
    BooleanController.superclass.call(this, object, property);

    var _this = this;
    this.__prev = this.getValue();

    this.__checkbox = settings.DOCUMENT.createElement("input");
    this.__checkbox.setAttribute("type", "checkbox");

    dom.bind(this.__checkbox, "change", onChange, false);

    this.domElement.appendChild(this.__checkbox);

    // Match original value
    this.updateDisplay();

    function onChange() {
      _this.setValue(!_this.__prev);
    }
  };

  BooleanController.superclass = Controller;

  common.extend(
    BooleanController.prototype,
    Controller.prototype,

    {
      setValue: function (v) {
        var toReturn = BooleanController.superclass.prototype.setValue.call(this, v);
        if (this.__onFinishChange) {
          this.__onFinishChange.call(this, this.getValue());
        }
        this.__prev = this.getValue();
        return toReturn;
      },

      updateDisplay: function () {
        if (this.getValue() === true) {
          this.__checkbox.setAttribute("checked", "checked");
          this.__checkbox.checked = true;
        } else {
          this.__checkbox.checked = false;
        }

        return BooleanController.superclass.prototype.updateDisplay.call(this);
      },
    }
  );

  return BooleanController;
})(dat.gui.settings, dat.controllers.Controller, dat.dom.dom, dat.utils.common);

dat.color.toString = (function (common) {
  return function (color) {
    if (color.a == 1 || common.isUndefined(color.a)) {
      var s = color.hex.toString(16);
      while (s.length < 6) {
        s = "0" + s;
      }

      return "#" + s;
    } else {
      return (
        "rgba(" + Math.round(color.r) + "," + Math.round(color.g) + "," + Math.round(color.b) + "," + color.a + ")"
      );
    }
  };
})(dat.utils.common);

dat.color.interpret = (function (toString, common) {
  var result, toReturn;

  var interpret = function () {
    toReturn = false;

    var original = arguments.length > 1 ? common.toArray(arguments) : arguments[0];

    common.each(INTERPRETATIONS, function (family) {
      if (family.litmus(original)) {
        common.each(family.conversions, function (conversion, conversionName) {
          result = conversion.read(original);

          if (toReturn === false && result !== false) {
            toReturn = result;
            result.conversionName = conversionName;
            result.conversion = conversion;
            return common.BREAK;
          }
        });

        return common.BREAK;
      }
    });

    return toReturn;
  };

  var INTERPRETATIONS = [
    // Strings
    {
      litmus: common.isString,

      conversions: {
        THREE_CHAR_HEX: {
          read: function (original) {
            var test = original.match(/^#([A-F0-9])([A-F0-9])([A-F0-9])$/i);
            if (test === null) return false;

            return {
              space: "HEX",
              hex: parseInt(
                "0x" +
                  test[1].toString() +
                  test[1].toString() +
                  test[2].toString() +
                  test[2].toString() +
                  test[3].toString() +
                  test[3].toString()
              ),
            };
          },

          write: toString,
        },

        SIX_CHAR_HEX: {
          read: function (original) {
            var test = original.match(/^#([A-F0-9]{6})$/i);
            if (test === null) return false;

            return {
              space: "HEX",
              hex: parseInt("0x" + test[1].toString()),
            };
          },

          write: toString,
        },

        CSS_RGB: {
          read: function (original) {
            var test = original.match(/^rgb\(\s*(.+)\s*,\s*(.+)\s*,\s*(.+)\s*\)/);
            if (test === null) return false;

            return {
              space: "RGB",
              r: parseFloat(test[1]),
              g: parseFloat(test[2]),
              b: parseFloat(test[3]),
            };
          },

          write: toString,
        },

        CSS_RGBA: {
          read: function (original) {
            var test = original.match(/^rgba\(\s*(.+)\s*,\s*(.+)\s*,\s*(.+)\s*\,\s*(.+)\s*\)/);
            if (test === null) return false;

            return {
              space: "RGB",
              r: parseFloat(test[1]),
              g: parseFloat(test[2]),
              b: parseFloat(test[3]),
              a: parseFloat(test[4]),
            };
          },

          write: toString,
        },
      },
    },

    // Numbers
    {
      litmus: common.isNumber,

      conversions: {
        HEX: {
          read: function (original) {
            return {
              space: "HEX",
              hex: original,
              conversionName: "HEX",
            };
          },

          write: function (color) {
            return color.hex;
          },
        },
      },
    },

    // Arrays
    {
      litmus: common.isArray,

      conversions: {
        RGB_ARRAY: {
          read: function (original) {
            if (original.length != 3) return false;
            return {
              space: "RGB",
              r: original[0],
              g: original[1],
              b: original[2],
            };
          },

          write: function (color) {
            return [color.r, color.g, color.b];
          },
        },

        RGBA_ARRAY: {
          read: function (original) {
            if (original.length != 4) return false;
            return {
              space: "RGB",
              r: original[0],
              g: original[1],
              b: original[2],
              a: original[3],
            };
          },

          write: function (color) {
            return [color.r, color.g, color.b, color.a];
          },
        },
      },
    },

    // Objects
    {
      litmus: common.isObject,

      conversions: {
        RGBA_OBJ: {
          read: function (original) {
            if (
              common.isNumber(original.r) &&
              common.isNumber(original.g) &&
              common.isNumber(original.b) &&
              common.isNumber(original.a)
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

          write: function (color) {
            return {
              r: color.r,
              g: color.g,
              b: color.b,
              a: color.a,
            };
          },
        },

        RGB_OBJ: {
          read: function (original) {
            if (common.isNumber(original.r) && common.isNumber(original.g) && common.isNumber(original.b)) {
              return {
                space: "RGB",
                r: original.r,
                g: original.g,
                b: original.b,
              };
            }
            return false;
          },

          write: function (color) {
            return {
              r: color.r,
              g: color.g,
              b: color.b,
            };
          },
        },

        HSVA_OBJ: {
          read: function (original) {
            if (
              common.isNumber(original.h) &&
              common.isNumber(original.s) &&
              common.isNumber(original.v) &&
              common.isNumber(original.a)
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

          write: function (color) {
            return {
              h: color.h,
              s: color.s,
              v: color.v,
              a: color.a,
            };
          },
        },

        HSV_OBJ: {
          read: function (original) {
            if (common.isNumber(original.h) && common.isNumber(original.s) && common.isNumber(original.v)) {
              return {
                space: "HSV",
                h: original.h,
                s: original.s,
                v: original.v,
              };
            }
            return false;
          },

          write: function (color) {
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

  return interpret;
})(dat.color.toString, dat.utils.common);

dat.GUI = dat.gui.GUI = (function (
  settings,
  css,
  saveDialogueContents,
  styleSheet,
  controllerFactory,
  Controller,
  BooleanController,
  FunctionController,
  NumberControllerBox,
  NumberControllerSlider,
  OptionController,
  ColorController,
  EasingFunctionController,
  requestAnimationFrame,
  CenteredDiv,
  dom,
  common
) {
  css.inject(styleSheet);

  /** Outer-most className for GUI's */
  var CSS_NAMESPACE = "dg";

  var HIDE_KEY_CODE = 72;

  /** The only value shared between the JS and SCSS. Use caution. */
  var CLOSE_BUTTON_HEIGHT = 20;

  var DEFAULT_DEFAULT_PRESET_NAME = "Default";

  var SUPPORTS_LOCAL_STORAGE = (function () {
    try {
      return "localStorage" in settings.WINDOW && settings.WINDOW.localStorage !== null;
    } catch (e) {
      return false;
    }
  })();

  var SAVE_DIALOGUE;

  /** Have we yet to create an autoPlace GUI? */
  var auto_place_virgin = true;

  /** Fixed position div that auto place GUI's go inside */
  var auto_place_container;

  /** Are we hiding the GUI's ? */
  var hide = false;

  /** GUI's which should be hidden */
  var hideable_guis = [];

  /**
   * A lightweight controller library for JavaScript. It allows you to easily
   * manipulate variables and fire functions on the fly.
   * @class
   *
   * @member dat.gui
   *
   * @param {Object} [params]
   * @param {String} [params.name] The name of this GUI.
   * @param {Object} [params.load] JSON object representing the saved state of
   * this GUI.
   * @param {Boolean} [params.auto=true]
   * @param {dat.gui.GUI} [params.parent] The GUI I'm nested in.
   * @param {Boolean} [params.closed] If true, starts closed
   */
  var GUI = function (params) {
    var _this = this;

    /**
     * Outermost DOM Element
     * @type DOMElement
     */
    this.domElement = settings.DOCUMENT.createElement("div");
    this.__ul = settings.DOCUMENT.createElement("ul");
    this.domElement.appendChild(this.__ul);

    dom.addClass(this.domElement, CSS_NAMESPACE);

    /**
     * Nested GUI's by name
     * @ignore
     */
    this.__folders = {};

    this.__controllers = [];
    this.__onClosedChange = null;

    /**
     * List of objects I'm remembering for save, only used in top level GUI
     * @ignore
     */
    this.__rememberedObjects = [];

    /**
     * Maps the index of remembered objects to a map of controllers, only used
     * in top level GUI.
     *
     * @private
     * @ignore
     *
     * @example
     * [
     *  {
     *    propertyName: Controller,
     *    anotherPropertyName: Controller
     *  },
     *  {
     *    propertyName: Controller
     *  }
     * ]
     */
    this.__rememberedObjectIndecesToControllers = [];

    this.__listening = [];

    params = params || {};

    // Default parameters
    params = common.defaults(params, {
      autoPlace: true,
      width: GUI.DEFAULT_WIDTH,
    });

    params = common.defaults(params, {
      resizable: params.autoPlace,
      hideable: params.autoPlace,
    });

    if (!common.isUndefined(params.load)) {
      // Explicit preset
      if (params.preset) params.load.preset = params.preset;
    } else {
      params.load = { preset: DEFAULT_DEFAULT_PRESET_NAME };
    }

    if (common.isUndefined(params.parent) && params.hideable) {
      hideable_guis.push(this);
    }

    // Only root level GUI's are resizable.
    params.resizable = common.isUndefined(params.parent) && params.resizable;

    if (params.autoPlace && common.isUndefined(params.scrollable)) {
      params.scrollable = true;
    }
    //    params.scrollable = common.isUndefined(params.parent) && params.scrollable === true;

    // Not part of params because I don't want people passing this in via
    // constructor. Should be a 'remembered' value.
    var use_local_storage =
      SUPPORTS_LOCAL_STORAGE && localStorage.getItem(getLocalStorageHash(this, "isLocal")) === "true";

    var saveToLocalStorage;

    Object.defineProperties(
      this,

      /** @lends dat.gui.GUI.prototype */
      {
        /**
         * The parent <code>GUI</code>
         * @type dat.gui.GUI
         */
        parent: {
          get: function () {
            return params.parent;
          },
        },

        scrollable: {
          get: function () {
            return params.scrollable;
          },
        },

        /**
         * Handles <code>GUI</code>'s element placement for you
         * @type Boolean
         */
        autoPlace: {
          get: function () {
            return params.autoPlace;
          },
        },

        /**
         * The identifier for a set of saved values
         * @type String
         */
        preset: {
          get: function () {
            if (_this.parent) {
              return _this.getRoot().preset;
            } else {
              return params.load.preset;
            }
          },

          set: function (v) {
            if (_this.parent) {
              _this.getRoot().preset = v;
            } else {
              params.load.preset = v;
            }
            setPresetSelectIndex(this);
            _this.revert();
          },
        },

        /**
         * The width of <code>GUI</code> element
         * @type Number
         */
        width: {
          get: function () {
            return params.width;
          },
          set: function (v) {
            params.width = v;
            setWidth(_this, v);
          },
        },

        /**
         * The name of <code>GUI</code>. Used for folders. i.e
         * a folder's name
         * @type String
         */
        name: {
          get: function () {
            return params.name || "";
          },
          set: function (v) {
            // TODO Check for collisions among sibling folders
            params.name = v;
            if (title_row_name) {
              title_row_name.innerHTML = params.name;
            }
          },
        },

        /**
         * Whether the <code>GUI</code> is collapsed or not
         * @type Boolean
         */
        closed: {
          get: function () {
            return params.closed;
          },
          set: function (v) {
            params.closed = v;
            if (params.closed) {
              dom.addClass(_this.__ul, GUI.CLASS_CLOSED);
            } else {
              dom.removeClass(_this.__ul, GUI.CLASS_CLOSED);
            }
            // For browsers that aren't going to respect the CSS transition,
            // Lets just check our height against the settings.WINDOW height right off
            // the bat.
            this.onResize();

            if (_this.__closeButton) {
              _this.__closeButton.innerHTML = v ? GUI.TEXT_OPEN : GUI.TEXT_CLOSED;
            }
          },
        },

        /**
         * Contains all presets
         * @type Object
         */
        load: {
          get: function () {
            return params.load;
          },
        },

        /**
         * Determines whether or not to use <a href="https://developer.mozilla.org/en/DOM/Storage#localStorage">localStorage</a> as the means for
         * <code>remember</code>ing
         * @type Boolean
         */
        useLocalStorage: {
          get: function () {
            return use_local_storage;
          },
          set: function (bool) {
            if (SUPPORTS_LOCAL_STORAGE) {
              use_local_storage = bool;
              if (bool) {
                dom.bind(settings.WINDOW, "unload", saveToLocalStorage);
              } else {
                dom.unbind(settings.WINDOW, "unload", saveToLocalStorage);
              }
              localStorage.setItem(getLocalStorageHash(_this, "isLocal"), bool);
            }
          },
        },
      }
    );

    // Are we a root level GUI?
    if (common.isUndefined(params.parent)) {
      params.closed = false;

      dom.addClass(this.domElement, GUI.CLASS_MAIN);
      dom.makeSelectable(this.domElement, false);

      // Are we supposed to be loading locally?
      if (SUPPORTS_LOCAL_STORAGE) {
        if (use_local_storage) {
          _this.useLocalStorage = true;

          var saved_gui = localStorage.getItem(getLocalStorageHash(this, "gui"));

          if (saved_gui) {
            params.load = JSON.parse(saved_gui);
          }
        }
      }

      this.__closeButton = settings.DOCUMENT.createElement("div");
      this.__closeButton.innerHTML = GUI.TEXT_CLOSED;
      dom.addClass(this.__closeButton, GUI.CLASS_CLOSE_BUTTON);
      this.domElement.appendChild(this.__closeButton);

      dom.bind(this.__closeButton, "click", function () {
        _this.closed = !_this.closed;
        if (_this.__onClosedChange) _this.__onClosedChange.call(_this, _this.closed);
      });

      // Oh, you're a nested GUI!
    } else {
      if (params.closed === undefined) {
        params.closed = true;
      }

      var title_row_name = settings.DOCUMENT.createTextNode(params.name);
      dom.addClass(title_row_name, "controller-name");

      var title_row = addRow(_this, title_row_name);

      var on_click_title = function (e) {
        e.preventDefault();
        _this.closed = !_this.closed;
        if (_this.__onClosedChange) _this.__onClosedChange.call(_this, _this.closed);
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
      if (common.isUndefined(params.parent)) {
        if (auto_place_virgin) {
          auto_place_container = settings.DOCUMENT.createElement("div");
          dom.addClass(auto_place_container, CSS_NAMESPACE);
          dom.addClass(auto_place_container, GUI.CLASS_AUTO_PLACE_CONTAINER);
          settings.DOCUMENT.body.appendChild(auto_place_container);
          auto_place_virgin = false;
        }

        // Put it in the dom for you.
        auto_place_container.appendChild(this.domElement);

        // Apply the auto styles
        dom.addClass(this.domElement, GUI.CLASS_AUTO_PLACE);
      }

      // Make it not elastic.
      if (!this.parent) setWidth(_this, params.width);
    }

    dom.bind(settings.WINDOW, "resize", function () {
      _this.onResize();
    });
    dom.bind(this.__ul, "webkitTransitionEnd", function () {
      _this.onResize();
    });
    dom.bind(this.__ul, "transitionend", function () {
      _this.onResize();
    });
    dom.bind(this.__ul, "oTransitionEnd", function () {
      _this.onResize();
    });
    this.onResize();

    if (params.resizable) {
      addResizeHandle(this);
    }

    saveToLocalStorage = function () {
      if (SUPPORTS_LOCAL_STORAGE && localStorage.getItem(getLocalStorageHash(_this, "isLocal")) === "true") {
        localStorage.setItem(getLocalStorageHash(_this, "gui"), JSON.stringify(_this.getSaveObject()));
      }
    };

    // expose this method publicly
    this.saveToLocalStorageIfPossible = saveToLocalStorage;

    var root = _this.getRoot();
    function resetWidth() {
      var root = _this.getRoot();
      root.width += 1;
      common.defer(function () {
        root.width -= 1;
      });
    }

    if (!params.parent) {
      resetWidth();
    }
  };

  GUI.prototype.onClosedChange = function (fnc) {
    this.__onClosedChange = fnc;
    return this;
  };

  GUI.prototype.getControllerByName = function (name, recurse) {
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

  GUI.prototype.getFolderByName = function (name) {
    return this.__folders[name];
  };

  GUI.prototype.getAllControllers = function (recurse, myArray) {
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

  /*
   *  Gets this current GUI (usually) and all sub-folder GUIs under this GUI as an array of {name/gui} pairs. The "this" current gui uses empty string.
   *  @param  recurse (optional) By default, it will recurse multiple levels deep. Set to false to only scan current level from current GUI.
   *  @param  myArray (optional) Supply an existing array to use instead.  If supplied, will not push current GUI into array, only the subfolder GUIs.
   *  @return   The array of {name/gui} value pairs
   */
  GUI.prototype.getAllGUIs = function (recurse, myArray) {
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

  GUI.toggleHide = function () {
    hide = !hide;
    common.each(hideable_guis, function (gui) {
      gui.domElement.style.zIndex = hide ? -999 : 999;
      gui.domElement.style.opacity = hide ? 0 : 1;
    });
  };

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

  dom.bind(
    settings.WINDOW,
    "keydown",
    function (e) {
      if (
        settings.DOCUMENT.activeElement.type !== "text" &&
        settings.DOCUMENT.activeElement.nodeName.toString().toLowerCase() !== "textarea" &&
        (e.which === HIDE_KEY_CODE || e.keyCode == HIDE_KEY_CODE)
      ) {
        GUI.toggleHide();
      }
    },
    false
  );

  common.extend(
    GUI.prototype,

    /** @lends dat.gui.GUI */
    {
      /**
       * @param object
       * @param property
       * @returns {dat.controllers.Controller} The new controller that was added.
       * @instance
       */
      add: function (object, property) {
        return add(this, object, property, {
          factoryArgs: Array.prototype.slice.call(arguments, 2),
        });
      },

      /**
       * @param object
       * @param property
       * @returns {dat.controllers.ColorController} The new controller that was added.
       * @instance
       */
      addColor: function (object, property) {
        return add(this, object, property, {
          color: true,
        });
      },
      /**
       * @param object
       * @param property
       * @returns {dat.controllers.TextAreaController} The new controller that was added.
       * @instance
       */
      addTextArea: function (object, property) {
        return add(this, object, property, {
          multiline: true,
        });
      },

      /**
       * @param object
       * @param property
       * @returns {dat.controllers.EasingFunctionController} The new controller that was added.
       * @instance
       */
      addEasingFunction: function (object, property) {
        return add(this, object, property, {
          easing: true,
        });
      },
      addHifiColor: function (object, property) {
        return add(this, object, property, {
          hifiColor: true,
        });
      },
      /**
       * @param object
       * @param property
       * @returns {dat.controllers.ColorController} The new controller that was added.
       * @instance
       */
      addVec3: function (object, property) {
        return add(this, object, property, {
          vec3: true,
        });
      },
      addQuat: function (object, property) {
        return add(this, object, property, {
          quat: true,
        });
      },
      /**
       * @param controller
       * @instance
       */
      remove: function (controller) {
        // TODO listening?
        this.__ul.removeChild(controller.__li);
        this.__controllers.splice(this.__controllers.indexOf(controller), 1);
        var _this = this;
        common.defer(function () {
          _this.onResize();
        });
      },

      destroy: function () {
        if (this.autoPlace) {
          auto_place_container.removeChild(this.domElement);
        }
      },

      /**
       * @param name
       * @returns {dat.gui.GUI} The new folder.
       * @throws {Error} if this GUI already has a folder by the specified
       * name
       * @instance
       */
      addFolder: function (name) {
        // We have to prevent collisions on names in order to have a key
        // by which to remember saved values
        if (this.__folders[name] !== undefined) {
          throw new Error("You already have a folder in this GUI by the" + ' name "' + name + '"');
        }

        var new_gui_params = { name: name, parent: this };

        // We need to pass down the autoPlace trait so that we can
        // attach event listeners to open/close folder actions to
        // ensure that a scrollbar appears if the window is too short.
        new_gui_params.autoPlace = this.autoPlace;

        // Do we have saved appearance data for this folder?

        if (
          this.load && // Anything loaded?
          this.load.folders && // Was my parent a dead-end?
          this.load.folders[name]
        ) {
          // Did daddy remember me?

          // Start me closed if I was closed
          new_gui_params.closed = this.load.folders[name].closed;

          // Pass down the loaded data
          new_gui_params.load = this.load.folders[name];
        }

        var gui = new GUI(new_gui_params);
        this.__folders[name] = gui;

        var li = addRow(this, gui.domElement);
        li.setAttribute("draggable", "true");
        li.ondragstart = function (event) {
          event.dataTransfer.setData("text", name);
        };
        dom.addClass(li, "folder");
        return gui;
      },

      open: function () {
        this.closed = false;
      },

      close: function () {
        this.closed = true;
      },

      onResize: function () {
        var root = this.getRoot();

        if (root.scrollable) {
          var top = dom.getOffset(root.__ul).top;
          var h = 0;

          common.each(root.__ul.childNodes, function (node) {
            if (!(root.autoPlace && node === root.__save_row) && node.nodeType === 1) h += dom.getHeight(node);
          });

          if (settings.WINDOW.innerHeight - top - CLOSE_BUTTON_HEIGHT < h) {
            dom.addClass(root.domElement, GUI.CLASS_TOO_TALL);
            root.__ul.style.height = settings.WINDOW.innerHeight - top - CLOSE_BUTTON_HEIGHT + "px";
          } else {
            dom.removeClass(root.domElement, GUI.CLASS_TOO_TALL);
            root.__ul.style.height = "auto";
          }
        }

        if (root.__resize_handle) {
          common.defer(function () {
            root.__resize_handle.style.height = root.__ul.offsetHeight + "px";
          });
        }

        if (root.__closeButton) {
          root.__closeButton.style.width = root.width + "px";
        }
      },

      /**
       * Mark objects for saving. The order of these objects cannot change as
       * the GUI grows. When remembering new objects, append them to the end
       * of the list.
       *
       * @param {Object...} objects
       * @throws {Error} if not called on a top level GUI.
       * @instance
       */
      remember: function () {
        if (common.isUndefined(SAVE_DIALOGUE)) {
          SAVE_DIALOGUE = new CenteredDiv();
          SAVE_DIALOGUE.domElement.innerHTML = saveDialogueContents;
        }

        if (this.parent) {
          throw new Error("You can only call remember on a top level GUI.");
        }

        var _this = this;

        common.each(Array.prototype.slice.call(arguments), function (object) {
          if (_this.__rememberedObjects.length == 0) {
            addSaveMenu(_this);
          }
          if (_this.__rememberedObjects.indexOf(object) == -1) {
            _this.__rememberedObjects.push(object);
          }
        });

        if (this.autoPlace) {
          // Set save row width
          setWidth(this, this.width);
        }
      },

      /**
       * @returns {dat.gui.GUI} the topmost parent GUI of a nested GUI.
       * @instance
       */
      getRoot: function () {
        var gui = this;
        while (gui.parent) {
          gui = gui.parent;
        }
        return gui;
      },

      /**
       * @returns {Object} a JSON object representing the current state of
       * this GUI as well as its remembered properties.
       * @instance
       */
      getSaveObject: function () {
        var toReturn = this.load;

        toReturn.closed = this.closed;

        // Am I remembering any values?
        if (this.__rememberedObjects.length > 0) {
          toReturn.preset = this.preset;

          if (!toReturn.remembered) {
            toReturn.remembered = {};
          }

          toReturn.remembered[this.preset] = getCurrentPreset(this);
        }

        toReturn.folders = {};
        common.each(this.__folders, function (element, key) {
          toReturn.folders[key] = element.getSaveObject();
        });

        return toReturn;
      },

      save: function () {
        if (!this.load.remembered) {
          this.load.remembered = {};
        }

        this.load.remembered[this.preset] = getCurrentPreset(this);
        markPresetModified(this, false);
        this.saveToLocalStorageIfPossible();
      },

      saveAs: function (presetName) {
        if (!this.load.remembered) {
          // Retain default values upon first save
          this.load.remembered = {};
          this.load.remembered[DEFAULT_DEFAULT_PRESET_NAME] = getCurrentPreset(this, true);
        }

        this.load.remembered[presetName] = getCurrentPreset(this);
        this.preset = presetName;
        addPresetOption(this, presetName, true);
        this.saveToLocalStorageIfPossible();
      },

      revert: function (gui) {
        common.each(
          this.__controllers,
          function (controller) {
            // Make revert work on Default.
            if (!this.getRoot().load.remembered) {
              controller.setValue(controller.initialValue);
            } else {
              recallSavedValue(gui || this.getRoot(), controller);
            }
          },
          this
        );

        common.each(this.__folders, function (folder) {
          folder.revert(folder);
        });

        if (!gui) {
          markPresetModified(this.getRoot(), false);
        }
      },

      listen: function (controller) {
        var init = this.__listening.length == 0;
        this.__listening.push(controller);
        if (init) updateDisplays(this.__listening);
      },
    }
  );

  function add(gui, object, property, params) {
    if (object[property] === undefined) {
      throw new Error("Object " + object + ' has no property "' + property + '"');
    }

    var controller;

    if (params.color) {
      controller = new ColorController(object, property);
    } else if (params.easing) {
      controller = new EasingFunctionController(object, property);
    } else if (params.multiline) {
      controller = new TextAreaController(object, property);
    } else {
      var factoryArgs = [object, property].concat(params.factoryArgs);
      controller = controllerFactory.apply(gui, factoryArgs);
    }

    if (params.before instanceof Controller) {
      params.before = params.before.__li;
    }

    recallSavedValue(gui, controller);

    dom.addClass(controller.domElement, "c");

    var name = settings.DOCUMENT.createElement("span");
    dom.addClass(name, "property-name");
    name.innerHTML = controller.label;

    var clear = document.createElement("div");
    clear.style.clear = "both";
    var container = settings.DOCUMENT.createElement("div");
    container.appendChild(name);
    container.appendChild(controller.domElement);
    container.appendChild(clear);

    var li = addRow(gui, container, params.before);

    dom.addClass(li, GUI.CLASS_CONTROLLER_ROW);
    dom.addClass(li, typeof controller.getValue());

    augmentController(gui, li, controller);

    gui.__controllers.push(controller);

    return controller;
  }

  /**
   * Add a row to the end of the GUI or before another row.
   *
   * @param gui
   * @param [dom] If specified, inserts the dom content in the new row
   * @param [liBefore] If specified, places the new row before another row
   */
  function addRow(gui, dom, liBefore) {
    var li = settings.DOCUMENT.createElement("li");
    if (dom) li.appendChild(dom);
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

    common.extend(controller, {
      options: function (options) {
        if (arguments.length > 1) {
          controller.remove();

          return add(gui, controller.object, controller.property, {
            before: controller.__li.nextElementSibling,
            factoryArgs: [common.toArray(arguments)],
          });
        }

        if (common.isArray(options) || common.isObject(options)) {
          controller.remove();

          return add(gui, controller.object, controller.property, {
            before: controller.__li.nextElementSibling,
            factoryArgs: [options],
          });
        }
      },

      name: function (v) {
        controller.__li.firstElementChild.firstElementChild.innerHTML = v;
        return controller;
      },

      listen: function () {
        controller.__gui.listen(controller);
        return controller;
      },

      remove: function () {
        controller.__gui.remove(controller);
        return controller;
      },
    });

    // All sliders should be accompanied by a box.
    if (controller instanceof NumberControllerSlider) {
      var box = new NumberControllerBox(controller.object, controller.property, {
        min: controller.__min,
        max: controller.__max,
        step: controller.__step,
      });

      controller.__valueControllerBox = box;

      common.each(["updateDisplay", "onChange", "onFinishChange"], function (method) {
        var pc = controller[method];
        var pb = box[method];
        controller[method] = box[method] = function () {
          var args = Array.prototype.slice.call(arguments);
          pc.apply(controller, args);
          return pb.apply(box, args);
        };
      });

      dom.addClass(li, "has-slider");
      controller.domElement.insertBefore(box.domElement, controller.domElement.firstElementChild);
    } else if (controller instanceof NumberControllerBox) {
      var r = function (returned) {
        // Have we defined both boundaries?
        if (common.isNumber(controller.__min) && common.isNumber(controller.__max)) {
          // Well, then lets just replace this with a slider.
          controller.remove();
          return add(gui, controller.object, controller.property, {
            before: controller.__li.nextElementSibling,
            factoryArgs: [controller.__min, controller.__max, controller.__step],
          });
        }

        return returned;
      };

      controller.min = common.compose(r, controller.min);
      controller.max = common.compose(r, controller.max);
    } else if (controller instanceof BooleanController) {
      dom.bind(li, "click", function () {
        dom.fakeEvent(controller.__checkbox, "click");
      });

      dom.bind(controller.__checkbox, "click", function (e) {
        e.stopPropagation(); // Prevents double-toggle
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
      controller.updateDisplay = common.compose(function (r) {
        li.style.borderLeftColor = controller.__color.toString();
        return r;
      }, controller.updateDisplay);

      controller.updateDisplay();
    } else if (controller instanceof EasingFunctionController) {
      dom.addClass(li, "easing");

      controller.updateDisplay = common.compose(function (r) {
        // [TODO]
        // Let's adapt style!
        return r;
      }, controller.updateDisplay);

      controller.updateDisplay();
    }

    controller.setValue = common.compose(function (r) {
      if (gui.getRoot().__preset_select && controller.isModified()) {
        markPresetModified(gui.getRoot(), true);
      }
      return r;
    }, controller.setValue);
  }

  function recallSavedValue(gui, controller) {
    // Find the topmost GUI, that's where remembered objects live.
    var root = gui.getRoot();

    // Does the object we're controlling match anything we've been told to
    // remember?
    var matched_index = root.__rememberedObjects.indexOf(controller.object);

    // Why yes, it does!
    if (matched_index != -1) {
      // Let me fetch a map of controllers for thcommon.isObject.
      var controller_map = root.__rememberedObjectIndecesToControllers[matched_index];

      // Ohp, I believe this is the first controller we've created for this
      // object. Lets make the map fresh.
      if (controller_map === undefined) {
        controller_map = {};
        root.__rememberedObjectIndecesToControllers[matched_index] = controller_map;
      }

      // Keep track of this controller
      controller_map[controller.property] = controller;

      // Okay, now have we saved any values for this controller?
      if (root.load && root.load.remembered) {
        var preset_map = root.load.remembered;

        // Which preset are we trying to load?
        var preset;

        if (preset_map[gui.preset]) {
          preset = preset_map[gui.preset];
        } else if (preset_map[DEFAULT_DEFAULT_PRESET_NAME]) {
          // Uhh, you can have the default instead?
          preset = preset_map[DEFAULT_DEFAULT_PRESET_NAME];
        } else {
          // Nada.

          return;
        }

        // Did the loaded object remember thcommon.isObject?
        if (
          preset[matched_index] &&
          // Did we remember this particular property?
          preset[matched_index][controller.property] !== undefined
        ) {
          // We did remember something for this guy ...
          var value = preset[matched_index][controller.property];

          // And that's what it is.
          controller.initialValue = value;
          controller.setValue(value);
        }
      }
    }
  }

  function getLocalStorageHash(gui, key) {
    // TODO how does this deal with multiple GUI's?
    return settings.DOCUMENT.location.href + "." + key;
  }

  function addSaveMenu(gui) {
    var div = (gui.__save_row = settings.DOCUMENT.createElement("li"));

    dom.addClass(gui.domElement, "has-save");

    gui.__ul.insertBefore(div, gui.__ul.firstChild);

    dom.addClass(div, "save-row");

    var gears = settings.DOCUMENT.createElement("span");
    gears.innerHTML = "&nbsp;";
    dom.addClass(gears, "button gears");

    // TODO replace with FunctionController
    var button = settings.DOCUMENT.createElement("span");
    button.innerHTML = "Save";
    dom.addClass(button, "button");
    dom.addClass(button, "save");

    var button2 = settings.DOCUMENT.createElement("span");
    button2.innerHTML = "New";
    dom.addClass(button2, "button");
    dom.addClass(button2, "save-as");

    var button3 = settings.DOCUMENT.createElement("span");
    button3.innerHTML = "Revert";
    dom.addClass(button3, "button");
    dom.addClass(button3, "revert");

    var select = (gui.__preset_select = settings.DOCUMENT.createElement("select"));

    if (gui.load && gui.load.remembered) {
      common.each(gui.load.remembered, function (value, key) {
        addPresetOption(gui, key, key == gui.preset);
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

    if (SUPPORTS_LOCAL_STORAGE) {
      var saveLocally = settings.DOCUMENT.getElementById("dg-save-locally");
      var explain = settings.DOCUMENT.getElementById("dg-local-explain");

      saveLocally.style.display = "block";

      var localStorageCheckBox = settings.DOCUMENT.getElementById("dg-local-storage");

      if (localStorage.getItem(getLocalStorageHash(gui, "isLocal")) === "true") {
        localStorageCheckBox.setAttribute("checked", "checked");
      }

      function showHideExplain() {
        explain.style.display = gui.useLocalStorage ? "block" : "none";
      }

      showHideExplain();

      // TODO: Use a boolean controller, fool!
      dom.bind(localStorageCheckBox, "change", function () {
        gui.useLocalStorage = !gui.useLocalStorage;
        showHideExplain();
      });
    }

    var newConstructorTextArea = settings.DOCUMENT.getElementById("dg-new-constructor");

    dom.bind(newConstructorTextArea, "keydown", function (e) {
      if (e.metaKey && (e.which === 67 || e.keyCode == 67)) {
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
      if (presetName) gui.saveAs(presetName);
    });

    dom.bind(button3, "click", function () {
      gui.revert();
    });

    //    div.appendChild(button2);
  }

  function addResizeHandle(gui) {
    gui.__resize_handle = settings.DOCUMENT.createElement("div");

    common.extend(gui.__resize_handle.style, {
      width: "6px",
      marginLeft: "-3px",
      height: "200px",
      cursor: "ew-resize",
      position: "absolute",
      //      border: '1px solid blue'
    });

    var pmouseX;

    dom.bind(gui.__resize_handle, "mousedown", dragStart);
    dom.bind(gui.__closeButton, "mousedown", dragStart);

    gui.domElement.insertBefore(gui.__resize_handle, gui.domElement.firstElementChild);

    function dragStart(e) {
      e.preventDefault();

      pmouseX = e.clientX;

      dom.addClass(gui.__closeButton, GUI.CLASS_DRAG);
      dom.bind(settings.WINDOW, "mousemove", drag);
      dom.bind(settings.WINDOW, "mouseup", dragStop);

      gui.domElement.dispatchEvent(
        new CustomEvent("dragstart", {
          bubbles: true,
          cancelable: true,
        })
      );

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
      dom.unbind(settings.WINDOW, "mousemove", drag);
      dom.unbind(settings.WINDOW, "mouseup", dragStop);

      gui.domElement.dispatchEvent(
        new CustomEvent("dragstop", {
          bubbles: true,
          cancelable: true,
        })
      );
    }
  }

  function setWidth(gui, w) {
    gui.domElement.style.width = w + "px";
    // Auto placed save-rows are position fixed, so we have to
    // set the width manually if we want it to bleed to the edge
    if (gui.__save_row && gui.autoPlace) {
      gui.__save_row.style.width = w + "px";
    }
    if (gui.__closeButton) {
      gui.__closeButton.style.width = w + "px";
    }
  }

  function getCurrentPreset(gui, useInitialValues) {
    var toReturn = {};

    // For each object I'm remembering
    common.each(gui.__rememberedObjects, function (val, index) {
      var saved_values = {};

      // The controllers I've made for thcommon.isObject by property
      var controller_map = gui.__rememberedObjectIndecesToControllers[index];

      // Remember each value for each property
      common.each(controller_map, function (controller, property) {
        saved_values[property] = useInitialValues ? controller.initialValue : controller.getValue();
      });

      // Save the values for thcommon.isObject
      toReturn[index] = saved_values;
    });

    return toReturn;
  }

  function addPresetOption(gui, name, setSelected) {
    var opt = settings.DOCUMENT.createElement("option");
    opt.innerHTML = name;
    opt.value = name;
    gui.__preset_select.appendChild(opt);
    if (setSelected) {
      gui.__preset_select.selectedIndex = gui.__preset_select.length - 1;
    }
  }

  function setPresetSelectIndex(gui) {
    for (var index = 0; index < gui.__preset_select.length; index++) {
      if (gui.__preset_select[index].value == gui.preset) {
        gui.__preset_select.selectedIndex = index;
      }
    }
  }

  function markPresetModified(gui, modified) {
    var opt = gui.__preset_select[gui.__preset_select.selectedIndex];
    //    console.log('mark', modified, opt);
    if (modified) {
      opt.innerHTML = opt.value + "*";
    } else {
      opt.innerHTML = opt.value;
    }
  }

  function updateDisplays(controllerArray) {
    if (controllerArray.length != 0) {
      requestAnimationFrame(function () {
        updateDisplays(controllerArray);
      });
    }

    common.each(controllerArray, function (c) {
      c.updateDisplay();
    });
  }

  return GUI;
})(
  dat.utils.css,
  '<div id="dg-save" class="dg dialogue">\n\n  Here\'s the new load parameter for your <code>GUI</code>\'s constructor:\n\n  <textarea id="dg-new-constructor"></textarea>\n\n  <div id="dg-save-locally">\n\n    <input id="dg-local-storage" type="checkbox"/> Automatically save\n    values to <code>localStorage</code> on exit.\n\n    <div id="dg-local-explain">The values saved to <code>localStorage</code> will\n      override those passed to <code>dat.GUI</code>\'s constructor. This makes it\n      easier to work incrementally, but <code>localStorage</code> is fragile,\n      and your friends may not see the same values you do.\n      \n    </div>\n    \n  </div>\n\n</div>',
  ".dg {\n  /** Clear list styles */\n  /* Auto-place container */\n  /* Auto-placed GUI's */\n  /* Line items that don't contain folders. */\n  /** Folder names */\n  /** Hides closed items */\n  /** Controller row */\n  /** Name-half (left) */\n  /** Controller-half (right) */\n  /** Controller placement */\n  /** Controller placement */\n  /** Shorter number boxes when slider is present. */\n  /** Ensure the entire boolean and function row shows a hand */ }\n  .dg ul {\n    list-style: none;\n    margin: 0;\n    padding: 0;\n    width: 100%;\n    clear: both; }\n  .dg.ac {\n    position: fixed;\n    top: 0;\n    left: 0;\n    right: 0;\n    height: 0;\n    z-index: 0; }\n  .dg:not(.ac) .main {\n    /** Exclude mains in ac so that we don't hide close button */\n    overflow: hidden; }\n  .dg.main {\n    -webkit-transition: opacity 0.1s linear;\n    -o-transition: opacity 0.1s linear;\n    -moz-transition: opacity 0.1s linear;\n    transition: opacity 0.1s linear; }\n    .dg.main.taller-than-window {\n      overflow-y: auto; }\n      .dg.main.taller-than-window .close-button {\n        opacity: 1;\n        /* TODO, these are style notes */\n        margin-top: -1px;\n        border-top: 1px solid #2c2c2c; }\n    .dg.main ul.closed .close-button {\n      opacity: 1 !important; }\n    .dg.main:hover .close-button,\n    .dg.main .close-button.drag {\n      opacity: 1; }\n    .dg.main .close-button {\n      /*opacity: 0;*/\n      -webkit-transition: opacity 0.1s linear;\n      -o-transition: opacity 0.1s linear;\n      -moz-transition: opacity 0.1s linear;\n      transition: opacity 0.1s linear;\n      border: 0;\n      position: absolute;\n      line-height: 19px;\n      height: 20px;\n      /* TODO, these are style notes */\n      cursor: pointer;\n      text-align: center;\n      background-color: #000; }\n      .dg.main .close-button:hover {\n        background-color: #111; }\n  .dg.a {\n    float: right;\n    margin-right: 15px;\n    overflow-x: hidden; }\n    .dg.a.has-save > ul {\n      margin-top: 27px; }\n      .dg.a.has-save > ul.closed {\n        margin-top: 0; }\n    .dg.a .save-row {\n      position: fixed;\n      top: 0;\n      z-index: 1002; }\n  .dg li {\n    -webkit-transition: height 0.1s ease-out;\n    -o-transition: height 0.1s ease-out;\n    -moz-transition: height 0.1s ease-out;\n    transition: height 0.1s ease-out; }\n  .dg li:not(.folder) {\n    cursor: auto;\n    height: 27px;\n    line-height: 27px;\n    overflow: hidden;\n    padding: 0 4px 0 5px; }\n  .dg li.folder {\n    padding: 0;\n    border-left: 4px solid transparent; }\n  .dg li.title {\n    cursor: pointer;\n    margin-left: -4px; }\n  .dg .closed li:not(.title),\n  .dg .closed ul li,\n  .dg .closed ul li > * {\n    height: 0;\n    overflow: hidden;\n    border: 0; }\n  .dg .cr {\n    clear: both;\n    padding-left: 3px;\n    height: 27px; }\n  .dg .property-name {\n    cursor: default;\n    float: left;\n    clear: left;\n    width: 40%;\n    overflow: hidden;\n    text-overflow: ellipsis; }\n  .dg .c {\n    float: left;\n    width: 60%; }\n  .dg .c input[type=text] {\n    border: 0;\n    margin-top: 4px;\n    padding: 3px;\n    width: 100%;\n    float: right; }\n  .dg .c canvas {\n    border: 0;\n    margin-top: 0px;\n    outline: none;\n    border: 0;\n    width: 146px;\n    float: right; }\n  .dg .has-slider input[type=text] {\n    width: 30%;\n    /*display: none;*/\n    margin-left: 0; }\n  .dg .slider {\n    float: left;\n    width: 66%;\n    margin-left: -5px;\n    margin-right: 0;\n    height: 19px;\n    margin-top: 4px; }\n  .dg .slider-fg {\n    height: 100%; }\n  .dg .c input[type=checkbox] {\n    margin-top: 9px; }\n  .dg .c select {\n    margin-top: 5px; }\n  .dg .cr.function,\n  .dg .cr.function .property-name,\n  .dg .cr.function *,\n  .dg .cr.boolean,\n  .dg .cr.boolean * {\n    cursor: pointer; }\n  .dg .selector {\n    display: none;\n    position: absolute;\n    margin-left: -9px;\n    margin-top: 23px;\n    z-index: 10; }\n  .dg .c:hover .selector,\n  .dg .selector.drag {\n    display: block; }\n  .dg li.save-row {\n    padding: 0; }\n    .dg li.save-row .button {\n      display: inline-block;\n      padding: 0px 6px; }\n  .dg.dialogue {\n    background-color: #222;\n    width: 460px;\n    padding: 15px;\n    font-size: 13px;\n    line-height: 15px; }\n\n/* TODO Separate style and structure */\n#dg-new-constructor {\n  padding: 10px;\n  color: #222;\n  font-family: Monaco, monospace;\n  font-size: 10px;\n  border: 0;\n  resize: none;\n  box-shadow: inset 1px 1px 1px #888;\n  word-wrap: break-word;\n  margin: 12px 0;\n  display: block;\n  width: 440px;\n  overflow-y: scroll;\n  height: 100px;\n  position: relative; }\n\n#dg-local-explain {\n  display: none;\n  font-size: 11px;\n  line-height: 17px;\n  border-radius: 3px;\n  background-color: #333;\n  padding: 8px;\n  margin-top: 10px; }\n  #dg-local-explain code {\n    font-size: 10px; }\n\n#dat-gui-save-locally {\n  display: none; }\n\n/** Main type */\n.dg {\n  color: #eee;\n  font: 11px 'Lucida Grande', sans-serif;\n  text-shadow: 0 -1px 0 #111;\n  /** Auto place */\n  /* Controller row, <li> */\n  /** Controllers */ }\n  .dg.main {\n    /** Scrollbar */ }\n    .dg.main::-webkit-scrollbar {\n      width: 5px;\n      background: #1a1a1a; }\n    .dg.main::-webkit-scrollbar-corner {\n      height: 0;\n      display: none; }\n    .dg.main::-webkit-scrollbar-thumb {\n      border-radius: 5px;\n      background: #676767; }\n  .dg li:not(.folder) {\n    background: #1a1a1a;\n    border-bottom: 1px solid #2c2c2c; }\n  .dg li.save-row {\n    line-height: 25px;\n    background: #dad5cb;\n    border: 0; }\n    .dg li.save-row select {\n      margin-left: 5px;\n      width: 108px; }\n    .dg li.save-row .button {\n      margin-left: 5px;\n      margin-top: 1px;\n      border-radius: 2px;\n      font-size: 9px;\n      line-height: 7px;\n      padding: 4px 4px 5px 4px;\n      background: #c5bdad;\n      color: #fff;\n      text-shadow: 0 1px 0 #b0a58f;\n      box-shadow: 0 -1px 0 #b0a58f;\n      cursor: pointer; }\n      .dg li.save-row .button.gears {\n        background: #c5bdad url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAANCAYAAAB/9ZQ7AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAQJJREFUeNpiYKAU/P//PwGIC/ApCABiBSAW+I8AClAcgKxQ4T9hoMAEUrxx2QSGN6+egDX+/vWT4e7N82AMYoPAx/evwWoYoSYbACX2s7KxCxzcsezDh3evFoDEBYTEEqycggWAzA9AuUSQQgeYPa9fPv6/YWm/Acx5IPb7ty/fw+QZblw67vDs8R0YHyQhgObx+yAJkBqmG5dPPDh1aPOGR/eugW0G4vlIoTIfyFcA+QekhhHJhPdQxbiAIguMBTQZrPD7108M6roWYDFQiIAAv6Aow/1bFwXgis+f2LUAynwoIaNcz8XNx3Dl7MEJUDGQpx9gtQ8YCueB+D26OECAAQDadt7e46D42QAAAABJRU5ErkJggg==) 2px 1px no-repeat;\n        height: 7px;\n        width: 8px; }\n      .dg li.save-row .button:hover {\n        background-color: #bab19e;\n        box-shadow: 0 -1px 0 #b0a58f; }\n  .dg li.folder {\n    border-bottom: 0; }\n  .dg li.title {\n    padding-left: 16px;\n    background: #000 url(data:image/gif;base64,R0lGODlhBQAFAJEAAP////Pz8////////yH5BAEAAAIALAAAAAAFAAUAAAIIlI+hKgFxoCgAOw==) 6px 10px no-repeat;\n    cursor: pointer;\n    border-bottom: 1px solid rgba(255, 255, 255, 0.2); }\n  .dg .closed li.title {\n    background-image: url(data:image/gif;base64,R0lGODlhBQAFAJEAAP////Pz8////////yH5BAEAAAIALAAAAAAFAAUAAAIIlGIWqMCbWAEAOw==); }\n  .dg .cr.boolean {\n    border-left: 3px solid #806787; }\n  .dg .cr.function {\n    border-left: 3px solid #e61d5f; }\n  .dg .cr.number {\n    border-left: 3px solid #2FA1D6; }\n    .dg .cr.number input[type=text] {\n      color: #2FA1D6; }\n  .dg .cr.string {\n    border-left: 3px solid #1ed36f; }\n    .dg .cr.string input[type=text] {\n      color: #1ed36f; }\n  .dg .cr.easing {\n    border-left: 3px solid #ff8710;\n    height: 80px;\n    line-height: 80px; }\n  .dg .cr.function:hover, .dg .cr.boolean:hover {\n    background: #111; }\n  .dg .c input[type=text] {\n    background: #303030;\n    outline: none; }\n    .dg .c input[type=text]:hover {\n      background: #3c3c3c; }\n    .dg .c input[type=text]:focus {\n      background: #494949;\n      color: #fff; }\n  .dg .c .slider {\n    background: #303030;\n    cursor: ew-resize; }\n  .dg .c .slider-fg {\n    background: #2FA1D6; }\n  .dg .c .slider:hover {\n    background: #3c3c3c; }\n    .dg .c .slider:hover .slider-fg {\n      background: #44abda; }\n\n/*# sourceMappingURL=style.css.map */\n",
  (dat.controllers.factory = (function (
    OptionController,
    NumberControllerBox,
    NumberControllerSlider,
    StringController,
    FunctionController,
    BooleanController,
    common
  ) {
    return function (object, property) {
      var initialValue = object[property];

      // Providing options?
      if (common.isArray(arguments[2]) || common.isObject(arguments[2])) {
        return new OptionController(object, property, arguments[2]);
      }

      // Providing a map?

      if (common.isNumber(initialValue)) {
        if (common.isNumber(arguments[2]) && common.isNumber(arguments[3])) {
          // Has min and max.
          return new NumberControllerSlider(object, property, arguments[2], arguments[3], arguments[4], arguments[5]);
        } else {
          return new NumberControllerBox(object, property, {
            min: arguments[2],
            max: arguments[3],
            step: arguments[4],
          });
        }
      }

      if (common.isString(initialValue)) {
        return new StringController(object, property);
      }

      if (common.isFunction(initialValue)) {
        return new FunctionController(object, property, "");
      }

      if (common.isBoolean(initialValue)) {
        return new BooleanController(object, property);
      }

      if (common.isArray(initialValue)) {
        return new ArrayController(object, property);
      }
    };
  })(
    dat.controllers.OptionController,
    dat.controllers.NumberControllerBox,
    dat.controllers.NumberControllerSlider,
    (dat.controllers.StringController = (function (settings, Controller, dom, common) {
      /**
       * @class Provides a text input to alter the string property of an object.
       *
       * @extends dat.controllers.Controller
       *
       * @param {Object} object The object to be manipulated
       * @param {string} property The name of the property to be manipulated
       *
       * @member dat.controllers
       */
      var StringController = function (object, property) {
        StringController.superclass.call(this, object, property);

        var _this = this;

        this.__input = settings.DOCUMENT.createElement("input");
        this.__input.setAttribute("type", "text");

        dom.bind(this.__input, "keyup", onChange);
        dom.bind(this.__input, "change", onChange);
        dom.bind(this.__input, "blur", onBlur);
        dom.bind(this.__input, "keydown", function (e) {
          if (e.keyCode === 13) {
            this.blur();
          }
        });

        function onChange() {
          _this.setValue(_this.__input.value);
        }

        function onBlur() {
          if (_this.__onFinishChange) {
            _this.__onFinishChange.call(_this, _this.getValue());
          }
        }

        this.updateDisplay();

        this.domElement.appendChild(this.__input);
      };

      StringController.superclass = Controller;

      common.extend(
        StringController.prototype,
        Controller.prototype,

        {
          updateDisplay: function () {
            // Stops the caret from moving on account of:
            // keyup -> setValue -> updateDisplay
            if (!dom.isActive(this.__input)) {
              this.__input.value = this.getValue();
            }
            return StringController.superclass.prototype.updateDisplay.call(this);
          },
        }
      );

      return StringController;
    })(dat.controllers.Controller, dat.dom.dom, dat.utils.common)),
    (dat.controllers.ArrayController = (function (Controller, dom, common) {
      /**
       * @class Provides a text input to alter the array property of an object.
       *        Automatically converts strings to numbers and boolean values if appropriate.
       *
       * @extends dat.controllers.Controller
       *
       * @param {Object} object The object to be manipulated
       * @param {string} property The name of the property to be manipulated
       *
       * @member dat.controllers
       */
      var ArrayController = function (object, property) {
        ArrayController.superclass.call(this, object, property);

        var _this = this;

        this.__input = document.createElement("input");
        this.__input.setAttribute("type", "text");

        dom.bind(this.__input, "keyup", onChange);
        dom.bind(this.__input, "change", onChange);
        dom.bind(this.__input, "blur", onBlur);
        dom.bind(this.__input, "keydown", function (e) {
          if (e.keyCode === 13) {
            this.blur();
          }
        });

        function onChange() {
          var arr = _this.__input.value.replace(/^\s*|\s*$/g, "").split(/\s*,\s*/);

          // The resulting values will all be strings, so convert them here to actual data types
          for (var i = 0; i < arr.length; i++) {
            var value = arr[i];
            if (!isNaN(value)) {
              arr[i] = +value;
              continue;
            } else if (value === "true") {
              arr[i] = true;
            } else if (value === "false") {
              arr[i] = false;
            }
          }
          _this.setValue(arr);
        }

        function onBlur() {
          if (_this.__onFinishChange) {
            _this.__onFinishChange.call(_this, _this.getValue());
          }
        }

        this.updateDisplay();

        this.domElement.appendChild(this.__input);
      };

      ArrayController.superclass = Controller;

      common.extend(
        ArrayController.prototype,
        Controller.prototype,

        {
          updateDisplay: function () {
            // Stops the caret from moving on account of:
            // keyup -> setValue -> updateDisplay
            if (!dom.isActive(this.__input)) {
              this.__input.value = this.getValue();
            }
            return ArrayController.superclass.prototype.updateDisplay.call(this);
          },
        }
      );

      return ArrayController;
    })(dat.gui.settings, dat.controllers.Controller, dat.dom.dom, dat.utils.common)),
    dat.controllers.TextAreaController,
    dat.controllers.FunctionController,
    dat.controllers.BooleanController,
    dat.utils.common
  )),
  dat.controllers.Controller,
  dat.controllers.BooleanController,
  dat.controllers.FunctionController,
  dat.controllers.NumberControllerBox,
  dat.controllers.NumberControllerSlider,
  dat.controllers.OptionController,
  (dat.controllers.ColorController = (function (settings, Controller, dom, Color, interpret, common) {
    var ColorController = function (object, property) {
      ColorController.superclass.call(this, object, property);

      this.__color = new Color(this.getValue());
      this.__temp = new Color(0);

      var _this = this;

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

      dom.bind(this.__input, "keydown", function (e) {
        if (e.keyCode === 13) {
          // on enter
          onBlur.call(this);
        }
      });

      dom.bind(this.__input, "blur", onBlur);

      dom.bind(this.__selector, "mousedown", function (e) {
        dom.addClass(this, "drag").bind(settings.WINDOW, "mouseup", function (e) {
          dom.removeClass(_this.__selector, "drag");
        });
      });

      var value_field = settings.DOCUMENT.createElement("div");

      common.extend(this.__selector.style, {
        width: "122px",
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
        textShadow: this.__input_textShadow + "rgba(0,0,0,0.7)",
      });

      dom.bind(this.__saturation_field, "mousedown", fieldDown);
      dom.bind(this.__field_knob, "mousedown", fieldDown);

      dom.bind(this.__hue_field, "mousedown", function (e) {
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
        var i = interpret(this.value);
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

      this.__saturation_field.appendChild(value_field);
      this.__selector.appendChild(this.__field_knob);
      this.__selector.appendChild(this.__saturation_field);
      this.__selector.appendChild(this.__hue_field);
      this.__hue_field.appendChild(this.__hue_knob);

      this.domElement.appendChild(this.__input);
      this.domElement.appendChild(this.__selector);

      this.updateDisplay();

      function setSV(e) {
        e.preventDefault();

        var w = dom.getWidth(_this.__saturation_field);
        var o = dom.getOffset(_this.__saturation_field);
        var s = (e.clientX - o.left + settings.DOCUMENT.body.scrollLeft) / w;
        var v = 1 - (e.clientY - o.top + settings.DOCUMENT.body.scrollTop) / w;

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

        var s = dom.getHeight(_this.__hue_field);
        var o = dom.getOffset(_this.__hue_field);
        var h = 1 - (e.clientY - o.top + settings.DOCUMENT.body.scrollTop) / s;

        if (h > 1) h = 1;
        else if (h < 0) h = 0;

        _this.__color.h = h * 360;

        _this.setValue(_this.__color.toOriginal());

        return false;
      }
    };

    ColorController.superclass = Controller;

    common.extend(
      ColorController.prototype,
      Controller.prototype,

      {
        updateDisplay: function () {
          var i = interpret(this.getValue());

          if (i !== false) {
            var mismatch = false;

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

          var flip = this.__color.v < 0.5 || this.__color.s > 0.5 ? 255 : 0;
          var _flip = 255 - flip;

          common.extend(this.__field_knob.style, {
            marginLeft: 100 * this.__color.s - 7 + "px",
            marginTop: 100 * (1 - this.__color.v) - 7 + "px",
            backgroundColor: this.__temp.toString(),
            border: this.__field_knob_border + "rgb(" + flip + "," + flip + "," + flip + ")",
          });

          this.__hue_knob.style.marginTop = (1 - this.__color.h / 360) * 100 + "px";

          this.__temp.s = 1;
          this.__temp.v = 1;

          linearGradient(this.__saturation_field, "left", "#fff", this.__temp.toString());

          common.extend(this.__input.style, {
            backgroundColor: (this.__input.value = this.__color.toString()),
            color: "rgb(" + flip + "," + flip + "," + flip + ")",
            textShadow: this.__input_textShadow + "rgba(" + _flip + "," + _flip + "," + _flip + ",.7)",
          });
        },
      }
    );

    var vendors = ["-moz-", "-o-", "-webkit-", "-ms-", ""];

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

    return ColorController;
  })(
    dat.gui.settings,
    dat.controllers.Controller,
    dat.dom.dom,
    (dat.color.Color = (function (interpret, math, toString, common) {
      var Color = function () {
        this.__state = interpret.apply(this, arguments);

        if (this.__state === false) {
          throw "Failed to interpret color arguments";
        }

        this.__state.a = this.__state.a || 1;
      };

      Color.COMPONENTS = ["r", "g", "b", "h", "s", "v", "hex", "a"];

      common.extend(Color.prototype, {
        toString: function () {
          return toString(this);
        },

        toOriginal: function () {
          return this.__state.conversion.write(this);
        },
      });

      defineRGBComponent(Color.prototype, "r", 2);
      defineRGBComponent(Color.prototype, "g", 1);
      defineRGBComponent(Color.prototype, "b", 0);

      defineHSVComponent(Color.prototype, "h");
      defineHSVComponent(Color.prototype, "s");
      defineHSVComponent(Color.prototype, "v");

      Object.defineProperty(Color.prototype, "a", {
        get: function () {
          return this.__state.a;
        },

        set: function (v) {
          this.__state.a = v;
        },
      });

      Object.defineProperty(Color.prototype, "hex", {
        get: function () {
          if (!this.__state.space !== "HEX") {
            this.__state.hex = math.rgb_to_hex(this.r, this.g, this.b);
          }

          return this.__state.hex;
        },

        set: function (v) {
          this.__state.space = "HEX";
          this.__state.hex = v;
        },
      });

      function defineRGBComponent(target, component, componentHexIndex) {
        Object.defineProperty(target, component, {
          get: function () {
            if (this.__state.space === "RGB") {
              return this.__state[component];
            }

            recalculateRGB(this, component, componentHexIndex);

            return this.__state[component];
          },

          set: function (v) {
            if (this.__state.space !== "RGB") {
              recalculateRGB(this, component, componentHexIndex);
              this.__state.space = "RGB";
            }

            this.__state[component] = v;
          },
        });
      }

      function defineHSVComponent(target, component) {
        Object.defineProperty(target, component, {
          get: function () {
            if (this.__state.space === "HSV") return this.__state[component];

            recalculateHSV(this);

            return this.__state[component];
          },

          set: function (v) {
            if (this.__state.space !== "HSV") {
              recalculateHSV(this);
              this.__state.space = "HSV";
            }

            this.__state[component] = v;
          },
        });
      }

      function recalculateRGB(color, component, componentHexIndex) {
        if (color.__state.space === "HEX") {
          color.__state[component] = math.component_from_hex(color.__state.hex, componentHexIndex);
        } else if (color.__state.space === "HSV") {
          common.extend(color.__state, math.hsv_to_rgb(color.__state.h, color.__state.s, color.__state.v));
        } else {
          throw "Corrupted color state";
        }
      }

      function recalculateHSV(color) {
        var result = math.rgb_to_hsv(color.r, color.g, color.b);

        common.extend(color.__state, {
          s: result.s,
          v: result.v,
        });

        if (!common.isNaN(result.h)) {
          color.__state.h = result.h;
        } else if (common.isUndefined(color.__state.h)) {
          color.__state.h = 0;
        }
      }

      return Color;
    })(
      dat.color.interpret,
      (dat.color.math = (function () {
        var tmpComponent;

        return {
          hsv_to_rgb: function (h, s, v) {
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

          rgb_to_hsv: function (r, g, b) {
            var min = Math.min(r, g, b);
            var max = Math.max(r, g, b);
            var delta = max - min;
            var h;
            var s;

            if (max != 0) {
              s = delta / max;
            } else {
              return {
                h: NaN,
                s: 0,
                v: 0,
              };
            }

            if (r == max) {
              h = (g - b) / delta;
            } else if (g == max) {
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

          rgb_to_hex: function (r, g, b) {
            var hex = this.hex_with_component(0, 2, r);
            hex = this.hex_with_component(hex, 1, g);
            hex = this.hex_with_component(hex, 0, b);
            return hex;
          },

          component_from_hex: function (hex, componentIndex) {
            return (hex >> (componentIndex * 8)) & 0xff;
          },

          hex_with_component: function (hex, componentIndex, value) {
            return (value << (tmpComponent = componentIndex * 8)) | (hex & ~(0xff << tmpComponent));
          },
        };
      })()),
      dat.color.toString,
      dat.utils.common
    )),
    dat.color.interpret,
    dat.utils.common
  )),
  (dat.controllers.EasingFunctionController = (function (Controller, dom, EasingFunction, common) {
    var EasingFunctionController = function (object, property) {
      EasingFunctionController.superclass.call(this, object, property);

      var _this = this;
      this.domElement = document.createElement("div");
      dom.makeSelectable(this.domElement, false);

      this.__func = new EasingFunction(object[property]);
      this.__cursor = 0.0; // 0.0-1.0

      this.__mouse_over = false;
      this.__point_over = null;
      this.__point_selected = null;
      this.__point_selected_type = null;
      this.__point_moving = false;

      var width = 146;
      var height = 80;
      var rectView = { top: 1, left: 3, width: width - 2, height: height - 16 };
      var rV = rectView;

      this.__thumbnail = document.createElement("canvas");
      this.__thumbnail.width = width * 2;
      this.__thumbnail.height = height * 2;
      this.__thumbnail.className = "easing-thumbnail";
      this.__ctx = this.__thumbnail.getContext("2d");
      this.__ctx.scale(2, 2);

      dom.bind(this.__thumbnail, "contextmenu", function (e) {
        e.preventDefault();
      });
      dom.bind(this.__thumbnail, "mouseover", onMouseOver);
      dom.bind(this.__thumbnail, "mouseout", onMouseOut);
      dom.bind(this.__thumbnail, "mousedown", onMouseDown);
      dom.bind(this.__thumbnail, "dblclick", onDoubleClick);
      dom.bind(this.__thumbnail, "mousemove", onMouseMove);
      dom.bind(this.__thumbnail, "mouseup", onMouseUp);
      dom.bind(this.__thumbnail, "mouseup", onMouseUp);

      function toCoord(x, y) {
        return [rV.top + x * rV.width, rV.left + (1 - y) * rV.height];
      }
      function toNorm(elem, e) {
        var mouseX = e.pageX - elem.offsetLeft;
        var mouseY = e.pageY - elem.offsetTop;
        return [0 + (mouseX - rV.left + 1) / (rV.width - 2), 1 - (mouseY - rV.top - 2) / rV.height];
      }
      function moveTo(x, y) {
        _this.__ctx.moveTo(rV.top + x * rV.width, rV.left + (1 - y) * rV.height);
      }
      function lineTo(x, y) {
        _this.__ctx.lineTo(rV.top + x * rV.width, rV.left + (1 - y) * rV.height);
      }
      function curveTo(c1x, c1y, c2x, c2y, ax, ay) {
        _this.__ctx.bezierCurveTo(
          rV.top + c1x * rV.width,
          rV.left + (1 - c1y) * rV.height,
          rV.top + c2x * rV.width,
          rV.left + (1 - c2y) * rV.height,
          rV.top + ax * rV.width,
          rV.left + (1 - ay) * rV.height
        );
      }
      function beginPath() {
        _this.__ctx.beginPath();
      }
      function closePath() {
        _this.__ctx.closePath();
      }
      function stroke() {
        _this.__ctx.stroke();
      }
      function fill() {
        _this.__ctx.fill();
      }
      function circle(x, y, r) {
        var p = toCoord(x, y);
        _this.__ctx.arc(p[0], p[1], r, 0, Math.PI * 2);
      }
      function square(x, y, r) {
        var p = toCoord(x, y);
        _this.__ctx.rect(p[0] - r, p[1] - r, r * 2, r * 2);
      }

      // --- main ---
      this.clear = function () {
        _this.__ctx.clearRect(0, 0, width, height);
      };
      this.drawRuler = function () {
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
          var x = i / 4.01; // dirty hack
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

      this.drawEasingFunction = function (easing_func) {
        var ctx = _this.__ctx;
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 1;

        beginPath();
        easing_func.getSegments().forEach(function (s, i) {
          moveTo.apply(null, s.slice(0, 2));
          curveTo.apply(null, s.slice(2));
        });
        stroke();

        // Display points and handles
        if (!_this.__mouse_over) {
          return;
        }

        ctx.fillStyle = "#fff";
        ctx.strokeStyle = "#f90";
        ctx.lineWidth = 2;
        easing_func.points.forEach(function (p, i) {
          if (_this.__mouseo_over && i == _this.__point_over) {
            return;
          }
          if (i == _this.__point_selected) {
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

          // handle
          beginPath();
          moveTo(p.x + p.l + 0.01, p.y);
          lineTo(p.x + p.r - 0.01, p.y);
          stroke();

          // knobs
          ["l", "r"].forEach(function (dir) {
            beginPath();
            circle(p.x + p[dir], p.y, 2);
            fill();
            stroke();
          });

          // anchor
          beginPath();
          square(p.x, p.y, 3);
          fill();
          stroke();
        }
      };

      this.setCursor = function (x) {
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

      function onMouseDown(e) {
        e.preventDefault();

        var coord = toNorm(this, e);
        var point, index, type;

        if (Number.isInteger(_this.__point_selected)) {
          point = _this.__func.findPointWithHandle(coord[0], coord[1]);
        } else {
          point = _this.__func.findPoint(coord[0], coord[1]);
        }
        // console.log(point);
        (index = point.index), (type = point.type);

        if (index !== undefined) {
          if (e.button == 2 && type == "ANCHOR") {
            // right click
            var delete_successful = _this.__func.deletePoint(index);
            if (delete_successful) {
              index = undefined;
            }
          }
        }

        if (index !== undefined) {
          if (_this.__point_selected == index) {
            _this.__point_selected_type = type; // we can select handle points
          } else {
            _this.__point_selected = index;
            _this.__point_selected_type = "ANCHOR"; // force the anchor point
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
          var index = _this.__func.findPoint(coord[0], coord[1]).index;
          if (index !== undefined) {
            _this.__point_over = index;
          } else {
            _this.__point_over = null;
          }
        }

        _this.updateDisplay();

        // setCursor(coord[0]);   // [DEBUG]
      }

      function onMouseUp(e) {
        e.preventDefault();
        _this.__point_moving = false;
        _this.updateDisplay();
      }

      common.extend(this.__thumbnail.style, {
        width: width + "px",
        height: height + "px",
        cursor: "crosshair",
        // cursor: 'ew-resize'
        // cursor: 'move'
      });

      // Acknowledge original value
      this.updateDisplay();

      this.domElement.appendChild(this.__thumbnail);
    };

    EasingFunctionController.superclass = Controller;

    common.extend(
      EasingFunctionController.prototype,
      Controller.prototype,

      {
        setValue: function (v) {
          var toReturn = EasingFunctionController.superclass.prototype.setValue.call(this, v);
          if (this.__onFinishChange) {
            this.__onFinishChange.call(this, this.getValue());
          }
          return toReturn;
        },

        updateDisplay: function () {
          // this.__select.value = this.getValue();
          this.clear();
          this.drawRuler();
          this.drawEasingFunction(this.__func);
        },
      }
    );

    return EasingFunctionController;
  })(
    dat.controllers.Controller,
    dat.dom.dom,
    (dat.easing.Easing = (function () {
      function clipFunc(min, max) {
        return function (v) {
          if (v < min) {
            return min;
          } else if (v > max) {
            return max;
          } else {
            return v;
          }
        };
      }
      var clip01 = clipFunc(0.0, 1.0);

      // See http://pomax.github.io/bezierinfo/#explanation
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

      /**
       * EasingFunctionPoint constructor. The constructor argument can be:
       *
       * 1. numerical array/4 ordered x,y,l,r
       * 2. {x:..., y:..., l:..., r:...}
       *
       */
      var EasingFunctionPoint = function (coord) {
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

      /**
       * EasingFunction constructor.
       *
       * The constructor argument is array of EasingFunctionPoint or undefined.
       */
      var EasingFunction = function (_points) {
        var rawPoints = _points || [
          { x: 0, y: 0, l: 0, r: 0.5 },
          { x: 1, y: 1, l: 0.5, r: 0 },
        ];
        var points = [];
        rawPoints.forEach(function (p) {
          points.push(new EasingFunctionPoint(p));
        });
        this.points = points;
      };

      EasingFunction.Point = EasingFunctionPoint;

      EasingFunction.prototype = {
        toString: function () {
          return "something";
        },

        movePoint: function (index, type, x, y) {
          var p = this.points[index];

          if (type == "LEFT") {
            p.l = x - p.x;
          } else if (type == "RIGHT") {
            p.r = x - p.x;
          } else {
            // ANCHOR
            p.x = x;
            p.y = y;
          }

          this.constrainPoints();
        },
        constrainPoints: function () {
          var pl, p, pr;
          var _this = this;
          var last = function (i) {
            return i == _this.points.length - 1;
          };

          for (var i = 0; i < this.points.length; i++) {
            p = this.points[i];
            pl = i > 0 ? this.points[i - 1] : undefined;
            pr = !last(i) ? this.points[i + 1] : undefined;

            // anchor
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

            // left
            if (pl !== undefined) {
              p.l = clipFunc(pl.x - p.x, 0)(p.l);
            } else {
              p.l = 0;
            }

            // right
            if (pr !== undefined) {
              p.r = clipFunc(0, pr.x - p.x)(p.r);
            } else {
              p.r = 0;
            }
          }
        },
        findPoint: function (x, y, r) {
          r = r || 0.035; // [FIXME] magic number
          var dx, dy, h;
          var minD = Infinity;
          var minIndex;
          var type;

          this.points.forEach(function (p, i) {
            (dx = x - p.x), (dy = y - p.y);
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
        findPointWithHandle: function (x, y, r) {
          r = r || 0.035; // [FIXME] magic number
          var dx, dy, h;
          var minD = Infinity;
          var minIndex;
          var minType;
          var candidates, d, type;
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
              (d = cand[0]), (type = cand[1]);

              (dx = x - p.x - d), (dy = y - p.y);
              h = dx * dx + dy * dy;
              if (h < r * r && minD > h) {
                minD = h;
                minIndex = i;
                minType = type;
              }
            });
          });

          return { index: minIndex, type: minType };
        },
        addPoint: function (x, y) {
          for (var i = 1; i < this.points.length - 1; i++) {
            if (x <= this.points[i].x) {
              break;
            }
          }
          var point = new EasingFunctionPoint({ x: x, y: y, l: 0.0, r: 0.0 });
          this.points.splice(i, 0, point);
          this.constrainPoints();
          return point;
        },
        deletePoint: function (i) {
          if (i == 0 || i == this.points.length - 1) {
            return false;
          } else {
            this.points.splice(i, 1);
            return true;
          }
        },

        getSegments: function () {
          var segments = [];
          var p1, p2;
          for (var i = 0; i < this.points.length - 1; i++) {
            p1 = this.points[i];
            p2 = this.points[i + 1];

            segments.push([
              p1.x,
              p1.y, // anchor point 1
              p1.x + p1.r,
              p1.y, // control point 1
              p2.x + p2.l,
              p2.y, // control point 2
              p2.x,
              p2.y, // anchor point 2
            ]);
          }
          return segments;
        },
        getSegmentByX: function (x) {
          var p1, p2;
          for (var i = 1; i < this.points.length - 1; i++) {
            if (x <= this.points[i].x) {
              break;
            }
          }
          p1 = this.points[i - 1];
          p2 = this.points[i];
          return [p1.x, p1.y, p1.x + p1.r, p1.y, p2.x + p2.l, p2.y, p2.x, p2.y];
        },

        calculateY: function (x) {
          x = clip01(x);
          if (x < EPSILON) {
            x = EPSILON;
          }

          var segment = this.getSegmentByX(x);
          var funcX = cubicFunc(segment[0], segment[2], segment[4], segment[6]);
          var funcY = cubicFunc(segment[1], segment[3], segment[5], segment[7]);
          var derivX = cubicFuncDeriv(segment[0], segment[2], segment[4], segment[6]);

          // Newton's method
          var t = 0.5; // initial
          var dt, slope;
          for (var i = 0; i < 20; i++) {
            dt = funcX(t) - x;
            if (Math.abs(dt) < EPSILON) {
              return funcY(clip01(t));
            }
            slope = derivX(t);
            t = t - dt / slope;
          }

          // Newton's method failed. Then we use bisection method instead
          var funcXd = function (t) {
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

      return EasingFunction;
    })()),
    dat.utils.common
  )),
  (dat.utils.requestAnimationFrame = (function () {
    /**
     * requirejs version of Paul Irish's RequestAnimationFrame
     * http://paulirish.com/2011/requestanimationframe-for-smart-animating/
     */

    return (
      window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.oRequestAnimationFrame ||
      window.msRequestAnimationFrame ||
      function (callback, element) {
        window.setTimeout(callback, 1000 / 60);
      }
    );
  })()),
  (dat.dom.CenteredDiv = (function (settings, dom, common) {
    var CenteredDiv = function () {
      this.backgroundElement = settings.DOCUMENT.createElement("div");
      common.extend(this.backgroundElement.style, {
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

      this.domElement = settings.DOCUMENT.createElement("div");
      common.extend(this.domElement.style, {
        position: "fixed",
        display: "none",
        zIndex: "1001",
        opacity: 0,
        WebkitTransition: "-webkit-transform 0.2s ease-out, opacity 0.2s linear",
        transition: "transform 0.2s ease-out, opacity 0.2s linear",
      });

      settings.DOCUMENT.body.appendChild(this.backgroundElement);
      settings.DOCUMENT.body.appendChild(this.domElement);

      var _this = this;
      dom.bind(this.backgroundElement, "click", function () {
        _this.hide();
      });
    };

    CenteredDiv.prototype.show = function () {
      var _this = this;

      this.backgroundElement.style.display = "block";

      this.domElement.style.display = "block";
      this.domElement.style.opacity = 0;
      //    this.domElement.style.top = '52%';
      this.domElement.style.webkitTransform = "scale(1.1)";

      this.layout();

      common.defer(function () {
        _this.backgroundElement.style.opacity = 1;
        _this.domElement.style.opacity = 1;
        _this.domElement.style.webkitTransform = "scale(1)";
      });
    };

    CenteredDiv.prototype.hide = function () {
      var _this = this;

      var hide = function () {
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
      //    this.domElement.style.top = '48%';
      this.domElement.style.opacity = 0;
      this.domElement.style.webkitTransform = "scale(1.1)";
    };

    CenteredDiv.prototype.layout = function () {
      this.domElement.style.left = settings.WINDOW.innerWidth / 2 - dom.getWidth(this.domElement) / 2 + "px";
      this.domElement.style.top = settings.WINDOW.innerHeight / 2 - dom.getHeight(this.domElement) / 2 + "px";
    };

    function lockScroll(e) {
      console.log(e);
    }

    return CenteredDiv;
  })(dat.gui.settings, dat.dom.dom, dat.utils.common)),
  dat.dom.dom,
  dat.utils.common
);
