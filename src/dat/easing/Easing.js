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

function clipFunc(min, max) {
  return function(v) {
    if (v < min) {
      return min;
    }
    if (v > max) {
      return max;
    }
    return v;
  };
}
const clip01 = clipFunc(0.0, 1.0);

// See http://pomax.github.io/bezierinfo/#explanation
function cubicFunc(a, b, c, d) {
  return function(t) {
    const t2 = t * t;
    const t3 = t2 * t;
    const mt = 1 - t;
    const mt2 = mt * mt;
    const mt3 = mt * mt2;
    return a * mt3 + 3 * b * mt2 * t + 3 * c * mt * t2 + d * t3;
  };
}
function cubicFuncDeriv(a, b, c, d) {
  return function(t) {
    const t2 = t * t;
    const mt = 1 - t;
    const mt2 = mt * mt;
    return a * mt2 + 2 * b * mt * t + c * t2;
  };
}

function sign(n) {
  return n >= 0.0 ? 1 : -1;
}

const EPSILON = 0.0001;

/**
 * EasingFunctionPoint constructor. The constructor argument can be:
 *
 * 1. numerical array/4 ordered x,y,l,r
 * 2. {x:..., y:..., l:..., r:...}
 *
 */
const EasingFunctionPoint = function(coord) {
  const _this = this;

  if (Array.isArray(coord) && coord.length == 4) {
    ["x", "y", "l", "r"].forEach(function(d, i) {
      _this[d] = coord[i];
    });
  } else if (typeof coord === "object") {
    ["x", "y", "l", "r"].forEach(function(d) {
      _this[d] = coord[d];
    });
  } else {
    throw new Error("Couldn't parse point arguments");
  }
};

/**
 * EasingFunction constructor.
 *
 * The constructor argument is array of EasingFunctionPoint or undefined.
 */
const EasingFunction = function(_points) {
  const rawPoints = _points || [
    {
      x: 0,
      y: 0,
      l: 0,
      r: 0.5
    },
    {
      x: 1,
      y: 1,
      l: 0.5,
      r: 0
    }
  ];
  const points = [];
  rawPoints.forEach(function(p) {
    points.push(new EasingFunctionPoint(p));
  });
  this.points = points;
};

EasingFunction.Point = EasingFunctionPoint;

