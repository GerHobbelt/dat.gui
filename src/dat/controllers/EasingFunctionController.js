/**
 * dat-gui JavaScript Controller Library
 * http://code.google.com/p/dat-gui
 *
 * Copyright 2011 Data Arts Team, Google Creative Lab
 *           2016 unikko <chino.coffee.1204@gmail.com>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */

define(["dat/controllers/Controller", "dat/dom/dom", "dat/easing/Easing", "dat/utils/common"], function(
  Controller,
  dom,
  EasingFunction,
  common
) {
  var EasingFunctionController = function(object, property) {
    EasingFunctionController.superclass.call(this, object, property);

    var _this = this;
    this.domElement = document.createElement("div");
    dom.makeSelectable(this.domElement, false);

    this.__func = new EasingFunction(object[property]);
    this.__cursor = 0.0; // 0.0-1.0

    this.__mouse_over = false;
    this.__point_over = null;
    this.__point_selected = null;
    this.__point_selected_type = null;
    this.__point_moving = false;

    var width = 146,
      height = 80;
    var rectView = { top: 1, left: 3, width: width - 2, height: height - 16 };
    var rV = rectView;

    this.__thumbnail = document.createElement("canvas");
    this.__thumbnail.width = width * 2;
    this.__thumbnail.height = height * 2;
    this.__thumbnail.className = "easing-thumbnail";
    this.__ctx = this.__thumbnail.getContext("2d");
    this.__ctx.scale(2, 2);

    dom.bind(this.__thumbnail, "contextmenu", function(e) {
      e.preventDefault();
    });
    dom.bind(this.__thumbnail, "mouseover", onMouseOver);
    dom.bind(this.__thumbnail, "mouseout", onMouseOut);
    dom.bind(this.__thumbnail, "mousedown", onMouseDown);
    dom.bind(this.__thumbnail, "dblclick", onDoubleClick);
    dom.bind(this.__thumbnail, "mousemove", onMouseMove);
    dom.bind(this.__thumbnail, "mouseup", onMouseUp);
    dom.bind(this.__thumbnail, "mouseup", onMouseUp);

    function toCoord(x, y) {
      return [rV.top + x * rV.width, rV.left + (1 - y) * rV.height];
    }
    function toNorm(elem, e) {
      var mouseX = e.pageX - elem.offsetLeft;
      var mouseY = e.pageY - elem.offsetTop;
      return [0 + (mouseX - rV.left + 1) / (rV.width - 2), 1 - (mouseY - rV.top - 2) / rV.height];
    }
    function moveTo(x, y) {
      _this.__ctx.moveTo(rV.top + x * rV.width, rV.left + (1 - y) * rV.height);
    }
    function lineTo(x, y) {
      _this.__ctx.lineTo(rV.top + x * rV.width, rV.left + (1 - y) * rV.height);
    }
    function curveTo(c1x, c1y, c2x, c2y, ax, ay) {
      _this.__ctx.bezierCurveTo(
        rV.top + c1x * rV.width,
        rV.left + (1 - c1y) * rV.height,
        rV.top + c2x * rV.width,
        rV.left + (1 - c2y) * rV.height,
        rV.top + ax * rV.width,
        rV.left + (1 - ay) * rV.height
      );
    }
    function beginPath() {
      _this.__ctx.beginPath();
    }
    function closePath() {
      _this.__ctx.closePath();
    }
    function stroke() {
      _this.__ctx.stroke();
    }
    function fill() {
      _this.__ctx.fill();
    }
    function circle(x, y, r) {
      var p = toCoord(x, y);
      _this.__ctx.arc(p[0], p[1], r, 0, Math.PI * 2);
    }
    function square(x, y, r) {
      var p = toCoord(x, y);
      _this.__ctx.rect(p[0] - r, p[1] - r, r * 2, r * 2);
    }

    // --- main ---
    this.clear = function() {
      _this.__ctx.clearRect(0, 0, width, height);
    };
    this.drawRuler = function() {
      var ctx = _this.__ctx;

      ctx.lineWidth = 1;
      ctx.strokeStyle = "#930";
      beginPath();
      moveTo(0, 0);
      lineTo(1, 0);
      moveTo(0, 1);
      lineTo(1, 1);
      stroke();

      for (var i = 0; i <= 4; i++) {
        var x = i / 4.01; // dirty hack
        ctx.strokeStyle = "#c97";
        beginPath();
        moveTo(x, 0);
        lineTo(x, -0.04);
        stroke();
        ctx.strokeStyle = "#333";
        beginPath();
        moveTo(x, 0.01);
        lineTo(x, 0.99);
        stroke();
      }

      ctx.font = "10px";
      ctx.fillStyle = "#977";
      p = toCoord(0, -0.17);
      ctx.fillText("0.0", p[0], p[1]);
      p = toCoord(0.25, -0.17);
      ctx.fillText(".25", p[0] - 8, p[1]);
      p = toCoord(0.5, -0.17);
      ctx.fillText(".50", p[0] - 8, p[1]);
      p = toCoord(0.75, -0.17);
      ctx.fillText(".75", p[0] - 8, p[1]);
      p = toCoord(1, -0.17);
      ctx.fillText("1.0", p[0] - 14, p[1]);
    };

    this.drawEasingFunction = function(easing_func) {
      var ctx = _this.__ctx;
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 1;

      beginPath();
      easing_func.getSegments().forEach(function(s, i) {
        moveTo.apply(null, s.slice(0, 2));
        curveTo.apply(null, s.slice(2));
      });
      stroke();

      // Display points and handles
      if (!_this.__mouse_over) {
        return;
      }

      ctx.fillStyle = "#fff";
      ctx.strokeStyle = "#f90";
      ctx.lineWidth = 2;
      easing_func.points.forEach(function(p, i) {
        if (_this.__mouseo_over && i == _this.__point_over) {
          return;
        }
        if (i == _this.__point_selected) {
          return;
        }
        beginPath();
        circle(p.x, p.y, 3);
        closePath();
        fill();
        stroke();
      });

      var p;
      if (Number.isInteger(_this.__point_over)) {
        p = easing_func.points[_this.__point_over];
        ctx.strokeStyle = "#f3d";
        beginPath();
        circle(p.x, p.y, 3);
        closePath();
        fill();
        stroke();
      }
      if (Number.isInteger(_this.__point_selected)) {
        p = easing_func.points[_this.__point_selected];
        ctx.strokeStyle = "#f3d";
        ctx.fillStyle = "#fff";

        // handle
        beginPath();
        moveTo(p.x + p.l + 0.01, p.y);
        lineTo(p.x + p.r - 0.01, p.y);
        stroke();

        // knobs
        ["l", "r"].forEach(function(dir) {
          beginPath();
          circle(p.x + p[dir], p.y, 2);
          fill();
          stroke();
        });

        // anchor
        beginPath();
        square(p.x, p.y, 3);
        fill();
        stroke();
      }
    };

    this.setCursor = function(x) {
      var y = _this.__func.calculateY(x);

      _this.__ctx.fillStyle = "#ff0";
      _this.__ctx.strokeStyle = "#ff0";
      _this.__ctx.lineWidth = 1;
      beginPath();
      circle(x, y, 3);
      closePath();
      fill();
      beginPath();
      moveTo(x, 0);
      lineTo(x, 1);
      closePath();
      stroke();

      return y;
    };

    function onMouseDown(e) {
      e.preventDefault();

      var coord = toNorm(this, e);
      var point, index, type;

      if (Number.isInteger(_this.__point_selected)) {
        point = _this.__func.findPointWithHandle(coord[0], coord[1]);
      } else {
        point = _this.__func.findPoint(coord[0], coord[1]);
      }
      //console.log(point);
      (index = point.index), (type = point.type);

      if (index !== undefined) {
        if (e.button == 2 && type == "ANCHOR") {
          // right click
          var delete_successful = _this.__func.deletePoint(index);
          if (delete_successful) {
            index = undefined;
          }
        }
      }

      if (index !== undefined) {
        if (_this.__point_selected == index) {
          _this.__point_selected_type = type; // we can select handle points
        } else {
          _this.__point_selected = index;
          _this.__point_selected_type = "ANCHOR"; // force the anchor point
        }

        _this.__point_moving = true;
      } else {
        _this.__point_selected = null;
        _this.__point_selected_type = null;
        _this.__point_moving = false;
      }

      _this.updateDisplay();
    }

    function onDoubleClick(e) {
      e.preventDefault();

      var coord = toNorm(this, e);
      var point = _this.__func.addPoint(coord[0], coord[1]);
      _this.__point_selected = point.index;
      _this.__point_selected_type = point.type;
      _this.__point_moving = true;

      _this.updateDisplay();
    }

    function onMouseOver(e) {
      _this.__mouse_over = true;
      _this.updateDisplay();
    }
    function onMouseOut(e) {
      _this.__mouse_over = false;
      _this.__point_moving = false;
      _this.updateDisplay();
    }
    function onMouseMove(e) {
      e.preventDefault();
      var coord = toNorm(this, e);

      if (Number.isInteger(_this.__point_selected) && _this.__point_moving) {
        _this.__func.movePoint(_this.__point_selected, _this.__point_selected_type, coord[0], coord[1]);
      } else {
        var index = _this.__func.findPoint(coord[0], coord[1]).index;
        if (index !== undefined) {
          _this.__point_over = index;
        } else {
          _this.__point_over = null;
        }
      }

      _this.updateDisplay();

      //setCursor(coord[0]);   // [DEBUG]
    }

    function onMouseUp(e) {
      e.preventDefault();
      _this.__point_moving = false;
      _this.updateDisplay();
    }

    common.extend(this.__thumbnail.style, {
      width: width + "px",
      height: height + "px",
      cursor: "crosshair"
      //cursor: 'ew-resize'
      //cursor: 'move'
    });

    // Acknowledge original value
    this.updateDisplay();

    this.domElement.appendChild(this.__thumbnail);
  };

  EasingFunctionController.superclass = Controller;

  common.extend(
    EasingFunctionController.prototype,
    Controller.prototype,

    {
      setValue: function(v) {
        var toReturn = EasingFunctionController.superclass.prototype.setValue.call(this, v);
        if (this.__onFinishChange) {
          this.__onFinishChange.call(this, this.getValue());
        }
        return toReturn;
      },

      updateDisplay: function() {
        //this.__select.value = this.getValue();
        this.clear();
        this.drawRuler();
        this.drawEasingFunction(this.__func);
      }
    }
  );

  return EasingFunctionController;
});
