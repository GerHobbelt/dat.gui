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

// previously: GUI.constrain
function constrain(v, o1, o2) {
  if (v < o1) v = o1;
  else if (v > o2) v = o2;
  return v;
}

function FizzyText(message, font) {
  const that = this;

  // These are the variables that we manipulate with gui-dat.
  // Notice they're all defined with "this". That makes them public.
  // Otherwise, gui-dat can't see them.

  this.growthSpeed = 0.2; // how fast do particles change size?
  this.maxSize = 5.59; // how big can they get?
  this.noiseStrength = 10; // how turbulent is the flow?
  this.speed = 0.4; // how fast do particles move?
  this.displayOutline = false; // should we draw the message as a stroke?
  this.framesRendered = 0;
  this.font = 0;
  this.allFonts = ["arial", "times", "courier"];

  // __defineGetter__ and __defineSetter__ makes JavaScript believe that
  // we've defined a variable 'this.message'. This way, whenever we
  // change the message variable, we can call some more functions.

  Object.defineProperty(this, "message", {
    get: function () {
      return message;
    },

    set: function (m) {
      message = m;
      createBitmap(message, font);
    },
  });

  Object.defineProperty(this, "font", {
    get: function () {
      return font;
    },

    set: function (f) {
      font = f;
      createBitmap(message, font);
    },
  });

  // We can even add functions to the DAT.GUI! As long as they have
  // 0 arguments, we can call them from the dat-gui panel.

  this.explode = function () {
    const mag = Math.random() * 30 + 30;
    for (const i in particles) {
      const angle = Math.random() * Math.PI * 2;
      particles[i].vx = Math.cos(angle) * mag;
      particles[i].vy = Math.sin(angle) * mag;
    }
  };

  // //////////////////////////////////////////////////////////////

  const _this = this;

  const width = 550;
  const height = 200;
  const textAscent = 101;
  const textOffsetLeft = 80;
  const noiseScale = 300;

  const colors = ["#00aeff", "#0fa954", "#54396e", "#e61d5f"];

  // This is the context we use to get a bitmap of text using
  // the getImageData function.
  const r = document.createElement("canvas");
  const s = r.getContext("2d");

  // This is the context we actually use to draw.
  const c = document.createElement("canvas");
  const g = c.getContext("2d");

  r.setAttribute("width", width);
  c.setAttribute("width", width);
  r.setAttribute("height", height);
  c.setAttribute("height", height);

  /*
    var onResize = function() {
        r.width = c.width = width = window.innerWidth;
        r.height = c.height = height = window.innerHeight;
        console.log(width, height);
    }

    window.addEventListener('resize', function() {
        onResize();
        createBitmap(this.message);
    }, false);
    onResize();
*/

  // Add our demo to the HTML
  document.getElementById("helvetica-demo").appendChild(c);

  // Stores bitmap image
  let pixels = [];

  // Stores a list of particles
  var particles = [];

  // Set g.font to the same font as the bitmap canvas, in case we
  // want to draw some outlines.
  s.font = g.font = "800 82px " + this.allFonts[this.font];

  // Instantiate some particles
  for (let i = 0; i < 1000; i++) {
    particles.push(new Particle(Math.random() * width, Math.random() * height));
  }

  // This function creates a bitmap of pixels based on your message
  // It's called every time we change the message property.
  var createBitmap = function (msg, font) {
    s.font = g.font = "800 82px " + that.allFonts[font];
    s.fillStyle = "#fff";
    s.fillRect(0, 0, width, height);

    s.fillStyle = "#222";
    s.fillText(msg, textOffsetLeft, textAscent);

    // Pull reference
    const imageData = s.getImageData(0, 0, width, height);
    pixels = imageData.data;
  };

  // Called once per frame, updates the animation.
  const render = function () {
    that.framesRendered++;

    s.font = g.font = "800 82px " + that.allFonts[that.font];

    g.clearRect(0, 0, width, height);

    if (_this.displayOutline) {
      g.globalCompositeOperation = "source-over";
      g.strokeStyle = "#000";
      g.lineWidth = 0.5;
      g.strokeText(message, textOffsetLeft, textAscent);
    }

    g.globalCompositeOperation = "darker";

    for (let i = 0; i < particles.length; i++) {
      g.fillStyle = colors[i % colors.length];
      particles[i].render();
    }
  };

  // Returns x, y coordinates for a given index in the pixel array.
  const getPosition = function (i) {
    return {
      x: (i - width * 4 * Math.floor(i / (width * 4))) / 4,
      y: Math.floor(i / (width * 4)),
    };
  };

  // Returns a color for a given pixel in the pixel array.
  const getColor = function (x, y) {
    const base = (Math.floor(y) * width + Math.floor(x)) * 4;
    const c = {
      r: pixels[base + 0],
      g: pixels[base + 1],
      b: pixels[base + 2],
      a: pixels[base + 3],
    };

    return "rgb(" + c.r + "," + c.g + "," + c.b + ")";
  };

  // This calls the setter we've defined above, so it also calls
  // the createBitmap function.
  this.message = message;

  var loop = function () {
    requestAnimationFrame(loop);

    // Don't render if we don't see it.
    // Would be cleaner if I dynamically acquired the top of the canvas.
    if (document.body.scrollTop < height + 20) {
      render();
    }
  };

  // This calls the render function every 30 milliseconds.
  loop();

  // This class is responsible for drawing and moving those little
  // colored dots.
  function Particle(x, y, c) {
    // Position
    this.x = x;
    this.y = y;

    // Size of particle
    this.r = 0;

    // This velocity is used by the explode function.
    this.vx = 0;
    this.vy = 0;

    // Called every frame
    this.render = function () {
      // What color is the pixel we're sitting on top of?
      const c = getColor(this.x, this.y);

      // Where should we move?
      const angle = noise(this.x / noiseScale, this.y / noiseScale) * _this.noiseStrength;

      // Are we within the boundaries of the image?
      const onScreen = this.x > 0 && this.x < width && this.y > 0 && this.y < height;

      const isBlack = c !== "rgb(255,255,255)" && onScreen;

      // If we're on top of a black pixel, grow.
      // If not, shrink.
      if (isBlack) {
        this.r += _this.growthSpeed;
      } else {
        this.r -= _this.growthSpeed;
      }

      // This velocity is used by the explode function.
      this.vx *= 0.5;
      this.vy *= 0.5;

      // Change our position based on the flow field and our
      // explode velocity.
      this.x += Math.cos(angle) * _this.speed + this.vx;
      this.y += -Math.sin(angle) * _this.speed + this.vy;

      this.r = constrain(this.r, 0, _this.maxSize);

      // If we're tiny, keep moving around until we find a black
      // pixel.
      if (this.r <= 0) {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        return; // Don't draw!
      }

      // Draw the circle.
      g.beginPath();
      g.arc(this.x, this.y, this.r, 0, Math.PI * 2, false);
      g.fill();
    };
  }
}

export default FizzyText;
