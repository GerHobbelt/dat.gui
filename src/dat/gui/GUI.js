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

import css from "../utils/css";
import saveDialogueContents from "./saveDialogue.html";
import controllerFactory from "../controllers/ControllerFactory";
import Controller from "../controllers/Controller";
import Array1Controller from "../controllers/Array1Controller";
import ArrayNController from "../controllers/ArrayNController";
import BgColorController from "../controllers/BgColorController";
import BooleanController from "../controllers/BooleanController";
import ColorController from "../controllers/ColorController";
import CustomController from "../controllers/CustomController";
import EasingFunctionController from "../controllers/EasingFunctionController";
import FileController from "../controllers/FileController";
import FunctionController from "../controllers/FunctionController";
import GradientController from "../controllers/GradientController";
import GtColorController from "../controllers/GtColorController";
import HSVColorController from "../controllers/HSVColorController";
import ImageController from "../controllers/ImageController";
import ImageFileController from "../controllers/ImageFileController";
import NgColorController from "../controllers/NgColorController";
import NumberController from "../controllers/NumberController";
import NumberControllerAnimator from "../controllers/NumberControllerAnimator";
import NumberControllerBox from "../controllers/NumberControllerBox";
import NumberControllerSlider from "../controllers/NumberControllerSlider";
import ObjectController from "../controllers/ObjectController";
import OptionController from "../controllers/OptionController";
import PlotterController from "../controllers/PlotterController";
import requestAnimationFrame from "../utils/requestAnimationFrame";
import StringController from "../controllers/StringController";
import TabbedController from "../controllers/TabbedController";
import TextAreaController from "../controllers/TextAreaController";
import UndefinedController from "../controllers/UndefinedController";
import UserMediaController from "../controllers/UserMediaController";
import VectorController from "../controllers/VectorController";
import CenteredDiv from "../dom/CenteredDiv";
import dom from "../dom/dom";
import common from "../utils/common";
import autocomplete from "../dom/autocomplete";

// import styleSheet from "./style.scss"; // CSS to embed in build

// var ARR_EACH = Array.prototype.forEach;
const ARR_SLICE = Array.prototype.slice;

// css.inject(styleSheet);

/** Outer-most className for GUI's */
const CSS_NAMESPACE = "dg";

const HIDE_KEY_CODE = 72;

/** Caches the height of the Close Button. */
let CLOSE_BUTTON_HEIGHT = 0;

const DEFAULT_DEFAULT_PRESET_NAME = "Default";

const SUPPORTS_LOCAL_STORAGE = (function () {
  try {
    return "localStorage" in window && !!window.localStorage;
  } catch (e) {
    return false;
  }
})();

let SAVE_DIALOGUE;

/** Have we yet to create an autoPlace GUI? */
let autoPlaceVirgin = true;

/** Fixed position div that auto place GUI's go inside */
let autoPlaceContainer;

/** Are we hiding the GUI's ? */
let hide = false;

/** @private GUI's which should be hidden */
const hideableGuis = [];

/**
 * A lightweight controller library for JavaScript. It allows you to easily
 * manipulate variables and fire functions on the fly.
 *
 * @typicalname gui
 *
 * @example
 * // Creating a GUI with options.
 * var gui = new dat.GUI({name: 'My GUI'});
 *
 * @example
 * // Creating a GUI and a subfolder.
 * var gui = new dat.GUI();
 * var folder1 = gui.addFolder('Flow Field');
 *
 * @param {Object} [params]
 * @param {String} [params.name] The name of this GUI.
 * @param {Object} [params.load] JSON object representing the saved state of this GUI.
 * @param {Object} [params.object] Providing your object will create a controller for each property automatically
 * @param {GUI} [params.parent] The GUI I'm nested in.
 * @param {Boolean} [params.autoPlace=true]
 * @param {Boolean} [params.hideable=true] If true, GUI is shown/hidden by <kbd>h</kbd> keypress.
 * @param {Boolean} [params.closed=false] If true, starts closed
 * @param {Boolean} [params.closeOnTop=false] If true, close/open button shows on top of the GUI
 * @param {String} [params.closeStr] close string
 * @param {String} [params.openStr] open string
 */