EasingFunction.prototype = {
  toString: function() {
    return "something";
  },

  movePoint: function(index, type, x, y) {
    const p = this.points[index];

    if (type == "LEFT") {
      p.l = x - p.x;
    } else if (type == "RIGHT") {
      p.r = x - p.x;
    } else {
      // ANCHOR
      p.x = x;
      p.y = y;
    }

    this.constrainPoints();
  },
  constrainPoints: function() {
    let pl;
    let p;
    let pr;
    const _this = this;
    const last = function(i) {
      return i == _this.points.length - 1;
    };

    for (let i = 0; i < this.points.length; i++) {
      p = this.points[i];
      pl = i > 0 ? this.points[i - 1] : undefined;
      pr = !last(i) ? this.points[i + 1] : undefined;

      // anchor
      p.x = clip01(p.x);
      p.y = clip01(p.y);

      if (i == 0) {
        p.x = 0.0;
      }
      if (last(i)) {
        p.x = 1.0;
      }

      if (pr !== undefined && p.x > pr.x) {
        p.x = pr.x;
      }

      // left
      if (pl !== undefined) {
        p.l = clipFunc(pl.x - p.x, 0)(p.l);
      } else {
        p.l = 0;
      }

      // right
      if (pr !== undefined) {
        p.r = clipFunc(0, pr.x - p.x)(p.r);
      } else {
        p.r = 0;
      }
    }
  },
  findPoint: function(x, y, r) {
    r = r || 0.035; // [FIXME] magic number
    let dx;
    let dy;
    let h;
    let minD = Infinity;
    let minIndex;
    let type;

    this.points.forEach(function(p, i) {
      (dx = x - p.x), (dy = y - p.y);
      h = dx * dx + dy * dy;
      if (h < r * r && minD > h) {
        minD = h;
        minIndex = i;
      }
    });
    return {
      index: minIndex,
      type: Number.isInteger(minIndex) ? "ANCHOR" : undefined
    };
  },
  findPointWithHandle: function(x, y, r) {
    r = r || 0.035; // [FIXME] magic number
    let dx;
    let dy;
    let h;
    let minD = Infinity;
    let minIndex;
    let minType;
    let candidates;
    let d;
    let type;
    const _this = this;

    this.points.forEach(function(p, i) {
      if (i == 0) {
        candidates = [[p.r, "RIGHT"], [0.0, "ANCHOR"]];
      } else if (i == _this.points.length - 1) {
        candidates = [[p.l, "LEFT"], [0.0, "ANCHOR"]];
      } else {
        candidates = [[p.r, "RIGHT"], [p.l, "LEFT"], [0.0, "ANCHOR"]];
      }

      candidates.forEach(function(cand) {
        (d = cand[0]), (type = cand[1]);

        (dx = x - p.x - d), (dy = y - p.y);
        h = dx * dx + dy * dy;
        if (h < r * r && minD > h) {
          minD = h;
          minIndex = i;
          minType = type;
        }
      });
    });

    return { index: minIndex, type: minType };
  },
  addPoint: function(x, y) {
    for (var i = 1; i < this.points.length - 1; i++) {
      if (x <= this.points[i].x) {
        break;
      }
    }
    const point = new EasingFunctionPoint({
      x: x,
      y: y,
      l: 0.0,
      r: 0.0
    });
    this.points.splice(i, 0, point);
    this.constrainPoints();
    return point;
  },
  deletePoint: function(i) {
    if (i == 0 || i == this.points.length - 1) {
      return false;
    }
    this.points.splice(i, 1);
    return true;
  },

  getSegments: function() {
    const segments = [];
    let p1;
    let p2;
    for (let i = 0; i < this.points.length - 1; i++) {
      p1 = this.points[i];
      p2 = this.points[i + 1];

      segments.push([
        p1.x,
        p1.y, // anchor point 1
        p1.x + p1.r,
        p1.y, // control point 1
        p2.x + p2.l,
        p2.y, // control point 2
        p2.x,
        p2.y // anchor point 2
      ]);
    }
    return segments;
  },
  getSegmentByX: function(x) {
    let p1;
    let p2;
    for (var i = 1; i < this.points.length - 1; i++) {
      if (x <= this.points[i].x) {
        break;
      }
    }
    p1 = this.points[i - 1];
    p2 = this.points[i];
    return [p1.x, p1.y, p1.x + p1.r, p1.y, p2.x + p2.l, p2.y, p2.x, p2.y];
  },

  calculateY: function(x) {
    x = clip01(x);
    if (x < EPSILON) {
      x = EPSILON;
    }

    const segment = this.getSegmentByX(x);
    const funcX = cubicFunc(segment[0], segment[2], segment[4], segment[6]);
    const funcY = cubicFunc(segment[1], segment[3], segment[5], segment[7]);
    const derivX = cubicFuncDeriv(segment[0], segment[2], segment[4], segment[6]);

    // Newton's method
    let t = 0.5; // initial
    let dt;
    let slope;
    for (var i = 0; i < 20; i++) {
      dt = funcX(t) - x;
      if (Math.abs(dt) < EPSILON) {
        return funcY(clip01(t));
      }
      slope = derivX(t);
      t -= dt / slope;
    }

    // Newton's method failed. Then we use bisection method instead
    const funcXd = function(t) {
      return funcX(t) - x;
    };
    let t1 = 0.0;
    let t2 = 1.0;
    const st1 = sign(funcXd(t1));
    const st2 = sign(funcXd(t2));
    let st;
    let diff;

    for (var i = 0; i < 30; i++) {
      t = (t1 + t2) / 2;
      diff = funcXd(t);
      if (Math.abs(diff) < EPSILON) {
        return funcY(t);
      }

      st = sign(diff);
      if (st == st1) {
        t1 = t;
      } else if (st == st2) {
        t2 = t;
      }
    }
    return funcY(t);
  }
};

export default EasingFunction;
