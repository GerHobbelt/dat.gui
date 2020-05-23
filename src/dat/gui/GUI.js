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
import ControllerFactory from "../controllers/ControllerFactory";
import Controller from "../controllers/Controller";
import BooleanController from "../controllers/BooleanController";
import FunctionController from "../controllers/FunctionController";
import NumberControllerBox from "../controllers/NumberControllerBox";
import NumberControllerSlider from "../controllers/NumberControllerSlider";
import ColorController from "../controllers/ColorController";
import OptionController from "../controllers/OptionController";
import EasingFunctionController from "../controllers/EasingFunctionController";
import TextAreaController from "../controllers/TextAreaController";
import UndefinedController from "../controllers/UndefinedController";
import requestAnimationFrame from "../utils/requestAnimationFrame";
import CenteredDiv from "../dom/CenteredDiv";
import dom from "../dom/dom";
import common from "../utils/common";

// import styleSheet from "./style.scss"; // CSS to embed in build

// var ARR_EACH = Array.prototype.forEach;
const ARR_SLICE = Array.prototype.slice;

// css.inject(styleSheet);

/** Outer-most className for GUI's */
const CSS_NAMESPACE = "dg";

const HIDE_KEY_CODE = 72;

/** The only value shared between the JS and SCSS. Use caution. */
const CLOSE_BUTTON_HEIGHT = 20;

const DEFAULT_DEFAULT_PRESET_NAME = "Default";

const SUPPORTS_LOCAL_STORAGE = (function () {
  try {
    return "localStorage" in settings.WINDOW && settings.WINDOW.localStorage != null;
  } catch (e) {
    return false;
  }
})();

let SAVE_DIALOGUE;

/** Have we yet to create an autoPlace GUI? */
let auto_place_virgin = true;

/** Fixed position div that auto place GUI's go inside */
let auto_place_container;

/** Are we hiding the GUI's ? */
let hide = false;

/** GUI's which should be hidden */
const hideable_guis = [];

