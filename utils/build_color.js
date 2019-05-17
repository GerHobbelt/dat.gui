var minify = process.argv[2] === "min";

require("./builder.js").build({
  verbose: true,
  baseUrl: "../src/",
  main: "dat/color/Color",
  out: "../build/dat.color" + (minify ? ".min" : "") + ".js",
  minify: minify,
  shortcut: "dat.Color",
  paths: {}
});
