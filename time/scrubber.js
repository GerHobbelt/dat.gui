//
// OBSOLETE STUFF?
//
// old v0.4 code which needs to be integrated or otherwise thrown away
//

define(["gui", "gui.scrubberpoint", "gui.easing", "gui.timer"], function (GUI) {
  GUI.Scrubber = function (controller, timer) {
    var _this = this;

    this.points = [];
    this.timer = timer;
    this.timer.scrubbers.push(this);
    this.controller = controller;
    this.controller.scrubber = this;
    this.playing = false;

    var previouslyHandled;
    this.position = null;

    this.getJSON = function () {
      var pointArray = [];
      for (var i in this.points) {
        pointArray.push(this.points[i].getJSON());
      }
      var obj = { points: pointArray };

      return obj;
    };

    this.sort = function () {
      this.points.sort(function (a, b) {
        return a.time - b.time;
      });
    };

    this.add = function (p) {
      this.points.push(p);
      this.sort();
    };

    var lastDown = 0;

    this.controller.addChangeListener(function (newVal) {
      if (!_this.playing) {
        var v = newVal;

        if (_this.controller.type == "boolean") {
          v = !v; // Couldn't tell you why I have to do this.
        }

        if (_this.timer.activePoint == null) {
          _this.timer.activePoint = new GUI.ScrubberPoint(_this, _this.timer.playhead, v);
          _this.add(_this.timer.activePoint);
          _this.render();
        } else {
          _this.timer.activePoint.value = v;
        }
      }
    });

    this.domElement = document.createElement("div");
    this.domElement.setAttribute("class", "guidat-scrubber");

    this.canvas = document.createElement("canvas");
    this.domElement.appendChild(this.canvas);

    this.g = this.canvas.getContext("2d");

    var width;
    var height;

    var mx, pmx;

    this.__defineGetter__("width", function () {
      return width;
    });

    this.__defineGetter__("height", function () {
      return height;
    });

    controller.domElement.insertBefore(this.domElement, controller.propertyNameElement.nextSibling);

    this.render = function () {
      // TODO: if visible ...

      _this.g.clearRect(0, 0, width, height);

      // Draw 0
      if (_this.timer.windowMin < 0) {
        var x = GUI.map(0, _this.timer.windowMin, _this.timer.windowMin + _this.timer.windowWidth, 0, width);
        _this.g.fillStyle = "#000";
        _this.g.fillRect(0, 0, x, height - 1);
      }

      // Draw ticks
      if (_this.timer.useSnap) {
        _this.g.lineWidth = 1;
        // TODO: That's just a damned nasty for loop.
        for (
          var i = _this.timer.snap(_this.timer.windowMin);
          i < _this.timer.windowMin + _this.timer.windowWidth;
          i += _this.timer.snapIncrement
        ) {
          if (i == 0) continue;
          var x =
            Math.round(GUI.map(i, _this.timer.windowMin, _this.timer.windowMin + _this.timer.windowWidth, 0, width)) +
            0.5;
          if (i < 0) {
            _this.g.strokeStyle = "#111";
          } else {
            _this.g.strokeStyle = "#363636";
          }
          _this.g.beginPath();
          _this.g.moveTo(x, 0);
          _this.g.lineTo(x, height - 1);
          _this.g.stroke();
        }
      }

      // Draw points
      for (var i in _this.points) {
        _this.points[i].update();
      }

      for (var i in _this.points) {
        _this.points[i].render();
      }

      // Draw playhead
      _this.g.strokeStyle = "#ff0024";
      _this.g.lineWidth = 1;
      var t =
        Math.round(
          GUI.map(
            _this.timer.playhead,
            _this.timer.windowMin,
            _this.timer.windowMin + _this.timer.windowWidth,
            0,
            width
          )
        ) + 0.5;
      _this.g.beginPath();
      _this.g.moveTo(t, 0);
      _this.g.lineTo(t, height);
      _this.g.stroke();
    };

    this.render();

    var onResize = function () {
      _this.canvas.width = width = _this.domElement.offsetWidth;
      _this.canvas.height = height = _this.domElement.offsetHeight;
      _this.position = GUI.getOffset(_this.canvas);
      _this.render();
    };

    window.addEventListener(
      "resize",
      function (e) {
        onResize();
      },
      false
    );

    var scrubPan = function () {
      var t = _this.timer.playhead;
      var tmin = _this.timer.windowMin + _this.timer.windowWidth / 5;
      var tmax = _this.timer.windowMin + _this.timer.windowWidth - _this.timer.windowWidth / 5;

      if (t < tmin) {
        _this.timer.windowMin += GUI.map(t, _this.timer.windowMin, tmin, -_this.timer.windowWidth / 50, 0);
      }

      if (t > tmax) {
        _this.timer.windowMin += 0;
        _this.timer.windowMin += GUI.map(
          t,
          tmax,
          _this.timer.windowMin + _this.timer.windowWidth,
          0,
          _this.timer.windowWidth / 50
        );
      }
    };

    var scrub = function (e) {
      var t = GUI.map(
        e.pageX,
        _this.position.left,
        _this.position.left + width,
        _this.timer.windowMin,
        _this.timer.windowMin + _this.timer.windowWidth
      );
      _this.timer.playhead = _this.timer.snap(t);
      scrubPan();
    };

    var pan = function (e) {
      mx = e.pageX;
      var t = GUI.map(mx - pmx, 0, width, 0, _this.timer.windowWidth);
      _this.timer.windowMin -= t;
      pmx = mx;
    };

    this.canvas.addEventListener(
      "mousedown",
      function (e) {
        // TODO: Detect right click and prevent that menu?
        if (false) {
          e.preventDefault();
          document.addEventListener("mousemove", pan, false);
          return false;
        }

        var thisDown = GUI.millis();

        // Double click creates a keyframe
        // TODO: You can double click to create a keyframe right on top of an existing keyframe.
        // TODO: Make 300 a constant of some sort.
        if (thisDown - lastDown < 300) {
          var val = _this.controller.getValue();

          if (_this.controller.type == "boolean") {
            val = !val;
          }

          _this.timer.activePoint = new GUI.ScrubberPoint(_this, _this.timer.playhead, val);
          _this.timer.activePoint.update(); // Grab x and y
          _this.timer.activePoint.onSelect();
          _this.add(_this.timer.activePoint);
          _this.render();

          // A regular click COULD select a point ...
        } else if (_this.timer.hoverPoint != null) {
          if (_this.timer.activePoint != _this.timer.hoverPoint) {
            if (_this.timer.activePoint != null) _this.timer.activePoint.onBlur();
            _this.timer.activePoint = _this.timer.hoverPoint;
            _this.timer.activePoint.onSelect();
          }
          _this.timer.playhead = _this.timer.snap(_this.timer.activePoint.time);

          pmx = mx = e.pageX;
          document.addEventListener("mousemove", _this.timer.activePoint.onDrag, false);

          // Or we could just be trying to place the playhead/scrub.
        } else {
          if (_this.timer.activePoint != null) {
            _this.timer.activePoint.onBlur();
          }

          _this.timer.activePoint = null;
          _this.timer.hoverPoint = null;
          scrub(e);
          document.body.style.cursor = "text";
          _this.timer.pause();
          pmx = mx = e.pageX;
          document.addEventListener("mousemove", scrub, false);
          _this.render();
        }

        lastDown = thisDown;
      },
      false
    );

    this.canvas.addEventListener(
      "mousewheel",
      function (e) {
        e.preventDefault();

        var dx = e.wheelDeltaX * 4;

        var dy = e.wheelDeltaY * 4;
        _this.timer.windowWidth -= dy;
        _this.timer.windowMin += dy / 2 - dx;

        return false;
      },
      false
    );

    this.canvas.addEventListener("mousemove", function (e) {
      _this.timer.hoverPoint = null;
      for (var i in _this.points) {
        var cur = _this.points[i];
        if (cur.isHovering(e.pageX - _this.position.left)) {
          _this.timer.hoverPoint = cur;
        }
      }
      if (_this.timer.hoverPoint == null) {
        document.body.style.cursor = "auto";
      } else {
        document.body.style.cursor = "pointer";
      }
      _this.render();
    });

    document.addEventListener(
      "mouseup",
      function () {
        document.body.style.cursor = "auto";
        if (_this.timer.activePoint != null) {
          document.removeEventListener("mousemove", _this.timer.activePoint.onDrag, false);
        }
        document.removeEventListener("mousemove", scrub, false);
        document.removeEventListener("mousemove", pan, false);
      },
      false
    );

    onResize();

    this.timer.addPlayListener(this.render);

    var handlePoint = function (point) {
      if (point != previouslyHandled) {
        previouslyHandled = point;
        _this.controller.setValue(point.value);
      }
    };

    var onPlayChange = function (curTime, prevTime) {
      if (_this.points.length == 0) return;

      _this.playing = true;

      if (_this.controller.type == "function") {
        for (var i = 0; i < _this.points.length; i++) {
          var t = _this.points[i].time;
          if (
            (curTime > prevTime && prevTime < t && t < curTime) ||
            (curTime < prevTime && prevTime > t && t > curTime)
          ) {
            _this.controller.getValue().call(this);
          }
        }
      } else {
        var prev = undefined;
        var next = undefined;

        // Find 'surrounding' points.

        for (var i = 0; i < _this.points.length; i++) {
          var t = _this.points[i].time;

          if (t > curTime) {
            if (i == 0) {
              prev = null;
              next = _this.points[i];
              break;
            } else {
              prev = _this.points[i - 1];
              next = _this.points[i];
              break;
            }
          }
        }

        if (next == undefined) {
          prev = _this.points[_this.points.length - 1];
          next = null;
        }

        if ((next != null) & (prev != null)) {
          if (_this.controller.type == "number") {
            var t = prev.tween(GUI.map(curTime, prev.time, next.time, 0, 1));

            _this.controller.setValue(GUI.map(t, 0, 1, prev.value, next.value));
          } else {
            handlePoint(prev);
          }
        } else if (next != null) {
          handlePoint(next);
        } else if (prev != null) {
          handlePoint(prev);
        }
      }

      _this.playing = false;
    };

    this.timer.addPlayListener(onPlayChange);
    this.timer.addWindowListener(this.render);

    // Load saved points!!!!

    if (timer.gui.json) {
      var json = timer.gui.json.timer.scrubbers.splice(0, 1)[0];
      for (var i in json.points) {
        var p = json.points[i];
        var pp = new GUI.ScrubberPoint(this, p.time, p.value);
        if (p.tween) {
          pp.tween = GUI.Easing[p.tween];
        }
        this.add(pp);
      }
    }
  };

  return GUI.Scrubber;
});
