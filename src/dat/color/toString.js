/**
 * dat.GUI JavaScript Controller Library
 * http://code.google.com/p/dat-gui
 *
 * Copyright 2011-2019 Data Arts Team, Google Creative Lab
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */

export default function (color, forceCSSHex) {
  const colorFormat = color.__state.conversionName.toString();

  const r = Math.round(color.r);
  const g = Math.round(color.g);
  const b = Math.round(color.b);
  const { a } = color;
  const h = Math.round(color.h);
  const s = color.s.toFixed(1);
  const v = color.v.toFixed(1);

  if (forceCSSHex || colorFormat === "THREE_CHAR_HEX" || colorFormat === "SIX_CHAR_HEX") {
    let str = color.hex.toString(16);
    while (str.length < 6) {
      str = "0" + str;
    }
    return "#" + str;
  }
  if (colorFormat === "CSS_RGB") {
    return "rgb(" + r + "," + g + "," + b + ")";
  }
  if (colorFormat === "CSS_RGBA") {
    return "rgba(" + r + "," + g + "," + b + "," + a + ")";
  }
  if (colorFormat === "HEX") {
    return "0x" + color.hex.toString(16);
  }
  if (colorFormat === "RGB_ARRAY") {
    return "[" + r + "," + g + "," + b + "]";
  }
  if (colorFormat === "RGBA_ARRAY") {
    return "[" + r + "," + g + "," + b + "," + a + "]";
  }
  if (colorFormat === "RGB_OBJ") {
    return "{r:" + r + ",g:" + g + ",b:" + b + "}";
  }
  if (colorFormat === "RGBA_OBJ") {
    return "{r:" + r + ",g:" + g + ",b:" + b + ",a:" + a + "}";
  }
  if (colorFormat === "HSV_OBJ") {
    return "{h:" + h + ",s:" + s + ",v:" + v + "}";
  }
  if (colorFormat === "HSVA_OBJ") {
    return "{h:" + h + ",s:" + s + ",v:" + v + ",a:" + a + "}";
  }

  return "unknown format";
}
