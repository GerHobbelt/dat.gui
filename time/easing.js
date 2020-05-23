//
// OBSOLETE STUFF?
//
// old v0.4 code which needs to be integrated or otherwise thrown away
//

let GUI = {};
GUI.Easing = {};

GUI.Easing.Linear = function (k) {
  return k;
};

GUI.Easing.Hold = function (k) {
  return 0;
};

GUI.Easing.QuadraticEaseIn = function (k) {
  return k * k;
};

GUI.Easing.QuadraticEaseOut = function (k) {
  return -k * (k - 2);
};

GUI.Easing.QuadraticEaseInOut = function (k) {
  if ((k *= 2) < 1) return 0.5 * k * k;
  return -0.5 * (--k * (k - 2) - 1);
};

GUI.Easing.CubicEaseIn = function (k) {
  return k * k * k;
};

GUI.Easing.CubicEaseOut = function (k) {
  return --k * k * k + 1;
};

GUI.Easing.CubicEaseInOut = function (k) {
  if ((k *= 2) < 1) return 0.5 * k * k * k;
  return 0.5 * ((k -= 2) * k * k + 2);
};

GUI.Easing.QuarticEaseIn = function (k) {
  return k * k * k * k;
};

GUI.Easing.QuarticEaseOut = function (k) {
  return -(--k * k * k * k - 1);
};

GUI.Easing.QuarticEaseInOut = function (k) {
  if ((k *= 2) < 1) return 0.5 * k * k * k * k;
  return -0.5 * ((k -= 2) * k * k * k - 2);
};

//

GUI.Easing.QuinticEaseIn = function (k) {
  return k * k * k * k * k;
};

GUI.Easing.QuinticEaseOut = function (k) {
  return (k = k - 1) * k * k * k * k + 1;
};

GUI.Easing.QuinticEaseInOut = function (k) {
  if ((k *= 2) < 1) return 0.5 * k * k * k * k * k;
  return 0.5 * ((k -= 2) * k * k * k * k + 2);
};

GUI.Easing.SinusoidalEaseIn = function (k) {
  return -Math.cos((k * Math.PI) / 2) + 1;
};

GUI.Easing.SinusoidalEaseOut = function (k) {
  return Math.sin((k * Math.PI) / 2);
};

GUI.Easing.SinusoidalEaseInOut = function (k) {
  return -0.5 * (Math.cos(Math.PI * k) - 1);
};

GUI.Easing.ExponentialEaseIn = function (k) {
  return k == 0 ? 0 : Math.pow(2, 10 * (k - 1));
};

GUI.Easing.ExponentialEaseOut = function (k) {
  return k == 1 ? 1 : -Math.pow(2, -10 * k) + 1;
};

GUI.Easing.ExponentialEaseInOut = function (k) {
  if (k == 0) return 0;
  if (k == 1) return 1;
  if ((k *= 2) < 1) return 0.5 * Math.pow(2, 10 * (k - 1));
  return 0.5 * (-Math.pow(2, -10 * (k - 1)) + 2);
};

GUI.Easing.CircularEaseIn = function (k) {
  return -(Math.sqrt(1 - k * k) - 1);
};

GUI.Easing.CircularEaseOut = function (k) {
  return Math.sqrt(1 - --k * k);
};

GUI.Easing.CircularEaseInOut = function (k) {
  if ((k /= 0.5) < 1) return -0.5 * (Math.sqrt(1 - k * k) - 1);
  return 0.5 * (Math.sqrt(1 - (k -= 2) * k) + 1);
};

GUI.Easing.ElasticEaseIn = function (k) {
  var s;
  var a = 0.1;
  var p = 0.4;
  if (k == 0) return 0;
  if (k == 1) return 1;
  if (!p) p = 0.3;
  if (!a || a < 1) {
    a = 1;
    s = p / 4;
  } else s = (p / (2 * Math.PI)) * Math.asin(1 / a);
  return -(a * Math.pow(2, 10 * (k -= 1)) * Math.sin(((k - s) * (2 * Math.PI)) / p));
};

GUI.Easing.ElasticEaseOut = function (k) {
  var s;
  var a = 0.1;
  var p = 0.4;
  if (k == 0) return 0;
  if (k == 1) return 1;
  if (!p) p = 0.3;
  if (!a || a < 1) {
    a = 1;
    s = p / 4;
  } else s = (p / (2 * Math.PI)) * Math.asin(1 / a);
  return a * Math.pow(2, -10 * k) * Math.sin(((k - s) * (2 * Math.PI)) / p) + 1;
};

GUI.Easing.ElasticEaseInOut = function (k) {
  var s;
  var a = 0.1;
  var p = 0.4;
  if (k == 0) return 0;
  if (k == 1) return 1;
  if (!p) p = 0.3;
  if (!a || a < 1) {
    a = 1;
    s = p / 4;
  } else s = (p / (2 * Math.PI)) * Math.asin(1 / a);
  if ((k *= 2) < 1) return -0.5 * (a * Math.pow(2, 10 * (k -= 1)) * Math.sin(((k - s) * (2 * Math.PI)) / p));
  return a * Math.pow(2, -10 * (k -= 1)) * Math.sin(((k - s) * (2 * Math.PI)) / p) * 0.5 + 1;
};

GUI.Easing.BackEaseIn = function (k) {
  var s = 1.70158;
  return k * k * ((s + 1) * k - s);
};

GUI.Easing.BackEaseOut = function (k) {
  var s = 1.70158;
  return (k = k - 1) * k * ((s + 1) * k + s) + 1;
};

GUI.Easing.BackEaseInOut = function (k) {
  var s = 1.70158 * 1.525;
  if ((k *= 2) < 1) return 0.5 * (k * k * ((s + 1) * k - s));
  return 0.5 * ((k -= 2) * k * ((s + 1) * k + s) + 2);
};

GUI.Easing.BounceEaseIn = function (k) {
  return 1 - GUI.Easing.BounceEaseOut(1 - k);
};

GUI.Easing.BounceEaseOut = function (k) {
  if ((k /= 1) < 1 / 2.75) {
    return 7.5625 * k * k;
  } else if (k < 2 / 2.75) {
    return 7.5625 * (k -= 1.5 / 2.75) * k + 0.75;
  } else if (k < 2.5 / 2.75) {
    return 7.5625 * (k -= 2.25 / 2.75) * k + 0.9375;
  } else {
    return 7.5625 * (k -= 2.625 / 2.75) * k + 0.984375;
  }
};

GUI.Easing.BounceEaseInOut = function (k) {
  if (k < 0.5) return GUI.Easing.BounceEaseIn(k * 2) * 0.5;
  return GUI.Easing.BounceEaseOut(k * 2 - 1) * 0.5 + 0.5;
};

export default GUI.Easing;
