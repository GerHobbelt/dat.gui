# UI Controller (dat.gui ported to commonjs)

## dynamic_properties branch

This branch add the possibility for controllers to handle "dynamic properties".

It means that the property supplied to the controller may not exist as such on the supplied object but in the form of a couple of standard getter/setter functions that match the property's name.

Ie: the property `"position"` match the `getPosition()`/`setPosition()` functions.

---
Original dat.GUI readme below:

---

# dat.GUI

A lightweight graphical user interface for changing variables in JavaScript.

Get started with dat.GUI by reading the tutorial at http://workshop.chromeexperiments.com/examples/gui.



## Packaged Builds

The easiest way to use dat.GUI in your code is by using the built source at `build/dat.GUI.min.js`. These built JavaScript files bundle all the necessary dependencies to run dat.GUI.

In your `head` tag, include the following code:

```html
<script type="text/javascript" src="dat.GUI.min.js"></script>
```


## As commonjs module

Install the module:

```bash
$ npm install --save dat.gui
```

Use it:

``` js
// CommonJS:
const dat = require('dat.gui');

// ES6:
import * as dat from 'dat.gui';

var obj = { x: 5 };
var gui = new dat.GUI();

gui.add(obj, 'x').onChange(function() {
  // obj.x will now have updated value
});
```







## Directory Contents

* build: Concatenated source code for browsers.
* src: source code in commonjs format.
* tests: [QUnit](https://github.com/jquery/qunit) test suite.
* utils: [node.js](http://nodejs.org/) utility scripts for compiling source.


## Building your own dat.GUI

In the terminal, enter the following:

```bash
$ npm install
$ npm run build
```

This will create a rolled-up build of dat.GUI at `build/dat.gui.js` and its
minified version at `build/dat.gui.min.js`.

## Change log

### Pending version number
 * Moved to commonjs, made it browserify friendly.
 * Back to GitHub.

### 0.5

* Moved to requirejs for dependency management.
* Changed global namespace from *DAT* to *dat* (lowercase).
* Added support for color controllers. See [Color Controllers](http://workshop.chromeexperiments.com/examples/gui/#4--Color-Controllers).
* Added support for folders. See [Folders](http://workshop.chromeexperiments.com/examples/gui/#3--Folders).
* Added support for saving named presets.  See [Presets](http://workshop.chromeexperiments.com/examples/gui/examples/gui/#6--Presets).
* Removed `height` parameter from GUI constructor. Scrollbar automatically induced when window is too short.
* `dat.GUI.autoPlace` parameter removed. Use `new dat.GUI( { autoPlace: false } )`. See [Custom Placement](http://workshop.chromeexperiments.com/examples/gui/#9--Custom-Placement).
* `gui.autoListen` and `gui.listenAll()` removed. See [Updating The Display Manually](http://workshop.chromeexperiments.com/examples/gui/#11--Updating-the-Display-Manually).
* `dat.GUI.load` removed. See [Saving Values](http://workshop.chromeexperiments.com/examples/gui/#5--Saving-Values).
* Made Controller code completely agnostic of GUI. Controllers can easily be created independent of a GUI panel.


### 0.4

* Migrated from GitHub to Google Code.


## Thanks

The following libraries / open-source projects were used in the development of dat.GUI:

 * [Rollup](https://rollupjs.org)
 * [Sass](http://sass-lang.com/)
 * [Node.js](http://nodejs.org/)
 * [QUnit](https://github.com/jquery/qunit) / [jquery](http://jquery.com/)

