var minify = process.argv[2] === 'min';

require('./builder.js').build({
   "baseUrl": "../src/",
   "main": "dat/gui/GUI",
   "out": "../build/dat.gui" + (minify ? ".min" : "") + ".js",
   "minify": minify,
   "shortcut": "dat.GUI",
   "paths": {}
});