class GUI {
  constructor(params) {
    const _this = this;

    params = params || {};

    this.__typeControllers = {
      bgcolor: BgColorController,
      boolean: BooleanController,
      color: ColorController,
      easing: EasingFunctionController,
      file: FileController,
      function: FunctionController,
      gradient: GradientController,
      gtcolor: GtColorController,
      hsvcolor: HSVColorController,
      image: ImageController,
      imagefile: ImageFileController,
      multiline: TextAreaController,
      ngcolor: NgColorController,
      number: NumberController,
      numberBox: NumberControllerBox,
      numberSlider: NumberControllerSlider,
      object: ObjectController,
      option: OptionController,
      plotter: PlotterController,
      string: StringController,
      usermedia: UserMediaController,
      // WARNING: never add the Null and Undefined controllers to the standard lookup list as this will break the ControllerFactory internals:
      //
      // 'null': NullController,
      // 'undefined': UndefinedController
    };

    /**
     * Outermost DOM Element
     * @type {DOMElement}
     */
    this.domElement = document.createElement("div");
    this.__ul = document.createElement("ul");
    this.domElement.appendChild(this.__ul);

    dom.addClass(this.domElement, CSS_NAMESPACE);

    /**
     * Nested GUI's by name
     * @private
     */
    this.__folders = {};

    /**
     * The collection of currently active controller instances in the UI.
     *
     * Use the {getControllerByName()} API to get search this list and obtain a controller instance reference.
     * @private
     */
    this.__controllers = [];

    this.__onClosedChange = null;

    /**
     * List of objects I'm remembering for save, only used in top level GUI
     * @private
     */
    this.__rememberedObjects = [];

    /**
     * Maps the index of remembered objects to a map of controllers, only used
     * in top level GUI.
     *
     * @private
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

    /**
     * Called on change of child elements.
     */
    this.__onChange = undefined;

    /**
     * Called on finish change of child elements.
     */
    this.__onFinishChange = undefined;

    this.__listening = [];

    const __resizeDebounced = common.debounce(function () {
      _this.onResize();
    }, 50);

    /**
     * Debounced {onResize} handler. Use this instead of {onResize} directly to improve
     * performance on mobile and other low power platforms.
     */
    this.onResizeDebounced = __resizeDebounced;

    // Default parameters
    params = common.defaults(params, {
      closeOnTop: false,
      autoPlace: true,
      width: GUI.DEFAULT_WIDTH,
      showCloseButton: true,
    });

    params = common.defaults(params, {
      resizable: params.autoPlace,
      hideable: params.autoPlace,
    });

    if (!common.isUndefined(params.load)) {
      // Explicit preset
      if (params.preset) {
        params.load.preset = params.preset;
      }
    } else {
      params.load = {
        preset: DEFAULT_DEFAULT_PRESET_NAME,
      };
    }

    if (common.isUndefined(params.closeStr)) {
      params.closeStr = GUI.TEXT_CLOSED;
    }

    if (common.isUndefined(params.openStr)) {
      params.openStr = GUI.TEXT_OPEN;
    }

    if (common.isUndefined(params.parent) && params.hideable) {
      hideableGuis.push(this);
    }

    // Only root level GUI's are resizable.
    params.resizable = common.isUndefined(params.parent) && params.resizable;

    if (params.autoPlace && common.isUndefined(params.scrollable)) {
      params.scrollable = true;
    }
    //    params.scrollable = common.isUndefined(params.parent) && params.scrollable === true;

    // Not part of params because I don't want people passing this in via
    // constructor. Should be a 'remembered' value.
    let useLocalStorage =
      SUPPORTS_LOCAL_STORAGE && window.localStorage.getItem(getLocalStorageHash(this, "isLocal")) === "true";

    let saveToLocalStorage;
    let titleRow;

    Object.defineProperties(
      this,
      /** @lends GUI.prototype */
      {
        /**
         * Toggles light theme
         * @type Boolean
         */
        lightTheme: {
          set: function (v) {
            params.lightTheme = v;
            if (v) dom.addClass(_this.domElement, GUI.CLASS_LIGHT_THEME);
            else dom.removeClass(_this.domElement, GUI.CLASS_LIGHT_THEME);
          },

          get: function () {
            return params.lightTheme;
          },
        },

        /**
         * Toggles open/close button
         * @type Boolean
         */
        showCloseButton: {
          set: function (v) {
            params.showCloseButton = v;
            if (v) dom.removeClass(_this.__closeButton, GUI.CLASS_DISPLAY_NONE);
            else dom.addClass(_this.__closeButton, GUI.CLASS_DISPLAY_NONE);
          },

          get: function () {
            return params.showCloseButton;
          },
        },

        /**
         * The parent <code>GUI</code>
         * @type GUI
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
         * Handles <code>GUI</code>'s position of open/close button
         * @type Boolean
         */
        closeOnTop: {
          get: function () {
            return params.closeOnTop;
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
            }
            return params.load.preset;
          },

          set: function (v) {
            if (_this.parent) {
              _this.getRoot().preset = v;
            } else {
              params.load.preset = v;
            }
            setPresetSelectIndex(_this);
            _this.revert();
            return _this;
          },
        },

        /**
         * The width of the <code>GUI</code> element
         * @type Number
         */
        width: {
          get: function () {
            return params.width;
          },
          set: function (v) {
            params.width = v;
            setWidth(_this, v);
            return _this;
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
            // Check for collisions among sibling folders:
            // We have to prevent collisions on names in order to have a key
            // by which to remember saved values.
            if (v !== params.name && _this.__folders[v] !== undefined) {
              throw new Error("name collision: another sibling GUI folder has the same name");
            }
            params.name = v;
            if (_this.__closeButton) {
              _this.__closeButton.innerHTML = params.name;
            }
            if (titleRow) {
              titleRow.innerHTML = params.name;
            }
            return _this;
          },
        },

        /**
         * The name of <code>GUI</code>. Used for folders. i.e
         * a folder's title
         * @type String
         */
        title: {
          get: function () {
            return params.title;
          },
          set: function (v) {
            params.title = v;
            if (titleRow) {
              if (common.isString(params.title)) {
                titleRow.setAttribute("title", params.title);
              } else {
                titleRow.removeAttribute("title");
              }
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
            // Let's just check our height against the window height right off
            // the bat.
            _this.onResizeDebounced();

            if (_this.__closeButton) {
              if (params.name) {
                _this.__closeButton.innerHTML = params.name;
              } else {
                _this.__closeButton.innerHTML = v ? params.openStr : params.closeStr;
              }
            }
            return _this;
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
          // Return:
          // - FALSE when localStorage has been *explicitly disabled* (by executing `this.useLocalStorage = false;` some time before)
          // - NULL when localStorage is not available
          // - TRUE when localStorage is available and has been enabled (localStorage is enabled by default)
          get: function () {
            return useLocalStorage;
          },
          // @param {bool}:
          // - truthy value: explicitly enables localStorage (when the browser supports it)
          //
          // - falsey value (except `null` or `undefined`): explicitly *disables* localStorage automatic data
          //   storage for `dat.GUI`.
          //
          // - `null` or `undefined`: *clear* the explicit configuration: localStorage use is determined
          //   solely by the available browser support from this point forward.
          //
          //   (You can use this `bool` value to clear previous explicit dat.GUI configuration
          //   and data storage and revert to using the coded default(s) once again.)
          set: function (bool) {
            if (SUPPORTS_LOCAL_STORAGE) {
              useLocalStorage = bool;
              if (bool) {
                dom.bind(window, "unload", saveToLocalStorage);
              } else {
                dom.unbind(window, "unload", saveToLocalStorage);
              }
              window.localStorage.setItem(getLocalStorageHash(_this, "isLocal"), bool);
            }
            return _this;
          },
        },
      }
    );

    // Are we a root level GUI?
    if (common.isUndefined(params.parent)) {
      dom.addClass(this.domElement, GUI.CLASS_MAIN);
      dom.makeSelectable(this.domElement, false);

      if (params.lightTheme) {
        dom.addClass(this.domElement, GUI.CLASS_LIGHT_THEME);
      }

      // Are we supposed to be loading locally?
      if (SUPPORTS_LOCAL_STORAGE) {
        if (useLocalStorage) {
          _this.useLocalStorage = true;

          const savedGui = window.localStorage.getItem(getLocalStorageHash(this, "gui"));

          // Mix the localStorage data with the optional user-provided load data:
          // user-provided load data prevails over localStorage data.
          if (savedGui) {
            params.load = JSON.parse(savedGui);
          }
        }
      }

      this.__closeButton = document.createElement("div");
      if (params.name) {
        this.__closeButton.innerHTML = params.name;
      } else {
        this.__closeButton.innerHTML = params.closeStr;
      }
      this.closed = params.closed || false;
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
        if (_this.__onClosedChange) {
          _this.__onClosedChange.call(_this, _this.closed);
        }
      });
    } else {
      // Oh, you're a nested GUI!

      if (params.closed === undefined) {
        params.closed = true;
      }

      const titleRowName = document.createTextNode(params.name);
      dom.addClass(titleRowName, "controller-name");

      titleRow = addRow(_this, titleRowName);

      if (common.isString(params.title)) {
        titleRow.setAttribute("title", params.title);
      }

      const onClickTitle = function (e) {
        e.preventDefault();
        _this.closed = !_this.closed;
        if (_this.__onClosedChange) {
          _this.__onClosedChange.call(_this, _this.closed);
        }
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
      if (common.isUndefined(params.parent)) {
        if (autoPlaceVirgin) {
          autoPlaceContainer = document.createElement("div");
          dom.addClass(autoPlaceContainer, CSS_NAMESPACE);
          dom.addClass(autoPlaceContainer, GUI.CLASS_AUTO_PLACE_CONTAINER);
          document.body.appendChild(autoPlaceContainer);
          autoPlaceVirgin = false;
        }

        // Put it in the dom for you.
        autoPlaceContainer.appendChild(this.domElement);

        // Apply the auto styles
        dom.addClass(this.domElement, GUI.CLASS_AUTO_PLACE);
      }

      // Make it not elastic.
      if (!this.parent) {
        setWidth(_this, params.width);
      }
    }

    dom.bind(window, "resize", _this.onResizeDebounced);
    dom.bind(this.__ul, "webkitTransitionEnd", _this.onResizeDebounced);
    dom.bind(this.__ul, "transitionend", _this.onResizeDebounced);
    dom.bind(this.__ul, "oTransitionEnd", _this.onResizeDebounced);
    common.defer(function () {
      _this.onResizeDebounced();
    });

    if (params.resizable) {
      addResizeHandle(this);
    }

    saveToLocalStorage = function () {
      if (SUPPORTS_LOCAL_STORAGE && window.localStorage.getItem(getLocalStorageHash(_this, "isLocal")) === "true") {
        window.localStorage.setItem(getLocalStorageHash(_this, "gui"), JSON.stringify(_this.getSaveObject()));
      }
    };

    // expose this method publicly
    /**
     * TODO:
     * saveToLocalStorageIfPossible description
     * @type xxx
     * @returns xxx
     */
    this.saveToLocalStorageIfPossible = function () {
      saveToLocalStorage();
      return _this;
    };

    function resetWidth() {
      const root = _this.getRoot();
      root.width += 1;
      common.defer(function () {
        root.width -= 1;
      });
    }

    if (!params.parent) {
      resetWidth();
    }

    if (common.isObject(params.object)) {
      common.each(params.object, function (property, propertyName) {
        debugger;
        _this.add(params.object, propertyName);
      });
    }
  }

