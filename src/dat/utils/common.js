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

const ARR_EACH = Array.prototype.forEach;
const ARR_SLICE = Array.prototype.slice;

/**
 * Band-aid methods for things that should be a lot easier in JavaScript.
 * Implementation and structure inspired by underscore.js
 * http://documentcloud.github.com/underscore/
 */

const Common = {
  BREAK: {},

  extend: function (target) {
    this.each(
      ARR_SLICE.call(arguments, 1),
      function (obj) {
        for (const key in obj) {
          if (!this.isUndefined(obj[key])) {
            target[key] = obj[key];
          }
        }
      },
      this
    );

    return target;
  },

  defaults: function (target) {
    this.each(
      ARR_SLICE.call(arguments, 1),
      function (obj) {
        for (const key in obj) {
          if (this.isUndefined(target[key])) {
            target[key] = obj[key];
          }
        }
      },
      this
    );

    return target;
  },

  compose: function () {
    const toCall = ARR_SLICE.call(arguments);
    return function () {
      let args = ARR_SLICE.call(arguments);
      for (let i = toCall.length - 1; i >= 0; i--) {
        args = [toCall[i].apply(this, args)];
      }
      return args[0];
    };
  },

  each: function (obj, itr, scope) {
    if (!obj) {
      return;
    }

    // if (ARR_EACH && obj.forEach && obj.forEach === ARR_EACH) {
    if (obj.forEach) {
      obj.forEach(itr, scope);
    } else if (obj.length === obj.length + 0) {
      // Is number but not NaN
      for (let key = 0, l = obj.length; key < l; key++) {
        if (key in obj && itr.call(scope, obj[key], key) === this.BREAK) {
          return;
        }
      }
    } else {
      for (const objkey in obj) {
        if (itr.call(scope, obj[objkey], objkey) === this.BREAK) {
          return;
        }
      }
    }
  },

  defer: function (fnc) {
    setTimeout(fnc, 0);
  },

  toArray: function (obj) {
    if (obj.toArray) {
      return obj.toArray();
    }
    return ARR_SLICE.call(obj);
  },

  isUndefined: function (obj) {
    return obj === undefined;
  },

  isNull: function (obj) {
    return obj === null;
  },

  isNaN: function (obj) {
    //
    // See for the difference between `isNan()` and `Number.isNaN()`:
    // - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/isNaN#Description
    // - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isNaN
    //
    return Number.isNaN(obj);
  },

  // isArray: Array.isArray || function(obj) {
  isArray: function (obj) {
    // return obj.constructor === Array;
    return obj != null && obj.length >= 0 && typeof obj === "object";
  },

  isObject: function (obj) {
    return obj === Object(obj);
  },

  isNumber: function (obj) {
    return obj === obj + 0;
  },

  isFiniteNumber: function (obj) {
    return obj === +obj && isFinite(obj);
  },

  isString: function (obj) {
    return typeof obj === "string";
  },

  isBoolean: function (obj) {
    return obj === false || obj === true;
  },

  isFunction: function (obj) {
    return obj instanceof Function;
  },

  hasOwnProperty: function (obj, prop) {
    // TODO: fix this one up
    const proto = obj.constructor.prototype;
    let proto_prop;
    try {
      proto_prop = proto[prop];
    } catch (err) {
      console.warn('property "' + prop + '" is unaccessible in prototype of object', obj);
    }
    return prop in obj && (!(prop in proto) || proto_prop !== obj[prop]);
  },
};

export default Common;
