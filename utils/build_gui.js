var minify = process.argv[2] === 'min';

require(__dirname + '/builder.js').build({
   "baseUrl": __dirname + "/../src/",
   "main": "dat/gui/GUI",
   "out": "dat.gui" + (minify ? ".min" : "") + ".js",
   "minify": minify,
   "shortcut": "dat.GUI",
   "paths": {},
   "umd": {
        ret: 'dat'
   }
});