  onClosedChange(fnc) {
    this.__onClosedChange = fnc;
    return this;
  }

  /**
   * TODO: getControllerByName description
   * @param  {String} name         description
   * @param  {boolean} [recurse]   description
   * @return {Controller}          description
   */
  getControllerByName(name, recurse) {
    const controllers = this.__controllers;
    for (const i in controllers) {
      if (controllers[i].property === name) {
        return controllers[i];
      }
    }
    const folders = this.__folders;
    if (recurse) {
      for (const i in folders) {
        const tryFI = folders[i].getControllerByName(name, true);
        if (tryFI != null) return tryFI;
      }
    }
    return null;
  }

  /**
   * TODO: [getFolderByName description]
   * @param  {String} name [description]
   * @return {GUI}      [description]
   */
  getFolderByName(name) {
    return this.__folders[name];
  }

  /**
   * TODO: [getAllControllers description]
   * @param  {Any} [recurse]    description
   * @param  {Array} [myArray]  description
   * @return {Array}         description
   */
  getAllControllers(recurse, myArray) {
    if (recurse == undefined) recurse = true;
    let i;
    const arr = myArray != null ? myArray : [];

    const controllers = this.__controllers;
    for (i in controllers) {
      arr.push(controllers[i]);
    }

    if (recurse) {
      const folders = this.__folders;
      for (i in folders) {
        folders[i].getAllControllers(true, arr);
      }
    }
    return arr;
  }

  /**
   * Gets this current GUI (usually) and all sub-folder GUIs under this GUI as an array of {name/gui} pairs. The "this" current gui uses empty string.
   *
   * @param  recurse (optional) By default, it will recurse multiple levels deep. Set to false to only scan current level from current GUI.
   * @param  myArray (optional) Supply an existing array to use instead.  If supplied, will not push current GUI into array, only the subfolder GUIs.
   * @return   The array of {name/gui} value pairs
   */
  getAllGUIs(recurse, myArray) {
    if (recurse == undefined) recurse = true;
    let i;
    const arr = myArray != null ? myArray : [this];
    const folders = this.__folders;

    for (i in folders) {
      arr.push(folders[i]);
    }

    if (recurse) {
      for (i in folders) {
        folders[i].getAllGUIs(true, arr);
      }
    }
    return arr;
  }

  toggleHide() {
    hide = !hide;
    common.each(hideableGuis, function (gui) {
      if (1) {
        gui.domElement.style.display = hide ? "none" : "";
      } else {
        gui.domElement.style.zIndex = hide ? -999 : 999;
        gui.domElement.style.opacity = hide ? 0 : 1;
      }
    });
  }

  _keydownHandler(e) {
    if (
      document.activeElement &&
      document.activeElement.type !== "text" &&
      document.activeElement.nodeName.toString().toLowerCase() !== "textarea" &&
      (e.which === HIDE_KEY_CODE || e.keyCode === HIDE_KEY_CODE)
    ) {
      GUI.toggleHide();
    }
  }

  /**
   * @param controllerName
   * @param controllerTemplate the template controller object which will be used for
   */
  defineController(controllerName, controllerTemplate) {
    this.__typeControllers[controllerName] = controllerTemplate;
  }

  /**
   * @param controllerName
   * @returns {dat.controllers.Controller} The controller registered for the given `controllerName`.
   * Return boolean FALSE when no controller has been registered for the given name.
   */
  findController(controllerName) {
    return this.__typeControllers[controllerName] || false;
  }

  /**
   * Adds a new {@link Controller} to the GUI. The type of controller created
   * is inferred from the initial value of <code>object[property]</code>.
   * For color properties, see {@link addColor}.
   * For file properties, see {@link addFile}.
   *
   * @param {Object} object The object to be manipulated
   * @param {String} property The name of the property to be manipulated
   * @param {Number} [min] Minimum allowed value
   * @param {Number} [max] Maximum allowed value
   * @param {Number} [step] Increment by which to change value
   * @returns {Controller} The controller that was added to the GUI.
   *
   * @example
   * // Add a string controller.
   * var person = {name: 'Sam'};
   * gui.add(person, 'name');
   *
   * @example
   * // Add a number controller slider.
   * var person = {age: 45};
   * gui.add(person, 'age', 0, 100);
   */
  add(object, property, ...factoryArgs) {
    return add(this, object, property, { factoryArgs });
  }