/**
 * @class A lightweight controller library for JavaScript. It allows you to easily
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
class GUI {
  constructor(params) {
    const _this = this;

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
     * @private
     */
    this.__folders = {};

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
      if (params.preset) {
        params.load.preset = params.preset;
      }
    } else {
      params.load = {
        preset: DEFAULT_DEFAULT_PRESET_NAME,
      };
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
    let use_local_storage =
      SUPPORTS_LOCAL_STORAGE && localStorage.getItem(getLocalStorageHash(this, "isLocal")) === "true";

    let saveToLocalStorage;

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
            }
            return params.load.preset;
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
            // Check for collisions among sibling folders:
            // We have to prevent collisions on names in order to have a key
            // by which to remember saved values.
            if (v !== params.name && _this.__folders[v] !== undefined) {
              throw new Error("name collision: another sibling GUI folder has the same name");
            }
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
            _this.onResize();

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

          const saved_gui = localStorage.getItem(getLocalStorageHash(this, "gui"));

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
        if (_this.__onClosedChange) {
          _this.__onClosedChange.call(_this, _this.closed);
        }
      });
    } else {
      // Oh, you're a nested GUI!

      if (params.closed === undefined) {
        params.closed = true;
      }

      var title_row_name = settings.DOCUMENT.createTextNode(params.name);
      dom.addClass(title_row_name, "controller-name");

      const title_row = addRow(_this, title_row_name);

      const on_click_title = function (e) {
        e.preventDefault();
        _this.closed = !_this.closed;
        if (_this.__onClosedChange) {
          _this.__onClosedChange.call(_this, _this.closed);
        }
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

    saveToLocalStorage = function () {
      if (SUPPORTS_LOCAL_STORAGE && localStorage.getItem(getLocalStorageHash(_this, "isLocal")) === "true") {
        localStorage.setItem(getLocalStorageHash(_this, "gui"), JSON.stringify(_this.getSaveObject()));
      }
    };

    // expose this method publicly
    this.saveToLocalStorageIfPossible = saveToLocalStorage;

    const root = _this.getRoot();

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
  }

  onClosedChange(fnc) {
    this.__onClosedChange = fnc;
    return this;
  }

  getControllerByName(name, recurse) {
    const controllers = this.__controllers;
    let i = controllers.length;
    while (--i > -1) {
      if (controllers[i].property === name) {
        return controllers[i];
      }
    }
    const folders = this.__folders;
    let tryFI;
    if (recurse) {
      for (i in folders) {
        tryFI = folders[i].getControllerByName(name, true);
        if (tryFI != null) return tryFI;
      }
    }
    return null;
  }

  getFolderByName(name) {
    return this.__folders[name];
  }

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

  /*
   *  Gets this current GUI (usually) and all sub-folder GUIs under this GUI as an array of {name/gui} pairs. The "this" current gui uses empty string.
   *  @param  recurse (optional) By default, it will recurse multiple levels deep. Set to false to only scan current level from current GUI.
   *  @param  myArray (optional) Supply an existing array to use instead.  If supplied, will not push current GUI into array, only the subfolder GUIs.
   *  @return   The array of {name/gui} value pairs
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
    common.each(hideable_guis, function (gui) {
      gui.domElement.style.zIndex = hide ? -999 : 999;
      gui.domElement.style.opacity = hide ? 0 : 1;
    });
  }

  _keydownHandler(e) {
    if (
      settings.DOCUMENT.activeElement.type !== "text" &&
      settings.DOCUMENT.activeElement.nodeName.toString().toLowerCase() !== "textarea" &&
      (e.which === HIDE_KEY_CODE || e.keyCode == HIDE_KEY_CODE)
    ) {
      GUI.toggleHide();
    }
  }

  /**
   * @param object
   * @param property
   * @returns {dat.controllers.Controller} The new controller that was added.
   * @instance
   */
  add(object, property) {
    return add(this, object, property, {
      factoryArgs: Array.prototype.slice.call(arguments, 2),
    });
  }

  /**
   * @param object
   * @param property
   * @returns {dat.controllers.ColorController} The new controller that was added.
   * @instance
   */
  addColor(object, property) {
    return add(this, object, property, {
      color: true,
    });
  }

  /**
   * @param object
   * @param property
   * @returns {dat.controllers.TextAreaController} The new controller that was added.
   * @instance
   */
  addTextArea(object, property) {
    return add(this, object, property, {
      multiline: true,
    });
  }

  /**
   * @param object
   * @param property
   * @returns {dat.controllers.EasingFunctionController} The new controller that was added.
   * @instance
   */
  addEasingFunction(object, property) {
    return add(this, object, property, {
      easing: true,
    });
  }

  /**
   * @param object
   * @param property
   * @returns {dat.controllers.HifiColorController} The new controller that was added.
   * @instance
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
   * @instance
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
   * @instance
   */
  addQuat(object, property) {
    return add(this, object, property, {
      quat: true,
    });
  }

  /**
   * @param controller
   * @instance
   */
  remove(controller) {
    // TODO listening?
    this.__ul.removeChild(controller.__li);
    this.__controllers.splice(this.__controllers.indexOf(controller), 1);
    const _this = this;
    common.defer(function () {
      _this.onResize();
    });
  }

  /**
   * Removes the root GUI from the document and unbinds all event listeners.
   * For subfolders, use `gui.removeFolder(folder)` instead.
   * @instance
   */
  destroy() {
    if (this.autoPlace) {
      auto_place_container.removeChild(this.domElement);
    }
  }

  /**
   * Creates a new subfolder GUI instance.
   * @param name
   * @returns {dat.gui.GUI} The new folder.
   * @throws {Error} if this GUI already has a folder by the specified
   * name
   * @instance
   */
  addFolder(name) {
    // We have to prevent collisions on names in order to have a key
    // by which to remember saved values
    if (this.__folders[name] !== undefined) {
      throw new Error(`You already have a folder in this GUI by the name "${name}"`);
    }

    const new_gui_params = {
      name: name,
      parent: this,
    };

    // We need to pass down the autoPlace trait so that we can
    // attach event listeners to open/close folder actions to
    // ensure that a scrollbar appears if the window is too short.
    new_gui_params.autoPlace = this.autoPlace;

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
      new_gui_params.closed = this.load.folders[name].closed;

      // Pass down the loaded data
      new_gui_params.load = this.load.folders[name];
    }

    const gui = new GUI(new_gui_params);
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
   * Opens the GUI.
   */
  open() {
    this.closed = false;
  }

  /**
   * Closes the GUI.
   */
  close() {
    this.closed = true;
  }

  onResize() {
    const root = this.getRoot();

    if (root.scrollable) {
      const { top } = dom.getOffset(root.__ul);
      let h = 0;

      common.each(root.__ul.childNodes, function (node) {
        if (!(root.autoPlace && node === root.__save_row) && node.nodeType === 1) {
          h += dom.getHeight(node);
        }
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
  }

  /**
   * Mark objects for saving. The order of these objects cannot change as
   * the GUI grows. When remembering new objects, append them to the end
   * of the list.
   *
   * @param {...Object} objects
   * @throws {Error} if not called on a top level GUI.
   * @instance
   */
  remember() {
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
      // Set save row width
      setWidth(this, this.width);
    }
  }

  /**
   * @returns {dat.gui.GUI} the topmost parent GUI of a nested GUI.
   * @instance
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
   * @instance
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

  save() {
    if (!this.load.remembered) {
      this.load.remembered = {};
    }

    this.load.remembered[this.preset] = getCurrentPreset(this);
    markPresetModified(this, false);
    this.saveToLocalStorageIfPossible();
  }

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
  }

  revert(gui) {
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
  }

  listen(controller) {
    const init = this.__listening.length == 0;
    this.__listening.push(controller);
    if (init) {
      updateDisplays(this.__listening);
    }
  }
}

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

function add(gui, object, property, params) {
  if (!(property in object)) {
    throw new Error("Object " + object + ' has no property "' + property + '"');
  }

  let controller;

  if (params.color) {
    controller = new ColorController(object, property);
  } else if (params.easing) {
    controller = new EasingFunctionController(object, property);
  } else if (params.multiline) {
    controller = new TextAreaController(object, property);
  } else {
    const factoryArgs = [object, property].concat(params.factoryArgs);
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

  const name = settings.DOCUMENT.createElement("span");
  dom.addClass(name, "property-name");
  name.innerHTML = controller.label;

  const clear = settings.DOCUMENT.createElement("div");
  clear.style.clear = "both";
  const container = settings.DOCUMENT.createElement("div");
  container.appendChild(name);
  container.appendChild(controller.domElement);
  container.appendChild(clear);

  const li = addRow(gui, container, params.before);

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
  const li = settings.DOCUMENT.createElement("li");
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
            factoryArgs: [common.toArray(arguments)],
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

      /**
       * Sets controller to listen for changes on its underlying object.
       * @return {Controller}
       */
      listen: function () {
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

    controller.__valueControllerBox = box;

    common.each(["updateDisplay", "onChange", "onFinishChange"], function (method) {
      const pc = controller[method];
      const pb = box[method];
      controller[method] = box[method] = function () {
        const args = ARR_SLICE.call(arguments);
        pc.apply(controller, args);
        return pb.apply(box, args);
      };
    });

    dom.addClass(li, "has-slider");
    controller.domElement.insertBefore(box.domElement, controller.domElement.firstElementChild);
  } else if (controller instanceof NumberControllerBox) {
    const r = function (returned) {
      // Have we defined both boundaries?
      if (common.isNumber(controller.__min) && common.isNumber(controller.__max)) {
        // Well, then let's just replace this with a slider.
        controller.remove();
        const newController = add(gui, controller.object, controller.property, {
          before: controller.__li.nextElementSibling,
          factoryArgs: [controller.__min, controller.__max, controller.__step],
        });

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
  const root = gui.getRoot();

  // Does the object we're controlling match anything we've been told to
  // remember?
  const matched_index = root.__rememberedObjects.indexOf(controller.object);

  // Why yes, it does!
  if (matched_index !== -1) {
    // Let me fetch a map of controllers for this object.
    let controller_map = root.__rememberedObjectIndecesToControllers[matched_index];

    // I believe this is the first controller we've created for this
    // object. Let's make a fresh map.
    if (controller_map === undefined) {
      controller_map = {};
      root.__rememberedObjectIndecesToControllers[matched_index] = controller_map;
    }

    // Keep track of this controller
    controller_map[controller.property] = controller;

    // Okay, now have we saved any values for this controller?
    if (root.load && root.load.remembered) {
      const preset_map = root.load.remembered;

      // Which preset are we trying to load?
      let preset;

      if (preset_map[gui.preset]) {
        preset = preset_map[gui.preset];
      } else if (preset_map[DEFAULT_DEFAULT_PRESET_NAME]) {
        // Uhh, you can have the default instead?
        preset = preset_map[DEFAULT_DEFAULT_PRESET_NAME];
      } else {
        // Nada.

        return;
      }

      // Did the loaded object remember this object?
      if (
        preset[matched_index] &&
        // Did we remember this particular property?
        preset[matched_index][controller.property] !== undefined
      ) {
        // We did remember something for this guy ...
        const value = preset[matched_index][controller.property];

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
  const div = (gui.__save_row = settings.DOCUMENT.createElement("li"));

  dom.addClass(gui.domElement, "has-save");

  gui.__ul.insertBefore(div, gui.__ul.firstChild);

  dom.addClass(div, "save-row");

  const gears = settings.DOCUMENT.createElement("span");
  gears.innerHTML = "&nbsp;";
  dom.addClass(gears, "button gears");

  // TODO replace with FunctionController
  const button = settings.DOCUMENT.createElement("span");
  button.innerHTML = "Save";
  dom.addClass(button, "button");
  dom.addClass(button, "save");

  const button2 = settings.DOCUMENT.createElement("span");
  button2.innerHTML = "New";
  dom.addClass(button2, "button");
  dom.addClass(button2, "save-as");

  const button3 = settings.DOCUMENT.createElement("span");
  button3.innerHTML = "Revert";
  dom.addClass(button3, "button");
  dom.addClass(button3, "revert");

  const select = (gui.__preset_select = settings.DOCUMENT.createElement("select"));

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

  function showHideExplain() {
    explain.style.display = gui.useLocalStorage ? "block" : "none";
  }

  if (SUPPORTS_LOCAL_STORAGE) {
    const saveLocally = settings.DOCUMENT.getElementById("dg-save-locally");
    const explain = settings.DOCUMENT.getElementById("dg-local-explain");

    saveLocally.style.display = "block";

    const localStorageCheckBox = settings.DOCUMENT.getElementById("dg-local-storage");

    if (localStorage.getItem(getLocalStorageHash(gui, "isLocal")) === "true") {
      localStorageCheckBox.setAttribute("checked", "checked");
    }

    showHideExplain();

    // TODO: Use a boolean controller, fool!
    dom.bind(localStorageCheckBox, "change", function () {
      gui.useLocalStorage = !gui.useLocalStorage;
      showHideExplain();
    });
  }

  const newConstructorTextArea = settings.DOCUMENT.getElementById("dg-new-constructor");

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

  let pmouseX;

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
  const toReturn = {};

  // For each object I'm remembering
  common.each(gui.__rememberedObjects, function (val, index) {
    const saved_values = {};

    // The controllers I've made for thcommon.isObject by property
    const controller_map = gui.__rememberedObjectIndecesToControllers[index];

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
  const opt = settings.DOCUMENT.createElement("option");
  opt.innerHTML = name;
  opt.value = name;
  gui.__preset_select.appendChild(opt);
  if (setSelected) {
    gui.__preset_select.selectedIndex = gui.__preset_select.length - 1;
  }
}

function setPresetSelectIndex(gui) {
  for (let index = 0; index < gui.__preset_select.length; index++) {
    if (gui.__preset_select[index].value === gui.preset) {
      gui.__preset_select.selectedIndex = index;
    }
  }
}

function markPresetModified(gui, modified) {
  const opt = gui.__preset_select[gui.__preset_select.selectedIndex];
  //    console.log('mark', modified, opt);
  if (modified) {
    opt.innerHTML = opt.value + "*";
  } else {
    opt.innerHTML = opt.value;
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
