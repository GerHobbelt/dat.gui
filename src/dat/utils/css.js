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

const css = {
  load: function (url, doc) {
    doc = doc || document;
    const link = doc.createElement("link");
    link.type = "text/css";
    link.rel = "stylesheet";
    link.href = url;
    doc.getElementsByTagName("head")[0].appendChild(link);
  },
  inject: function (css, doc) {
    doc = doc || document;
    const injected = document.createElement("style");
    injected.type = "text/css";
    injected.innerHTML = css;
    const head = doc.getElementsByTagName("head")[0];
    try {
      head.appendChild(injected);
    } catch (e) {
      // At least log this error in the browser console:
      console.error("Unable to inject CSS, probably because of a Content Security Policy");
    }
  },
};

export default css;