  /**
   * Adds a new color controller to the GUI.
   *
   * @param object
   * @param property
   * @returns {Controller} The controller that was added to the GUI.
   *
   * @example
   * var palette = {
   *   color1: '#FF0000', // CSS string
   *   color2: [ 0, 128, 255 ], // RGB array
   *   color3: [ 0, 128, 255, 0.3 ], // RGB with alpha
   *   color4: { h: 350, s: 0.9, v: 0.3 } // Hue, saturation, value
   * };
   * gui.addColor(palette, 'color1');
   * gui.addColor(palette, 'color2');
   * gui.addColor(palette, 'color3');
   * gui.addColor(palette, 'color4');
   */
  addColor(object, property, params) {
    return add(this, object, property, {
      color: true,
      factoryArgs: [params],
    });
  }

  addBgColor(object, property, params) {
    return add(this, object, property, {
      bgcolor: true,
      factoryArgs: [params],
    });
  }

  addNgColor(object, property, params) {
    return add(this, object, property, {
      ngcolor: true,
      factoryArgs: [params],
    });
  }

  addGtColor(object, property, params) {
    return add(this, object, property, {
      gtcolor: true,
      factoryArgs: [params],
    });
  }

  addHSVColor(object, property, params) {
    return add(this, object, property, {
      hsvcolor: true,
      factoryArgs: [params],
    });
  }

  addVector(object, property, min, max) {
    return add(this, object, property, {
      vector: true,
      factoryArgs: [min, max],
    });
  }

  /**
   * @param object
   * @param property
   * @returns {dat.controllers.TextAreaController} The new controller that was added.
   */
  addTextArea(object, property, params) {
    return add(this, object, property, {
      multiline: true,
      factoryArgs: [params],
    });
  }

  /**
   * @param object
   * @param property
   * @returns {dat.controllers.EasingFunctionController} The new controller that was added.
   */
  addEasingFunction(object, property) {
    return add(this, object, property, {
      easing: true,
    });
  }

  /**
   * Adds a new plotter controller to the GUI.
   *
   * @param object
   * @param property
   * @param max The maximum value that the plotter will display (default 10)
   * @param period The update interval in ms or use 0 to only update on value change (default 500)
   * @param type Type of graph to render - line or bar (default line)
   * @param fgColor Foreground color of the graph in hex (default #fff)
   * @param bgColor Background color of the graph in hex (default #000)
   * @returns {Controller} The controller that was added to the GUI.
   *
   * @example
   * var obj = {
   *   value: 5
   * };
   * gui.addPlotter(obj, 'value', 10, 100);
   * gui.addPlotter(obj, 'value', 10, 0);
   */
  addPlotter(object, property, max, period, type, fgColor, bgColor) {
    return add(this, object, property, {
      plotter: true,
      // NOTE: do NOT provide defaults for the next few items as the Controller should be the only one assigning defaults:
      max,
      period,
      type,
      fgColor,
      bgColor,
    });
  }

  /**
   * Adds a new file controller to the GUI.
   *
   * @param object
   * @param property
   * @returns {Controller} The controller that was added to the GUI.
   *
   * @example
   * var instance = {
   *  onLoad: function(dataURL) {
   *    document.getElementById('img').src = dataURL
   *  }
   * };
   * gui.addFile(instance, 'onLoad');
   */
  addFile(object, property) {
    return add(this, object, property, {
      file: true,
    });
  }

  /**
   * Adds an image controller to the GUI.
   *
   * @param object
   * @param property
   * @returns {Controller} The controller that was added to the GUI.
   *
   * @example
   * var images = { path1: 'myImage.png'};
   * gui.addImage(images, 'path1');
   */
  addImage(object, property) {
    return add(this, object, property, {
      image: true,
    });
  }

  /**
   * @param object
   * @param property
   * @returns {dat.controllers.HifiColorController} The new controller that was added.
   */
  addHifiColor(object, property) {
    return add(this, object, property, {
      hifiColor: true,
    });
  }

  /**
   * @param object
   * @param property
   * @returns {dat.controllers.Vec3Controller} The new controller that was added.
   */
  addVec3(object, property) {
    return add(this, object, property, {
      vec3: true,
    });
  }

  /**
   * @param object
   * @param property
   * @returns {dat.controllers.QuatController} The new controller that was added.
   */
  addQuat(object, property) {
    return add(this, object, property, {
      quat: true,
    });
  }

  /**
   * Adds a new custom controller to the GUI.
   *
   * @param object
   * @param property
   * @returns {Controller} The controller that was added to the GUI.
   *
   */
  addCustomController(object, property, ...factoryArgs) {
    return add(this, object, property, {
      custom: true,
      factoryArgs,
    });
  }

  /**
   * @param object
   * @param property
   * @returns {dat.controllers.ColorController} The new controller that was added.
   */
  addGradient(object, property, ...factoryArgs) {
    return add(this, object, property, {
      gradient: true,
      factoryArgs,
    });
  }

  /**
   * @param object
   * @param property
   * @returns {dat.controllers.Controller} The new controller that was added.
   * @instance
   */
  addAs(object, property, controller, ...factoryArgs) {
    return add(this, object, property, {
      controller: controller,
      factoryArgs,
    });
  }

  /**
   * Removes the given controller from the GUI.
   * @param {Controller} controller
   */
  remove(controller) {
    const lIndex = this.__listening.indexOf(controller);
    if (lIndex !== -1) {
      this.__listening.splice(lIndex, 1);
    }
    // Hacky remove check, should be in events
    if (controller.destruct) {
      controller.destruct();
    }

    this.__ul.removeChild(controller.__li);
    this.__controllers.splice(this.__controllers.indexOf(controller), 1);
    const _this = this;
    common.defer(function () {
      _this.onResizeDebounced();
    });
    return this;
  }

  /**
   * Removes the root GUI from the document and unbinds all event listeners.
   * For subfolders, use `gui.removeFolder(folder)` instead.
   */
  destroy() {
    if (this.parent) {
      throw new Error(
        "Only the root GUI should be removed with .destroy(). " +
          "For subfolders, use gui.removeFolder(folder) instead."
      );
    }

    if (this.autoPlace) {
      autoPlaceContainer.removeChild(this.domElement);
    }

    const _this = this;
    common.each(this.__folders, function (folder, name) {
      _this.removeFolder(name);
    });

    dom.unbind(window, "keydown", GUI._keydownHandler, false);

    removeListeners(this);
    assert(this.__listening.length === 0);
  }

  onChange(f) {
    this.__onChange = f;
    return this;
  }

  onFinishChange(f) {
    this.__onFinishChange = f;
    return this;
  }

  __propagateChange() {
    if (this.__onChange) {
      this.__onChange.call(this);
    }

    if (this.parent) {
      this.parent.__propagateChange();
    }
  }

  __propagateFinishChange() {
    if (this.__onFinishChange) {
      this.__onFinishChange.call(this);
    }

    if (this.parent) {
      this.parent.__propagateFinishChange();
    }
  }

