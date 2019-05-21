/**
 * dat-gui JavaScript Controller Library
 * http://code.google.com/p/dat-gui
 *
 * Copyright 2011 Data Arts Team, Google Creative Lab
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import fs from "fs";
import path from "path";
import resolve from "rollup-plugin-node-resolve";
import cleanup from "rollup-plugin-cleanup";
import babel from "rollup-plugin-babel";
import sass from "rollup-plugin-sass";
import html from "rollup-plugin-html";
import commonjs from "rollup-plugin-commonjs";

const banner = fs.readFileSync(path.join(__dirname, "licenseBanner.txt"));

export default {
  input: "src/dat/index.js",
  output: [
    {
      // TODO: Remove default exports, and this line, in v0.8.0.
      exports: "named",
      file: "./build/dat.gui.js",
      format: "umd",
      name: "dat",
      sourcemap: false,
      banner: banner
    },
    {
      file: "./build/dat.gui.module.js",
      format: "es",
      sourcemap: false,
      banner: banner
    }
  ],
  watch: {
    include: "src/**"
  },
  plugins: [
    resolve(),
    html({
      include: "**/*.html"
    }),
    sass({
      // insert: true makes dat.gui automatically append the styles when just the JS is included,
      // with insert: false both the JS and CSS need to explicitly be included
      insert: false,
      output: "build/dat.gui.css",
      options: { outputStyle: "expanded" }
    }),
    babel({
      babelrc: false,
      comments: true,
      sourceMap: false,
      presets: [
        [
          "@babel/preset-env",
          {
            modules: false,
            loose: true
          }
        ]
      ],
      exclude: "node_modules/**"
    }),
    commonjs({
      "node_modules/wsgif/sibgif.js": ["SuperGif"]
    }),
    cleanup()
  ]
};
