# dat.GUI

A lightweight graphical user interface for changing variables in JavaScript.

Get started with dat.GUI by reading the [tutorial](http://workshop.chromeexperiments.com/examples/gui)
or the [API documentation](API.md).



## Packaged Builds

The easiest way to use dat.GUI in your code is by using the built source at `build/dat.gui.min.js`. These built JavaScript files bundle all the necessary dependencies to run dat.GUI.

In your `head` tag, include the following code:

```html
<script type="text/javascript" src="dat.gui.min.js"></script>
```

## Installing from npm

Install the module:

```bash
$ npm install --save dat.gui
```

Use it:

```js
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

```
├── build - Concatenated source code for browsers.
├── src - source code in commonjs format.
└── tests - [QUnit](https://github.com/jquery/qunit) test suite.
```

## Building your own dat.GUI

In the terminal, enter the following:

```bash
$ npm install
$ npm run build
```

This will create a rolled-up build of dat.GUI at `build/dat.gui.js` and its
minified version at `build/dat.gui.min.js`.


## npm scripts

- npm run build - Build development and production version of scripts.
- npm run dev - Build development version of script and watch for changes.


## Working with Content Security Policy

If you're using a server with a Content Security Policy in place that blocks 'unsafe-inline', you will have problems when dat.gui.js tries to inject style information. To get around this, load 'build/dat.gui.css' as an external style sheet.


## Changes

View the [Change Log](CHANGELOG.md)

## Thanks

The following libraries / open-source projects were used in the development of dat.GUI:

 * [Rollup](https://rollupjs.org)
 * [Sass](http://sass-lang.com/)
 * [Node.js](http://nodejs.org/)
 * [QUnit](https://github.com/jquery/qunit) / [jquery](http://jquery.com/)