  /**
   * Creates a new subfolder GUI instance.
   * @param name
   * @param [title]
   * @returns {GUI} The new folder.
   * @throws {Error} if this GUI already has a folder by the specified name
   */
  addFolder(name) {
    // We have to prevent collisions on names in order to have a key
    // by which to remember saved values
    if (this.__folders[name] !== undefined) {
      throw new Error(`You already have a folder in this GUI by the name "${name}"`);
    }

    const newGuiParams = {
      name: name,
      parent: this,
      title: title,
    };

    // We need to pass down the autoPlace trait so that we can
    // attach event listeners to open/close folder actions to
    // ensure that a scrollbar appears if the window is too short.
    newGuiParams.autoPlace = this.autoPlace;

    // Do we have saved appearance data for this folder?
    if (
      // Anything loaded?
      this.load &&
      // Was my parent a dead-end?
      this.load.folders &&
      this.load.folders[name]
    ) {
      // Did daddy remember me?

      // Start me closed if I was closed
      newGuiParams.closed = this.load.folders[name].closed;

      // Pass down the loaded data
      newGuiParams.load = this.load.folders[name];
    }

    const gui = new GUI(newGuiParams);
    this.__folders[name] = gui;

    const li = addRow(this, gui.domElement);
    li.setAttribute("draggable", "true");
    li.ondragstart = function (event) {
      event.dataTransfer.setData("text", name);
    };
    dom.addClass(li, "folder");
    return gui;
  }

  /**
   * Removes a subfolder GUI instance.
   * @param {GUI} folder The folder to remove.
   */
  removeFolder(name) {
    const folder = this.__folders[name];
    if (!folder) {
      console.error('There is no folder in this GUI by the name "' + name + '"'); // eslint-disable-line no-console
      return;
    }
    folder.close();

    this.__ul.removeChild(folder.domElement.parentElement);

    delete this.__folders[folder.name];

    // Do we have saved appearance data for this folder?
    if (
      // Anything loaded?
      this.load &&
      // Was my parent a dead-end?
      this.load.folders &&
      this.load.folders[folder.name]
    ) {
      delete this.load.folders[folder.name];
    }

    removeListeners(folder);

    const _this = this;

    common.each(folder.__folders, function (subfolder) {
      folder.removeFolder(subfolder);
    });

    common.defer(function () {
      _this.onResizeDebounced();
    });
  }

  /**
   * Opens the GUI.
   */
  open() {
    this.closed = false;
    return this;
  }

  /**
   * Closes the GUI.
   */
  close() {
    this.closed = true;
    return this;
  }

  /**
   * Hides the GUI.
   */
  hide() {
    this.domElement.style.display = "none";
    return this;
  }

  /**
   * Shows the GUI.
   */
  show() {
    this.domElement.style.display = "";
  }

  onFinishRevert(fn) {
    this.__onFinishRevert = fn;
    return this;
  }

