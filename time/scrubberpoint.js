//
// OBSOLETE STUFF?
//
// old v0.4 code which needs to be integrated or otherwise thrown away
//

define(["gui", "gui.easing"], function (GUI) {
  GUI.ScrubberPoint = function (scrubber, time, value) {
    var _this = this;

    var g = scrubber.g;
    var timer = scrubber.timer;
    var type = scrubber.controller.type;
    var x, y;

    this.hold = false;

    var val;

    this.__defineSetter__("value", function (v) {
      val = v;
      scrubber.render();
    });

    this.value = value;

    this.__defineGetter__("value", function () {
      return val;
    });

    this.__defineGetter__("x", function () {
      return x;
    });

    this.__defineGetter__("y", function () {
      return y;
    });

    var barSize = 4;
    var rectSize = 5;

    var c1 = "#ffd800";
    var c2 = "#ff9000";

    var positionTweenSelector = function () {
      var tweenSelectorLeft = scrubber.position.left + timer.activePoint.x - timer.tweenSelector.offsetWidth / 2;
      var tweenSelectorTop = GUI.getOffset(scrubber.canvas, timer.gui.domElement).top + timer.activePoint.y - 25;
      timer.tweenSelector.style.left = tweenSelectorLeft + "px";
      timer.tweenSelector.style.top = tweenSelectorTop + "px";
    };

    this.onSelect = function () {
      if (type == "number") {
        timer.showTweenSelector();
        positionTweenSelector();
        var tweenName;
        for (var i in GUI.Easing) {
          if (this.tween == GUI.Easing[i]) {
            tweenName = i;
          }
        }
        timer.tweenSelector.value = tweenName;
      }
    };

    this.onBlur = function () {
      if (type == "number") {
        timer.hideTweenSelector();
      }
    };

    this.onDrag = function (e) {
      var t = GUI.map(
        e.pageX,
        scrubber.position.left,
        scrubber.position.left + scrubber.canvas.width,
        timer.windowMin,
        timer.windowMin + timer.windowWidth
      );
      _this.time = timer.snap(t);
      timer.playhead = timer.snap(t);
      scrubber.sort();
      _this.update();
      if (type == "number") {
        positionTweenSelector();
      }
    };

    this.getJSON = function () {
      var obj = { value: _this.value, time: GUI.roundToDecimal(time, 4) };

      // TODO: save tweens

      if (this.tween != GUI.Easing.Linear) {
        for (var i in GUI.Easing) {
          if (this.tween == GUI.Easing[i]) {
            obj.tween = i;
          }
        }
      }

      return obj;
    };

    this.tween = GUI.Easing.Linear;

    this.remove = function () {
      scrubber.points.splice(scrubber.points.indexOf(this), 1);
      scrubber.render();
    };

    this.isHovering = function (xx) {
      return xx >= x - rectSize / 2 && xx <= x + rectSize / 2;
    };

    this.__defineGetter__("next", function () {
      if (scrubber.points.length <= 1) {
        return null;
      }

      var i = scrubber.points.indexOf(this);
      if (i + 1 >= scrubber.points.length) {
        return null;
      }

      return scrubber.points[i + 1];
    });

    this.__defineGetter__("prev", function () {
      if (scrubber.points.length <= 1) {
        return null;
      }

      var i = scrubber.points.indexOf(this);
      if (i - 1 < 0) {
        return null;
      }

      return scrubber.points[i - 1];
    });

    this.__defineGetter__("time", function () {
      return time;
    });

    this.__defineSetter__("time", function (s) {
      time = s;
    });

    this.update = function () {
      x = GUI.map(time, timer.windowMin, timer.windowMin + timer.windowWidth, 0, 1);
      x = Math.round(GUI.map(x, 0, 1, 0, scrubber.width));

      y = scrubber.height / 2;

      if (scrubber.controller.type == "number") {
        y = GUI.map(_this.value, scrubber.controller.min, scrubber.controller.max, scrubber.height, 0);
      }
    };

    this.render = function () {
      if (x < 0 || x > scrubber.width) {
        return;
      }

      if (GUI.hidden) {
        return;
      }

      // TODO: if hidden because of scroll top.

      if (scrubber.timer.activePoint == this) {
        g.fillStyle = "#ffd800"; //
      } else if (scrubber.timer.hoverPoint == this) {
        g.fillStyle = "#999";
      } else {
        g.fillStyle = "#ccc";
      }

      switch (type) {
        case "boolean":
          g.save();
          g.translate(x, y - 0.5);

          if (this.value) {
            g.strokeStyle = g.fillStyle;
            g.lineWidth = barSize;
            g.beginPath();
            g.arc(0, 0, barSize, 0, Math.PI * 2, false);
            g.stroke();
          } else {
            g.rotate(Math.PI / 4);
            g.fillRect(-barSize / 2, (-barSize * 3.5) / 2, barSize, barSize * 3.5);
            g.rotate(Math.PI / 2);
            g.fillRect(-barSize / 2, (-barSize * 3.5) / 2, barSize, barSize * 3.5);
          }

          g.restore();

          break;

        case "number":
          g.save();

          var p = this.prev;

          g.lineWidth = 3;
          g.strokeStyle = "#222";

          if (p != null && p.time < timer.windowMin) {
            var t = GUI.map(timer.windowMin, p.time, this.time, 0, 1);
            var yy = GUI.map(p.tween(t), 0, 1, p.y, y);

            g.beginPath();
            g.moveTo(0, yy);

            if (p.tween == GUI.Easing.Linear) {
              g.lineTo(x, y);
            } else {
              for (var i = t; i < 1; i += 0.01) {
                var tx = GUI.map(i, 0, 1, p.x, x);
                var ty = p.tween(i);
                ty = GUI.map(ty, 0, 1, p.y, y);
                g.lineTo(tx, ty);
              }
            }

            g.stroke();
          }

          var n = this.next;

          if (n != null) {
            g.beginPath();

            g.moveTo(x, y);

            if (_this.tween == GUI.Easing.Linear) {
              g.lineTo(n.x, n.y);
            } else {
              for (var i = 0; i < 1; i += 0.01) {
                var tx = GUI.map(i, 0, 1, x, n.x);
                var ty = _this.tween(i);
                ty = GUI.map(ty, 0, 1, y, n.y);
                g.lineTo(tx, ty);
              }
            }

            g.stroke();
          }

          g.translate(x, y);
          g.rotate(Math.PI / 4);
          //	g.fillStyle = c1;
          g.fillRect(-rectSize / 2, -rectSize / 2, rectSize, rectSize);
          g.restore();

          break;

        default:
          g.save();
          g.translate(x - barSize / 2, 0);
          // g.fillStyle = c1;
          g.fillRect(0, 0, barSize / 2, scrubber.height - 1);
          // g.fillStyle = c2;
          g.fillRect(barSize / 2, 0, barSize / 2, scrubber.height - 1);
          g.restore();
      }
    };
  };

  return GUI.ScrubberPoint;
});
