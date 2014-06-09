var minify = process.argv[2] === 'min';

require(__dirname + '/builder.js').build({
   "baseUrl": __dirname + "/../src/",
   "main": "dat/color/Color",
   "out": "dat.color" + (minify ? ".min" : "") + ".js",
   "minify": minify,
   "shortcut": "dat.Color",
   "paths": {}
});