  onResize() {
    // we debounce this function to prevent performance issues when rotating on tablet/mobile
    const root = this.getRoot();
    if (root.scrollable) {
      const { top } = dom.getOffset(root.__ul);
      let h = 0;

      // this code doesn't account for overflowing stylings in controllers (which can be buggy that way)
      if (0) {
        common.each(root.__ul.childNodes, function (node) {
          if (!(root.autoPlace && node === root.__save_row) && node.nodeType === 1) {
            h += dom.getHeight(node);
          }
        });
      }
      // instead use `scrollHeight` which will always deliver the true total height
      // as per https://stackoverflow.com/a/22675563/1635910
      h = root.__ul.scrollHeight;

      if (!CLOSE_BUTTON_HEIGHT && root.__closeButton) {
        CLOSE_BUTTON_HEIGHT = dom.getHeight(root.__closeButton);
      }
      if (window.innerHeight - top - CLOSE_BUTTON_HEIGHT < h) {
        dom.addClass(root.domElement, GUI.CLASS_TOO_TALL);
        root.__ul.style.height = window.innerHeight - top - CLOSE_BUTTON_HEIGHT + "px";
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
  }

  /**
   * Mark objects for saving. The order of these objects cannot change as
   * the GUI grows. When remembering new objects, append them to the end
   * of the list.
   *
   * @param {...Object} objects
   * @throws {Error} if not called on a top level GUI.
   */
  remember(/* ...args */) {
    if (common.isUndefined(SAVE_DIALOGUE)) {
      SAVE_DIALOGUE = new CenteredDiv();
      SAVE_DIALOGUE.domElement.innerHTML = saveDialogueContents;
    }

    if (this.parent) {
      throw new Error("You can only call remember on a top level GUI.");
    }

    const _this = this;

    common.each(ARR_SLICE.call(arguments), function (object) {
      if (_this.__rememberedObjects.length === 0) {
        addSaveMenu(_this);
      }
      if (_this.__rememberedObjects.indexOf(object) === -1) {
        _this.__rememberedObjects.push(object);
      }
    });

    if (this.autoPlace) {
      // Set save row width and increase to accomodate buttons
      this.width += 40;
      setWidth(this, this.width);
    }
    return this;
  }

  /**
   * @returns {GUI} the topmost parent GUI of a nested GUI.
   */
  getRoot() {
    let gui = this;
    while (gui.parent) {
      gui = gui.parent;
    }
    return gui;
  }

  /**
   * @returns {Object} a JSON object representing the current state of
   * this GUI as well as its remembered properties.
   */
  getSaveObject() {
    const toReturn = this.load;

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
  }

  /**
   * TODO:
   * [save description]
   * @return {GUI} [description]
   */
  save() {
    if (!this.load.remembered) {
      this.load.remembered = {};
    }

    this.load.remembered[this.preset] = getCurrentPreset(this);
    markPresetModified(this, false);
    this.saveToLocalStorageIfPossible();
    return this;
  }

  /**
   * TODO:
   * [saveAs description]
   * @param  {String} presetName  [description]
   * @return {GUI}    [description]
   */
  saveAs(presetName) {
    if (!this.load.remembered) {
      // Retain default values upon first save
      this.load.remembered = {};
      this.load.remembered[DEFAULT_DEFAULT_PRESET_NAME] = getCurrentPreset(this, true);
    }

    this.load.remembered[presetName] = getCurrentPreset(this);
    this.preset = presetName;
    addPresetOption(this, presetName, true);
    this.saveToLocalStorageIfPossible();
    return this;
  }

  /**
   * TODO: fix this API. It's a mess.
   * [revert description]
   * @param  {GUI} gui [description]
   * @return {GUI}     [description]
   */
  revert(gui) {
    const _this = gui || this.getRoot();

    common.each(this.__controllers, function (controller) {
      // Make revert work on Default.
      if (!_this.load.remembered) {
        controller.setValue(controller.initialValue);
      } else {
        recallSavedValue(_this, controller);
      }

      // fire onFinishChange callback
      controller.__propagateFinishChange(controller.getValue());
    });

    common.each(_this.__folders, function (folder) {
      folder.revert(folder);
    });

    if (!gui) {
      markPresetModified(this.getRoot(), false);
    }

    if (_this === this && _this.__onFinishRevert) {
      _this.__onFinishRevert.call(_this);
    }
    return this;
  }

  /**
   * TODO:
   * deleteSave description
   * @return {GUI} description
   */
  deleteSave() {
    // Not allowed to remove Default preset
    if (this.preset === DEFAULT_DEFAULT_PRESET_NAME || !confirm(`Delete preset "${this.preset}". Are you sure?`)) {
      return;
    }

    delete this.load.remembered[this.preset];
    this.preset = removeCurrentPresetOption(this);
    this.saveToLocalStorageIfPossible();
    return this;
  }

  /**
   * TODO:
   * listen description
   * @param  {Controller} controller [description]
   * @return {GUI}            [description]
   */
  listen(controller) {
    const init = this.__listening.length === 0;
    this.__listening.push(controller);
    if (init) {
      updateDisplays(this.__listening);
    }
    return this;
  }

  /**
   * TODO:
   * updateDisplay description
   * @return {GUI}  description
   */
  updateDisplay() {
    for (const c in this.__controllers) {
      this.__controllers[c].updateDisplay();
    }
    for (const f in this.__folders) {
      this.__folders[f].updateDisplay();
    }
    return this;
  }
}

GUI.plugins = {
  autocomplete: autocomplete,
};

/** @const {String} CSS class name used to mark auto-placed items. */
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
// GUI.TEXT_CLOSED = "Close Controls";
// GUI.TEXT_OPEN = "Open Controls";
GUI.TEXT_CLOSED = '<img src="https://icon.now.sh/x/FFFFFF/10" />';
GUI.TEXT_OPEN = '<img src="https://icon.now.sh/settings/FFFFFF/18" />';

dom.bind(window, "keydown", GUI._keydownHandler, false);

function add(gui, object, property, params) {
  let controller;
  let customObject;

  // add( new SomeCustomerController(a,b,c), params)
  if (object instanceof Controller) {
    controller = object;
    params = property || {};
    property = undefined;
  } else {
    // TODO: used anywhere? Otherwise this will be taken out.
    if (object.arguments) {
      // custom controller
      //
      // TODO: fix this mess. Ugly!
      customObject = object;
      object = customObject.arguments.object;
      property = customObject.arguments.property;
      params = {
        factoryArgs: customObject.arguments.opts,
      };
    }

    if (!(property in object)) {
      throw new Error(`Object "${object}" has no property "${property}"`);
    }

    const FoundController = gui.findController(params.controller);
    if (FoundController) {
      controller = new FoundController(object, property, ...params.factoryArgs);
    } else if (params.color) {
      controller = new ColorController(object, property, ...params.factoryArgs);
    } else if (customObject !== undefined && typeof customObject.property === "string") {
      // TODO: used anywhere? Otherwise this will be taken out.
      controller = customObject;
    } else if (params.bgcolor) {
      controller = new BgColorController(object, property, ...params.factoryArgs);
    } else if (params.ngcolor) {
      controller = new NgColorController(object, property, ...params.factoryArgs);
    } else if (params.gtcolor) {
      controller = new GtColorController(object, property, ...params.factoryArgs);
    } else if (params.hsvcolor) {
      controller = new HSVColorController(object, property, ...params.factoryArgs);
    } else if (params.easing) {
      controller = new EasingFunctionController(object, property, ...params.factoryArgs);
    } else if (params.multiline) {
      controller = new TextAreaController(object, property, ...params.factoryArgs);
    } else if (params.gradient) {
      controller = new GradientController(object, property, ...params.factoryArgs);
    } else if (params.image) {
      controller = new ImageController(object, property, ...params.factoryArgs);
    } else if (params.plotter) {
      controller = new PlotterController(object, property, ...params.factoryArgs);
      gui.listen(controller);
    } else if (params.file) {
      controller = new FileController(object, property, ...params.factoryArgs);
    } else if (params.vector) {
      controller = new VectorController(object, property, ...params.factoryArgs);
    } else if (params.custom) {
      controller = new CustomController(object, property, ...params.factoryArgs);
    } else {
      controller = controllerFactory(object, property, ...params.factoryArgs);
    }
    if (controller === null) {
      controller = customObject;
    } else if (customObject != null) {
      customObject.controller = controller;
    }
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

  const name = document.createElement("span");
  dom.addClass(name, "property-name");
  // name.innerHTML = controller.label;      // TODO
  if (customObject !== undefined && typeof customObject.property === "object") {
    for (const propertyName in customObject.property) {
      name.appendChild(customObject.property[propertyName]);
    }
  } else {
    name.innerHTML = controller.property;
  }

  const container = document.createElement("div");
  container.appendChild(name);
  container.appendChild(controller.domElement);

  const li = addRow(gui, container, params.before);

  dom.addClass(li, GUI.CLASS_CONTROLLER_ROW);

  if (object.className) {
    dom.addClass(li, object.className);
  }

  dom.addClass(li, controller.name);
  if (params.liClass) {
    dom.addClass(li, params.liClass);
  } else if (controller.liClass) {
    dom.addClass(li, controller.liClass);
  }

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
  const li = document.createElement("li");
  if (dom) {
    li.appendChild(dom);
  }

  if (liBefore) {
    gui.__ul.insertBefore(li, liBefore);
  } else {
    gui.__ul.appendChild(li);
  }
  gui.onResizeDebounced();
  return li;
}

function removeListeners(gui) {
  dom.unbind(window, "resize", gui.onResizeDebounced);
  dom.unbind(gui.__ul, "webkitTransitionEnd", gui.onResizeDebounced);
  dom.unbind(gui.__ul, "transitionend", gui.onResizeDebounced);
  dom.unbind(gui.__ul, "oTransitionEnd", gui.onResizeDebounced);

  if (gui.saveToLocalStorageIfPossible) {
    dom.unbind(window, "unload", gui.saveToLocalStorageIfPossible);
  }
}

function markPresetModified(gui, modified) {
  const opt = gui.__preset_select[gui.__preset_select.selectedIndex];

  if (modified) {
    opt.innerHTML = opt.value + "*";
  } else {
    opt.innerHTML = opt.value;
  }
}

function augmentController(gui, li, controller) {
  controller.__li = li;
  controller.__gui = gui;

  common.extend(
    controller,
    /** @lends Controller.prototype */ {
      /**
       * @param  {Array|Object} options
       * @return {Controller}
       */
      options: function (options) {
        if (arguments.length > 1) {
          const nextSibling = controller.__li.nextElementSibling;
          controller.remove();

          return add(gui, controller.object, controller.property, {
            before: nextSibling,
            factoryArgs: common.toArray(arguments),
          });
        }

        if (common.isArray(options) || common.isObject(options)) {
          const nextSibling = controller.__li.nextElementSibling;
          controller.remove();

          return add(gui, controller.object, controller.property, {
            before: nextSibling,
            factoryArgs: [options],
          });
        }
        return null;
      },

      /**
       * Sets the name of the controller.
       * @param  {string} name
       * @return {Controller}
       */
      name: function (name) {
        controller.__li.firstElementChild.firstElementChild.innerHTML = name;
        return controller;
      },

      title: function (v) {
        if (common.isString(v)) {
          controller.__li.setAttribute("title", v);
        } else {
          controller.__li.removeAttribute("title");
        }
        return controller;
      },

      /**
       * Sets controller to listen for changes on its underlying object.
       * @param {boolean} forceUpdateDisplay Whether to force update a display, even when input is active (default: false).
       * @return {Controller}
       */
      listen: function (forceUpdateDisplay) {
        controller.forceUpdateDisplay = !!forceUpdateDisplay;
        controller.__gui.listen(controller);
        return controller;
      },

      /**
       * Removes the controller from its parent GUI.
       * @return {Controller}
       */
      remove: function () {
        controller.__gui.remove(controller);
        return controller;
      },
    }
  );

  // All sliders should be accompanied by a box.
  if (controller instanceof NumberControllerSlider) {
    const box = new NumberControllerBox(controller.object, controller.property, {
      min: controller.__min,
      max: controller.__max,
      step: controller.__step,
    });

    common.each(
      ["updateDisplay", "onChange", "onFinishChange", "setValue", "min", "max", "step", "mode", "setReadonly"],
      function (method) {
        const pc = controller[method];
        const pb = box[method];
        controller[method] = box[method] = function () {
          const args = ARR_SLICE.call(arguments);
          pc.apply(controller, args);
          return pb.apply(box, args);
        };
      }
    );

    dom.addClass(li, "has-slider");
    controller.domElement.insertBefore(box.domElement, controller.domElement.firstElementChild);

    // TODO: test & see what this does exactly
    if (0) {
      // Add animation buttons to slider.
      const animateButtons = new NumberControllerAnimator(controller.object, controller.property, {
        min: controller.__min,
        max: controller.__max,
        step: controller.__step,
      });

      common.each(["updateDisplay", "onChange", "onFinishChange", "step"], function (method) {
        const pc = controller[method];
        const pb = animateButtons[method];
        controller[method] = animateButtons[method] = function () {
          const args = Array.prototype.slice.call(arguments);
          pb.apply(animateButtons, args);
          return pc.apply(controller, args);
        };
      });
      dom.addClass(li, "has-animate-buttons");
      controller.domElement.insertBefore(animateButtons.domElement, controller.domElement.firstElementChild);
    }
  } else if (controller instanceof NumberControllerBox) {
    const r = function (returned) {
      // Have we defined both boundaries?
      if (common.isNumber(controller.__min) && common.isNumber(controller.__max)) {
        // Well, then let's just replace this with a slider.

        // Let's remember if the old controller had a specific name or was listening
        const oldName = controller.__li.firstElementChild.firstElementChild.innerHTML;
        const wasListening = controller.__gui.__listening.indexOf(controller) > -1;

        controller.remove();
        const newController = add(gui, controller.object, controller.property, {
          before: controller.__li.nextElementSibling,
          factoryArgs: [
            controller.__min,
            controller.__max,
            controller.__step,
            controller.__minimumSaneStepSize,
            controller.__maximumSaneStepSize,
            controller.__mode,
          ],
        });

        newController.name(oldName);
        if (wasListening) newController.listen();

        return newController;
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
  } else if (
    controller instanceof ColorController ||
    controller instanceof BgColorController ||
    controller instanceof NgColorController ||
    controller instanceof HSVColorController ||
    controller instanceof GtColorController
  ) {
    dom.addClass(li, "color");
    controller.updateDisplay = common.compose(function (val) {
      li.style.borderLeftColor = controller.__color.toHexString();
      return val;
    }, controller.updateDisplay);

    controller.updateDisplay();
  } else if (controller instanceof ArrayNController) {
    controller.updateDisplay = common.compose(function (val) {
      li.style.height = `${(controller.__inputs.length + 1) * 26}px`;
    }, controller.updateDisplay);

    controller.updateDisplay();
  } else if (controller instanceof GradientController) {
    li.style.borderLeft = "3px solid #2FA1D6";
  } else if (controller instanceof EasingFunctionController) {
    dom.addClass(li, "easing");

    controller.updateDisplay = common.compose(function (r) {
      // [TODO]
      // Let's adapt style!
      return r;
    }, controller.updateDisplay);

    controller.updateDisplay();
  } else if (controller instanceof UndefinedController) {
    controller.__onFinishChange = function (val) {
      controller.remove();
      return add(gui, controller.object, controller.property, {
        before: controller.__li.nextElementSibling,
      });
    };
  }

  controller.setValue = common.compose(function (val) {
    if (gui.getRoot().__preset_select && controller.isModified()) {
      markPresetModified(gui.getRoot(), true);
    }

    return val;
  }, controller.setValue);
}

function recallSavedValue(gui, controller) {
  // Find the topmost GUI, that's where remembered objects live.
  const root = gui.getRoot();

  // Does the object we're controlling match anything we've been told to
  // remember?
  const matchedIndex = root.__rememberedObjects.indexOf(controller.object);

  // Why yes, it does!
  if (matchedIndex !== -1) {
    // Let me fetch a map of controllers for this object.
    let controllerMap = root.__rememberedObjectIndecesToControllers[matchedIndex];

    // I believe this is the first controller we've created for this
    // object. Let's make a fresh map.
    if (controllerMap === undefined) {
      controllerMap = {};
      root.__rememberedObjectIndecesToControllers[matchedIndex] = controllerMap;
    }

    // Keep track of this controller
    controllerMap[controller.property] = controller;

    // Okay, now have we saved any values for this controller?
    if (root.load && root.load.remembered) {
      const presetMap = root.load.remembered;

      // Which preset are we trying to load?
      let preset;

      if (presetMap[gui.preset]) {
        preset = presetMap[gui.preset];
      } else if (presetMap[DEFAULT_DEFAULT_PRESET_NAME]) {
        // Uhh, you can have the default instead?
        preset = presetMap[DEFAULT_DEFAULT_PRESET_NAME];
      } else {
        // Nada.

        return;
      }

      // Did the loaded object remember this object?
      if (
        preset[matchedIndex] &&
        // Did we remember this particular property?
        preset[matchedIndex][controller.property] !== undefined
      ) {
        // We did remember something for this guy ...
        const value = preset[matchedIndex][controller.property];

        // And that's what it is.
        controller.initialValue = value;
        controller.setValue(value);
      }
    }
  }
}

const _generatedUIDs = new Map();

// TODO: use function
function generateUIDWithCollisionChecking() {
  while (true) {
    const uid = ("0000" + ((Math.random() * Math.pow(36, 4)) | 0).toString(36)).slice(-4);
    if (!(uid in _generatedUIDs)) {
      // check that the ID is not yet in the DOM: **generate a globally unique ID**
      if (!document.getElementById(uid)) {
        _generatedUIDs[uid] = true;
        return uid;
      }
    }
  }
}

function getLocalStorageHash(gui, key) {
  // This deals with multiple GUI's IFF every GUI has its own namespace:
  const namespace = window.localStorage.getItem("dat.gui.namespace") || document.location.href;
  return "dat.gui." + namespace + "." + key;
}

function addPresetOption(gui, name, setSelected) {
  const opt = document.createElement("option");
  opt.innerHTML = name;
  opt.value = name;
  gui.__preset_select.appendChild(opt);
  if (setSelected) {
    gui.__preset_select.selectedIndex = gui.__preset_select.length - 1;
  }
}

function removeCurrentPresetOption(gui) {
  gui.__preset_select.removeChild(gui.__preset_select.options[gui.__preset_select.selectedIndex]);
  return gui.__preset_select.options[gui.__preset_select.selectedIndex].value;
}

function showHideExplain(gui, explain) {
  if (explain) {
    explain.style.display = gui.useLocalStorage ? "block" : "none";
  }
}

function addSaveMenu(gui) {
  const div = (gui.__save_row = document.createElement("li"));

  dom.addClass(gui.domElement, "has-save");

  gui.__ul.insertBefore(div, gui.__ul.firstChild);

  dom.addClass(div, "save-row");

  const gears = document.createElement("span");
  gears.innerHTML = "&nbsp;";
  dom.addClass(gears, "button gears");

  // TODO replace with FunctionController
  const button = document.createElement("span");
  button.innerHTML = "Save";
  dom.addClass(button, "button");
  dom.addClass(button, "save");

  const button2 = document.createElement("span");
  button2.innerHTML = "New";
  dom.addClass(button2, "button");
  dom.addClass(button2, "save-as");

  const button3 = document.createElement("span");
  button3.innerHTML = "Revert";
  dom.addClass(button3, "button");
  dom.addClass(button3, "revert");

  const button4 = document.createElement("span");
  button4.innerHTML = "Delete";
  dom.addClass(button4, "button");
  dom.addClass(button4, "delete");

  const select = (gui.__preset_select = document.createElement("select"));

  if (gui.load && gui.load.remembered) {
    common.each(gui.load.remembered, function (value, key) {
      addPresetOption(gui, key, key === gui.preset);
    });
  } else {
    addPresetOption(gui, DEFAULT_DEFAULT_PRESET_NAME, false);
  }

  dom.bind(select, "change", function () {
    for (let index = 0; index < gui.__preset_select.length; index++) {
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
    const explain = document.getElementById("dg-local-explain");
    const localStorageCheckBox = document.getElementById("dg-local-storage");
    const saveLocally = document.getElementById("dg-save-locally");

    saveLocally.style.display = "block";

    if (window.localStorage.getItem(getLocalStorageHash(gui, "isLocal")) === "true") {
      localStorageCheckBox.setAttribute("checked", "checked");
    }

    showHideExplain(gui, explain);

    // TODO: Use a boolean controller, fool!
    dom.bind(localStorageCheckBox, "change", function () {
      gui.useLocalStorage = !gui.useLocalStorage;
      showHideExplain(gui, explain);
    });
  }

  const newConstructorTextArea = document.getElementById("dg-new-constructor");

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
    const presetName = prompt("Enter a new preset name.");
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
    if (!confirm(`Are you sure you want to delete preset "${gui.preset}"?`)) {
      return;
    }

    gui.deleteSave();
  });

  // div.appendChild(button2);
}

function addResizeHandle(gui) {
  let pmouseX;

  if (gui.parent) {
    debugger;
    return;
  }

  gui.__resize_handle = document.createElement("div");

  common.extend(gui.__resize_handle.style, {
    width: "6px",
    marginLeft: "-3px",
    height: "200px",
    cursor: "ew-resize",
    position: "absolute",
    // border: '1px solid blue'
  });

  function drag(e) {
    e.preventDefault();

    gui.width += pmouseX - e.clientX;
    gui.onResizeDebounced();
    pmouseX = e.clientX;

    return false;
  }

  function dragStop() {
    dom.removeClass(gui.__closeButton, GUI.CLASS_DRAG);
    dom.unbind(window, "mousemove", drag);
    dom.unbind(window, "mouseup", dragStop);

    gui.domElement.dispatchEvent(
      new CustomEvent("dragstop", {
        bubbles: true,
        cancelable: true,
      })
    );
  }

  function dragStart(e) {
    e.preventDefault();

    pmouseX = e.clientX;

    dom.addClass(gui.__closeButton, GUI.CLASS_DRAG);
    dom.bind(window, "mousemove", drag);
    dom.bind(window, "mouseup", dragStop);

    gui.domElement.dispatchEvent(
      new CustomEvent("dragstart", {
        bubbles: true,
        cancelable: true,
      })
    );

    return false;
  }

  dom.bind(gui.__resize_handle, "mousedown", dragStart);
  if (gui.__closeButton) {
    dom.bind(gui.__closeButton, "mousedown", dragStart);
  }

  gui.domElement.insertBefore(gui.__resize_handle, gui.domElement.firstElementChild);
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
  const toReturn = {};

  // For each object I'm remembering
  common.each(gui.__rememberedObjects, function (val, index) {
    const savedValues = {};

    // The controllers I've made for this object by property
    const controllerMap = gui.__rememberedObjectIndecesToControllers[index];

    // Remember each value for each property
    common.each(controllerMap, function (controller, property) {
      savedValues[property] = useInitialValues ? controller.initialValue : controller.getValue();
    });

    // Save the values for thcommon.isObject
    toReturn[index] = savedValues;
  });

  return toReturn;
}

function setPresetSelectIndex(gui) {
  for (let index = 0; index < gui.__preset_select.length; index++) {
    if (gui.__preset_select[index].value === gui.preset) {
      gui.__preset_select.selectedIndex = index;
    }
  }
}

function updateDisplays(controllerArray) {
  if (controllerArray.length !== 0) {
    requestAnimationFrame(function () {
      updateDisplays(controllerArray);
    });
  }

  common.each(controllerArray, function (c) {
    c.updateDisplay();
  });
}

export default GUI;
