define("requireLib", function () {});

define("dat/utils/css", {
    link: function (f, a) {
        a = a || document;
        var c = a.createElement("link");
        c.type = "text/css";
        c.rel = "stylesheet";
        c.setAttribute("href", f);
        var d = a.getElementsByTagName("head")[0];
        c.disable = function () {
            d.removeChild(c)
        };
        var e = function () {};
        c.onLoad = function (a) {
            e = a
        };
        (function (a) {
            document.styleSheets.length != a ? e() : setTimeout(
                arguments.callee, 20)
        })(document.styleSheets.length);
        d.appendChild(c);
        return c
    },
    inject: function (f, a) {
        a = a || document;
        var c = a.createElement("style");
        c.type = "text/css";
        c.innerHTML =
            f;
        var d = a.getElementsByTagName("head")[0];
        d.disable = function () {
            d.removeChild(c)
        };
        d.appendChild(c);
        return c
    }
});

define("dat/utils/requestAnimationFrame", [], function () {
    return window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
        function (f, a) {
            window.setTimeout(f, 1E3 / 60);
        }
});

define("dat/events/Events", {
    bind: function (f, a) {
        for (var c = f.split(" "), d = 0, e = c.length; d < e; d++) f = c[d],
            this._callbacks || (this._callbacks = {}), (this._callbacks[f] ||
                (this._callbacks[f] = []))
            .push(a);
        return this
    },
    unbind: function (f, a) {
        var c;
        if (!f) this._callbacks = {};
        else if (c = this._callbacks)
            if (a) {
                c = c[f];
                if (!c) return this;
                for (var d = 0, e = c.length; d < e; d++)
                    if (a === c[d]) {
                        c.splice(d, 1);
                        break
                    }
            } else c[f] = [];
        return this
    },
    trigger: function (f) {
        var a, c, d, e;
        if (!(c = this._callbacks)) return this;
        if (a = c[f])
            for (d = 0, e = a.length; d <
                e; d++) a[d].apply(this, Array.prototype.slice.call(
                arguments, 1));
        if (a = c.all)
            for (d = 0, e = a.length; d < e; d++) a[d].apply(this,
                arguments);
        return this
    }
});

define("dat/utils/common", [], function () {
    var f = Array.prototype.forEach,
        a = Array.prototype.slice;
    return {
        BREAK: {},
        extend: function (c) {
            this.each(a.call(arguments, 1), function (a) {
                for (var e in a) this.isUndefined(a[e]) || (c[e] = a[e])
            }, this);
            return c
        },
        defaults: function (c) {
            this.each(a.call(arguments, 1), function (a) {
                for (var e in a) this.isUndefined(c[e]) && (c[e] = a[e])
            }, this);
            return c
        },
        compose: function () {
            var c = a.call(arguments);
            return function () {
                for (var d = a.call(arguments), e = c.length - 1; 0 <=
                    e; e--) d = [c[e].apply(this, d)];
                return d[0]
            }
        },
        each: function (a, d, e) {
            if (f && a.forEach === f) a.forEach(d, e);
            else if (a.length === a.length + 0)
                for (var b = 0, l = a.length; b < l && !(b in a && d.call(e,
                    a[b], b) === this.BREAK); b++);
            else
                for (b in a)
                    if (d.call(e, a[b], b) === this.BREAK) break
        },
        defer: function (a) {
            setTimeout(a, 0)
        },
        identity: function (a) {
            return a
        },
        toArray: function (c) {
            return c.toArray ? c.toArray() : a.call(c)
        },
        isUndefined: function (a) {
            return void 0 === a
        },
        isNull: function (a) {
            return null === a
        },
        isNaN: function (a) {
            return a !== a
        },
        isArray: Array.isArray || function (a) {
            return a.constructor ===
                Array
        },
        isObject: function (a) {
            return a === Object(a)
        },
        isNumber: function (a) {
            return a === a + 0
        },
        isString: function (a) {
            return a === a + ""
        },
        isBoolean: function (a) {
            return !1 === a || !0 === a
        },
        isFunction: function (a) {
            return "[object Function]" === Object.prototype.toString.call(a)
        }
    }
});
define("dat/dom/dom", ["dat/utils/common"], function (f) {
    function a(a) {
        if ("0" === a || f.isUndefined(a)) return 0;
        a = a.match(b);
        return f.isNull(a) ? 0 : parseFloat(a[1])
    }
    var c = {
            mouseenter: "mouseover",
            mouseleave: "mouseout"
        },
        d = {},
        e = {};
    f.each({
        HTMLEvents: ["change"],
        MouseEvents: ["click", "mousemove", "mousedown", "mouseup",
            "mouseover"
        ],
        KeyboardEvents: ["keydown"]
    }, function (a, b) {
        f.each(a, function (a) {
            e[a] = b
        })
    });
    var b = /(-?\d+(\.\d+)?)px/,
        l = {
            makeSelectable: function (a, b) {
                if (void 0 !== a && void 0 !== a.style) {
                    a.onselectstart = b ?
                        function () {
                            return !1
                    } : function () {};
                    var c = b ? "auto" : "none";
                    a.style.MozUserSelect = c;
                    a.style.KhtmlUserSelect = c;
                    a.style.webkitUserSelect = c;
                    a.style.msUserSelect = c;
                    a.unselectable = b ? "on" : "off";
                    return l
                }
            },
            makeFullscreen: function (a, b, c) {
                f.isUndefined(b) && (b = !0);
                f.isUndefined(c) && (c = !0);
                a.style.position = "absolute";
                b && (a.style.left = 0, a.style.right = 0);
                c && (a.style.top = 0, a.style.bottom = 0);
                return l
            },
            fakeEvent: function (a, b, c, d) {
                c = c || {};
                var t = e[b];
                if (!t) throw Error("Event type " + b + " not supported.");
                var h = document.createEvent(t);
                switch (t) {
                case "MouseEvents":
                    h.initMouseEvent(b, c.bubbles || !1, c.cancelable || !0,
                        window, c.clickCount || 1, 0, 0, c.x || c.clientX ||
                        0, c.y || c.clientY || 0, !1, !1, !1, !1, 0, null);
                    break;
                case "KeyboardEvents":
                    t = h.initKeyboardEvent || h.initKeyEvent;
                    f.defaults(c, {
                        cancelable: !0,
                        ctrlKey: !1,
                        altKey: !1,
                        shiftKey: !1,
                        metaKey: !1,
                        keyCode: void 0,
                        charCode: void 0
                    });
                    t(b, c.bubbles || !1, c.cancelable, window, c.ctrlKey,
                        c.altKey, c.shiftKey, c.metaKey, c.keyCode, c.charCode
                    );
                    break;
                default:
                    h.initEvent(b, c.bubbles || !1, c.cancelable || !0)
                }
                f.defaults(h,
                    d);
                a.dispatchEvent(h)
            },
            bind: function (a, b, e, f) {
                if (a) {
                    if (b in c) {
                        var t = e;
                        b = c[b];
                        e = function (a) {
                            var b = a.relatedTarget;
                            b && (b === this || l.contains(this, b)) || t.call(
                                this, a)
                        };
                        d[t] = e
                    }
                    a.addEventListener ? a.addEventListener(b, e, !!f) : a.attachEvent &&
                        a.attachEvent("on" + b, e);
                    return l
                }
            },
            makeBinding: function () {
                var a = f.toArray(arguments);
                return {
                    unbind: function () {
                        l.unbind.apply(this, a);
                        return this
                    },
                    bind: function () {
                        l.bind.apply(this, a);
                        return this
                    },
                    addTo: function (a) {
                        a.push(this);
                        return this
                    },
                    context: function (b) {
                        var c = a[2];
                        a[2] = function () {
                            c.apply(b, arguments)
                        };
                        return this
                    }
                }
            },
            unbind: function (a, b, e, x) {
                if (a) {
                    if (b in c) {
                        b = c[b];
                        var t = d[e];
                        f.isFunction(t) && (e = t, delete d[e])
                    }
                    a.removeEventListener ? a.removeEventListener(b, e, !!x) :
                        a.detachEvent && a.detachEvent("on" + b, e);
                    return l
                }
            },
            addClass: function (a, b) {
                if (void 0 === a.className) a.className = b;
                else if (a.className !== b) {
                    var c = a.className.split(/ +/); - 1 == c.indexOf(b) &&
                        (c.push(b), a.className = c.join(" ")
                        .replace(/^\s+/, "")
                        .replace(/\s+$/, ""))
                }
                return l
            },
            removeClass: function (a, b) {
                if (b) {
                    if (void 0 !==
                        a.className)
                        if (a.className === b) a.removeAttribute("class");
                        else {
                            var c = a.className.split(/ +/),
                                d = c.indexOf(b); - 1 != d && (c.splice(d,
                                1), a.className = c.join(" "))
                        }
                } else a.className = void 0;
                return l
            },
            getClasses: function (a) {
                return a.className.split(" ")
            },
            hasClass: function (a, b) {
                return _.isElement(a) ? RegExp("(?:^|\\s+)" + b +
                        "(?:\\s+|$)")
                    .test(a.className) || !1 : !1
            },
            contains: function (a, b) {
                for (var c = b.parentNode; null !== c;) {
                    if (c === a) return !0;
                    c = c.parentNode
                }
                return !1
            },
            getParent: function (a) {
                return a.parentElement ? a.parentElement :
                    a.parentNode
            },
            getRect: function (b, c) {
                var d;
                if (b.getBoundingClientRect) d = b.getBoundingClientRect();
                else {
                    d = this.getOffset(b);
                    var e = this.getWidth(b),
                        t = this.getHeight(b)
                } if (c) {
                    var h = getComputedStyle(b),
                        k = a(h["margin-top"] || h.marginTop),
                        h = a(h["margin-left"] || h.marginLeft);
                    d.top -= k;
                    d.left -= h
                }
                _.extend(d, {
                    right: d.left + e,
                    bottom: d.top + t,
                    width: e,
                    height: t
                });
                return d
            },
            getWidth: function (b) {
                if (b === window) return "innerWidth" in window ? window.innerWidth :
                    document.documentElement.offsetWidth;
                if (b === document) return Math.max(document.documentElement
                    .clientWidth,
                    document.body.scrollWidth, document.documentElement
                    .scrollWidth, document.body.offsetWidth,
                    document.documentElement.offsetWidth);
                b = getComputedStyle(b);
                return a(b["border-left-width"] || b.borderLeftWidth) + a(b[
                    "border-right-width"] || b.borderRightWidth) + a(b[
                    "padding-left"] || b.paddingLeft) + a(b[
                    "padding-right"] || b.paddingRight) + a(b.width)
            },
            getHeight: function (b) {
                if (b === window) return "innerHeight" in window ? window.innerHeight :
                    document.documentElement.offsetHeight;
                if (b === document) return Math.max(document.documentElement
                    .clientHeight,
                    document.body.scrollHeight, document.documentElement
                    .scrollHeight, document.body.offsetHeight,
                    document.documentElement.offsetHeight);
                b = getComputedStyle(b);
                return a(b["border-top-width"] || b.borderTopWidth) + a(b[
                    "border-bottom-width"] || b.borderBottomWidth) + a(
                    b["padding-top"] || b.paddingTop) + a(b[
                    "padding-bottom"] || b.paddingBottom) + a(b.height)
            },
            getOffset: function (a) {
                var b = {
                    left: 0,
                    top: 0
                };
                if (a.offsetParent) {
                    do b.left += a.offsetLeft, b.top += a.offsetTop; while (
                        a = a.offsetParent)
                }
                return b
            },
            isActive: function (a) {
                return a ===
                    document.activeElement && (a.type || a.href)
            }
        };
    return l
});
(function () {
    var f = ["Msxml2.XMLHTTP", "Microsoft.XMLHTTP", "Msxml2.XMLHTTP.4.0"],
        a = /^\s*<\?xml(\s)+version=[\'\"](\d)*.(\d)*[\'\"](\s)*\?>/im,
        c = /<body[^>]*>\s*([\s\S]+)\s*<\/body>/im,
        d = "undefined" !== typeof location && location.href,
        e = d && location.protocol && location.protocol.replace(/\:/, ""),
        b = d && location.hostname,
        l = d && (location.port || void 0),
        p = [];
    define("text", [], function () {
        var q, w, x;
        "undefined" !== typeof window && window.navigator && window.document ?
            w = function (a, b) {
                var c = q.createXhr();
                c.open("GET", a, !0);
                c.onreadystatechange =
                    function (a) {
                        4 === c.readyState && b(c.responseText)
                };
                c.send(null)
        } : "undefined" !== typeof process && process.versions &&
            process.versions.node ? (x = require.nodeRequire("fs"), w =
                function (a, b) {
                    b(x.readFileSync(a, "utf8"))
                }) : "undefined" !== typeof Packages && (w = function (
                a, b) {
                var c = new java.io.File(a),
                    d = java.lang.System.getProperty(
                        "line.separator"),
                    c = new java.io.BufferedReader(new java.io.InputStreamReader(
                        new java.io.FileInputStream(c), "utf-8"
                    )),
                    e, l, f = "";
                try {
                    e = new java.lang.StringBuffer;
                    (l = c.readLine()) && l.length() &&
                        65279 === l.charAt(0) && (l = l.substring(1));
                    for (e.append(l); null !== (l = c.readLine());)
                        e.append(d), e.append(l);
                    f = String(e.toString())
                } finally {
                    c.close()
                }
                b(f)
            });
        return q = {
            version: "1.0.0",
            strip: function (b) {
                if (b) {
                    b = b.replace(a, "");
                    var d = b.match(c);
                    d && (b = d[1])
                } else b = "";
                return b
            },
            jsEscape: function (a) {
                return a.replace(/(['\\])/g, "\\$1")
                    .replace(/[\f]/g, "\\f")
                    .replace(/[\b]/g, "\\b")
                    .replace(/[\n]/g, "\\n")
                    .replace(/[\t]/g, "\\t")
                    .replace(/[\r]/g, "\\r")
            },
            createXhr: function () {
                var a, b, c;
                if ("undefined" !== typeof XMLHttpRequest) return
                new XMLHttpRequest;
                for (b = 0; 3 > b; b++) {
                    c = f[b];
                    try {
                        a = new ActiveXObject(c)
                    } catch (d) {}
                    if (a) {
                        f = [c];
                        break
                    }
                }
                if (!a) throw Error(
                    "createXhr(): XMLHttpRequest not available"
                );
                return a
            },
            get: w,
            parseName: function (a) {
                var b = !1,
                    c = a.indexOf("."),
                    d = a.substring(0, c);
                a = a.substring(c + 1, a.length);
                c = a.indexOf("!"); - 1 !== c && (b = a.substring(c +
                    1, a.length), b = "strip" === b, a = a.substring(
                    0, c));
                return {
                    moduleName: d,
                    ext: a,
                    strip: b
                }
            },
            xdRegExp: /^((\w+)\:)?\/\/([^\/\\]+)/,
            useXhr: function (a, b, c, d) {
                var e = q.xdRegExp.exec(a),
                    l;
                if (!e) return !0;
                a = e[2];
                e = e[3];
                e = e.split(":");
                l = e[1];
                e = e[0];
                return (!a || a === b) && (!e || e === c) && (!l &&
                    !e || l === d)
            },
            finishLoad: function (a, b, c, d, e) {
                c = b ? q.strip(c) : c;
                e.isBuild && e.inlineText && (p[a] = c);
                d(c)
            },
            load: function (a, c, k, f) {
                var x = q.parseName(a),
                    p = x.moduleName + "." + x.ext,
                    w = c.toUrl(p),
                    E = f && f.text && f.text.useXhr || q.useXhr;
                !d || E(w, e, b, l) ? q.get(w, function (b) {
                    q.finishLoad(a, x.strip, b, k, f)
                }) : c([p], function (a) {
                    q.finishLoad(x.moduleName + "." + x.ext, x.strip,
                        a, k, f)
                })
            },
            write: function (a, b, c, d) {
                b in p && (d = q.jsEscape(p[b]), c.asModule(a + "!" +
                    b, "define(function () { return '" +
                    d + "';});\n"))
            },
            writeFile: function (a, b, c, d, e) {
                b = q.parseName(b);
                var l = b.moduleName + "." + b.ext,
                    f = c.toUrl(b.moduleName + "." + b.ext) + ".js";
                q.load(l, c, function (b) {
                    b = function (a) {
                        return d(f, a)
                    };
                    b.asModule = function (a, b) {
                        return d.asModule(a, f, b)
                    };
                    q.write(a, l, b, e)
                }, e)
            }
        }
    })
})();

define("text!examples/gui/contents.html", [], function () {
    return "<!DOCTYPE html>\n<html>\n<head>\n  <title></title>\n  <link rel=\"stylesheet\" href=\"../../css/examples.css\"/>\n  <script type=\"text/javascript\" src=\"../../third-party/prettify.js\">\x3c/script>\n</head>\n<body onload=\"prettyPrint()\">\n\n<article>\n\n  <h1>1. Basic Usage</h1>\n\n  <p>With very little code, dat.GUI creates an interface that you can use\n    to modify variables.</p>\n\n  <pre class=\"prettyprint lang-js\">&lt;script type=&quot;text/javascript&quot; src=&quot;dat.gui.js&quot;&gt;&lt;/script&gt;\n&lt;script type=&quot;text/javascript&quot;&gt;\n    \nvar FizzyText = function() {\n  this.message = 'dat.gui';\n  this.speed = 0.8;\n  this.displayOutline = false;\n  this.explode = function() { ... };\n  // Define render logic ...\n};\n\nwindow.onload = function() {\n  var text = new FizzyText();\n  var gui = new dat.GUI();\n  gui.add(text, 'message');\n  gui.add(text, 'speed', -5, 5);\n  gui.add(text, 'displayOutline');\n  gui.add(text, 'explode');\n};\n    \n&lt;/script&gt;</pre>\n\n  <ul>\n    <li>The property must be public, i.e. defined by <code class=\"prettyprint lang-js\">this.prop = value</code></li>\n    <li>dat.GUI determines controller type based on a property's initial value</li>\n    <li>Press H to show/hide all GUI's.</li>\n  </ul>\n\n</article>\n\n<article>\n  <h1>2. Constraining Input</h1>\n\n  <p>You can specify limits on numbers. A number with a min and max value becomes a slider. </p>\n\n  <pre class=\"prettyprint rag-top rag-bottom lang-js\">gui.add(text, 'noiseStrength').step(5); // Increment amount\ngui.add(text, 'growthSpeed', -5, 5); // Min and max\ngui.add(text, 'maxSize').min(0).step(0.25); // Mix and match</pre>\n\n  <p>You can also choose to select from a dropdown of values for both numbers\n    and strings.</p>\n\n  <pre class=\"prettyprint rag-top rag-bottom lang-js\">\n// Choose from accepted values\ngui.add(text, 'message', [ 'pizza', 'chrome', 'hooray' ] );\n\n// Choose from named values\ngui.add(text, 'speed', { Stopped: 0, Slow: 0.1, Fast: 5 } );</pre>\n\n</article>\n\n<article>\n  <h1>3. Folders</h1>\n\n  <p>You can nest as many GUI's as you please. Nested GUI's act as collapsible folders.</p>\n\n  <pre class=\"prettyprint  rag-top rag-bottom lang-js\">var gui = new dat.GUI();\n\nvar f1 = gui.addFolder('Flow Field');\nf1.add(text, 'speed');\nf1.add(text, 'noiseStrength');\n\nvar f2 = gui.addFolder('Letters');\nf2.add(text, 'growthSpeed');\nf2.add(text, 'maxSize');\nf2.add(text, 'message');\n\nf2.open();</pre>\n\n</article>\n\n\n<article>\n  <h1>4. Color Controllers</h1>\n\n  <p><code>dat.GUI</code> has a color selector and understands many\n    different representations of color. The following creates color\n    controllers for color variables of different formats.</p>\n\n  <pre class=\"prettyprint rag-top rag-bottom lang-js\">var FizzyText = function() {\n\n  this.color0 = \"#ffae23\"; // CSS string\n  this.color1 = [ 0, 128, 255 ]; // RGB array\n  this.color2 = [ 0, 128, 255, 0.3 ]; // RGB with alpha\n  this.color3 = { h: 350, s: 0.9, v: 0.3 }; // Hue, saturation, value\n\n  // Define render logic ...\n\n};\n\nwindow.onload = function() {\n\n  var text = new FizzyText();\n  var gui = new dat.GUI();\n\n  gui.addColor(text, 'color0');\n  gui.addColor(text, 'color1');\n  gui.addColor(text, 'color2');\n  gui.addColor(text, 'color3');\n\n};</pre>\n\n  <p><code>dat.GUI</code> will modify colors in the format defined by their\n    initial value. </p>\n\n</article>\n\n<article>\n  <h1>5. Saving Values</h1>\n\n  <p>Add a save menu to the GUI interface by calling <code>gui.remember</code>\n    on all the objects you've added to the GUI.</p>\n\n  <pre class=\"prettyprint rag-bottom lang-js\">var fizzyText = new FizzyText();\nvar gui = new dat.GUI();\n\ngui.remember(fizzyText);\n\n// Add controllers ...</pre>\n\n  <p>Click the <span id=\"save-icon\"> </span> icon to change your save settings. You can either save your\n    GUI's values to <code>localStorage</code>, or by copying and pasting a JSON\n    object into your source code as follows:</p>\n\n  <pre class=\"prettyprint rag-bottom lang-js\">var fizzyText = new FizzyText();\nvar gui = new dat.GUI({ load: JSON });\n\ngui.remember(fizzyText);\n\n// Add controllers ...</pre>\n\n</article>\n\n<article>\n  <h1>6. Presets</h1>\n\n  <p>The save menu also allows you to save all of your settings as presets.\n    Click <strong>Save</strong> to modify the current preset, or <strong>New</strong> to create a new\n    preset from existing settings. Clicking <strong>Revert</strong> will clear all unsaved changes to the current preset.</p>\n\n  <p>Switch between presets using the dropdown in the save menu. You can specify\n    the default preset as follows:</p>\n\n  <pre class=\"prettyprint rag-top rag-bottom lang-js\">var gui = new dat.GUI({\n  load: JSON,\n  preset: 'Flow'\n});</pre>\n\n  <p class=\"caution\">A word of caution about <code>localStorage</code>:</p><p>Paste the JSON save object into your source frequently. Using <code>localStorage</code> to save presets can make you faster, but its easy to lose your settings by clearing browsing data, changing browsers, or even by changing the URL of the page you're working on.</p>\n\n  \x3c!-- <p>These functions can also be triggered programmatically.</p> --\x3e\n\n  \x3c!-- <pre>\n        gui.save(); // Modify current settings\n        gui.saveAs('New Preset Name'); // New preset\n      </pre> --\x3e\n\n</article>\n\n<article>\n  <h1>7. Events</h1>\n\n  <p>You can listen for events on individual controllers using an event listener\n    syntax.</p>\n\n  <pre class=\"prettyprint rag-top rag-bottom lang-js\">var controller = gui.add(fizzyText, 'maxSize', 0, 10);\n\ncontroller.onChange(function(value) {\n  // Fires on every change, drag, keypress, etc.\n});\n\ncontroller.onFinishChange(function(value) {\n  // Fires when a controller loses focus.\n  alert(\"The new value is \" + value);\n});</pre>\n</p>\n</article>\n\n<article>\n  <h1>8. Custom Placement</h1>\n\n  <p>By default, dat.GUI panels are created with fixed position, and are\n    automatically appended to a DOM Element of dat.GUI's creation.</p>\n\n  <p>You can change this behavior by setting the <code>autoPlace</code>\n    parameter to <code>false</code>.\n\n    <pre class=\"prettyprint rag-bottom lang-js\">var gui = new dat.GUI({ autoPlace: false });\n\nvar customContainer = document.getElementById('my-gui-container');\ncustomContainer.appendChild(gui.domElement);</pre>\n\n\n</article>\n\n<article>\n  <h1>9. Updating the Display Automatically</h1>\n\n  <p>If you'd like controllers to react to changes made outside of the GUI, use\n    the <code>listen</code> method.\n  <pre class=\"prettyprint rag-top rag-bottom lang-js\">var fizzyText = new FizzyText();\nvar gui = new dat.GUI();\n\ngui.add(fizzyText, 'noiseStrength', 0, 100).listen();\n\nvar update = function() {\n  requestAnimationFrame(update);\n  fizzyText.noiseStrength = Math.random();\n};\n\nupdate();</pre>\n  <p>Calling <code>listen</code> on a controller adds it to an internal interval\n    of dat.GUI's creation. This interval checks for changes to a property's\n    value every frame, so if reading that property is expensive, this can be\n    very slow.</p>\n</article>\n\n<article>\n  <h1>10. Updating the Display Manually</h1>\n\n  <p>If you'd like to update controllers in a loop of your own definition, use\n    the <code>updateDisplay</code> method.</p>\n  <pre class=\"prettyprint rag-top rag-bottom lang-js\">var fizzyText = new FizzyText();\nvar gui = new dat.GUI();\n\ngui.add(fizzyText, 'noiseStrength', 0, 100);\n\nvar update = function() {\n\n  requestAnimationFrame(update);\n  fizzyText.noiseStrength = Math.cos(Date.getTime());\n\n  // Iterate over all controllers\n  for (var i in gui.__controllers) {\n    gui.__controllers[i].updateDisplay();\n  }\n\n};\n\nupdate();</pre>\n\n</article>\n</body>\n</html>"
});
define("text!dat/slides/style.css", [], function () {
    return ".dat-slides-container {\n  overflow: hidden; }\n  .dat-slides-container.auto-ui {\n    padding-top: 42px; }\n  .dat-slides-container ul.slides {\n    /* transitions */\n    -webkit-transition: all 350ms cubic-bezier(0.785, 0.135, 0.15, 0.86);\n    -moz-transition: all 350ms cubic-bezier(0.785, 0.135, 0.15, 0.86);\n    -ms-transition: all 350ms cubic-bezier(0.785, 0.135, 0.15, 0.86);\n    -o-transition: all 350ms cubic-bezier(0.785, 0.135, 0.15, 0.86);\n    transition: all 350ms cubic-bezier(0.785, 0.135, 0.15, 0.86);\n    height: 100%;\n    padding: 0 !important;\n    margin: 0;\n    position: relative; }\n    .dat-slides-container ul.slides > li {\n      display: inline-block;\n      position: relative;\n      padding: 0;\n      vertical-align: top; }\n    .dat-slides-container ul.slides.resize {\n      -webkit-transition: all 0ms cubic-bezier(0.785, 0.135, 0.15, 0.86);\n      -moz-transition: all 0ms cubic-bezier(0.785, 0.135, 0.15, 0.86);\n      -ms-transition: all 0ms cubic-bezier(0.785, 0.135, 0.15, 0.86);\n      -o-transition: all 0ms cubic-bezier(0.785, 0.135, 0.15, 0.86);\n      transition: all 0ms cubic-bezier(0.785, 0.135, 0.15, 0.86); }\n  .dat-slides-container .navigation-container {\n    font-family: 'Terminal Dosis', sans-serif;\n    position: fixed;\n    top: 0;\n    right: 0;\n    left: 0;\n    background: #000; }\n    .dat-slides-container .navigation-container ul.navigation {\n      height: 42px;\n      line-height: 42px;\n      width: 100%;\n      margin: 0 auto;\n      padding: 0;\n      position: relative; }\n      .dat-slides-container .navigation-container ul.navigation > li:first-child {\n        border: 0;\n        margin-left: 0;\n        padding-left: 0; }\n      .dat-slides-container .navigation-container ul.navigation li {\n        list-style: none;\n        float: left;\n        color: #fff;\n        border-left: 1px solid #303030;\n        border-right: 1px solid #303030;\n        font-size: 12px;\n        font-weight: 700;\n        background: #000; }\n        .dat-slides-container .navigation-container ul.navigation li:not(:first-child) {\n          padding: 0 18px; }\n        .dat-slides-container .navigation-container ul.navigation li.last {\n          float: right;\n          border-right: 0; }\n        .dat-slides-container .navigation-container ul.navigation li a + a {\n          display: inline-block;\n          padding-left: 10px;\n          margin-left: 10px; }\n        .dat-slides-container .navigation-container ul.navigation li a#back {\n          display: block;\n          padding: 0 20px; }\n        .dat-slides-container .navigation-container ul.navigation li a:link, .dat-slides-container .navigation-container ul.navigation li a:visited {\n          color: #777777;\n          text-decoration: none;\n          text-transform: uppercase;\n          letter-spacing: 2px; }\n        .dat-slides-container .navigation-container ul.navigation li a:hover, .dat-slides-container .navigation-container ul.navigation li a:active {\n          color: #fff; }\n        .dat-slides-container .navigation-container ul.navigation li.next:hover, .dat-slides-container .navigation-container ul.navigation li.prev:hover, .dat-slides-container .navigation-container ul.navigation li.next:hover *, .dat-slides-container .navigation-container ul.navigation li.prev:hover * {\n          color: #fff !important; }\n        .dat-slides-container .navigation-container ul.navigation li.next *, .dat-slides-container .navigation-container ul.navigation li.prev * {\n          font-size: 125%;\n          color: #777777; }\n        .dat-slides-container .navigation-container ul.navigation li.next, .dat-slides-container .navigation-container ul.navigation li.prev {\n          cursor: pointer; }\n        .dat-slides-container .navigation-container ul.navigation li span {\n          font-weight: 700;\n          color: #777777;\n          letter-spacing: 1px; }\n        .dat-slides-container .navigation-container ul.navigation li#dat-slides-desc {\n          min-width: 50px;\n          color: #777777;\n          border: 0;\n          text-align: center;\n          overflow: visible; }\n          .dat-slides-container .navigation-container ul.navigation li#dat-slides-desc span {\n            color: #fff;\n            font-weight: 700;\n            letter-spacing: 3px;\n            position: relative;\n            display: inline-block; }\n\n#dat-slides-toc {\n  -webkit-transition: all 350ms cubic-bezier(0.785, 0.135, 0.15, 0.86);\n  -moz-transition: all 350ms cubic-bezier(0.785, 0.135, 0.15, 0.86);\n  -ms-transition: all 350ms cubic-bezier(0.785, 0.135, 0.15, 0.86);\n  -o-transition: all 350ms cubic-bezier(0.785, 0.135, 0.15, 0.86);\n  transition: all 350ms cubic-bezier(0.785, 0.135, 0.15, 0.86);\n  background: #000;\n  position: fixed;\n  top: 42px;\n  left: 174px;\n  border: 0;\n  overflow: hidden; }\n  #dat-slides-toc span {\n    position: absolute;\n    display: block; }\n  #dat-slides-toc ul {\n    margin: 0;\n    padding: 0; }\n  #dat-slides-toc li {\n    border-top: 1px solid #303030;\n    border-left: 0;\n    border-right: 0;\n    border-bottom: 0;\n    padding: 0;\n    text-align: left;\n    display: block;\n    margin: 0;\n    width: 100%;\n    clear: both; }\n    #dat-slides-toc li a {\n      display: block;\n      padding: 0 18px; }\n"
});
define("text!dat/gui/saveDialogue.html", [], function () {
    return '<div id="dg-save" class="dg dialogue">\n\n  Here\'s the new load parameter for your <code>GUI</code>\'s constructor:\n\n  <textarea id="dg-new-constructor"></textarea>\n\n  <div id="dg-save-locally">\n\n    <input id="dg-local-storage" type="checkbox"/> Automatically save\n    values to <code>localStorage</code> on exit.\n\n    <div id="dg-local-explain">The values saved to <code>localStorage</code> will\n      override those passed to <code>dat.GUI</code>\'s constructor. This makes it\n      easier to work incrementally, but <code>localStorage</code> is fragile,\n      and your friends may not see the same values you do.\n      \n    </div>\n    \n  </div>\n\n</div>'
});
define("dat/controllers/Controller", ["dat/utils/common", "dat/dom/dom"],
    function (f, a) {
        var c = function (a, c) {
            this.initialValue = a[c];
            this.domElement = document.createElement("div");
            this.object = a;
            this.property = c;
            this.__onFinishChange = this.__onChange = void 0
        };
        f.extend(c.prototype, {
            onChange: function (a) {
                this.__onChange = a;
                return this
            },
            onFinishChange: function (a) {
                this.__onFinishChange = a;
                return this
            },
            setValue: function (a, c) {
                c || (this.object[this.property] = a);
                this.__onChange && this.__onChange.call(this, a);
                this.updateDisplay();
                return this
            },
            getValue: function () {
                return this.object[this.property]
            },
            updateDisplay: function () {
                return this
            },
            isModified: function () {
                return this.initialValue !== this.getValue()
            }
        });
        return c
    });
define("dat/controllers/StringController", ["dat/controllers/Controller",
    "dat/dom/dom", "dat/utils/common"
], function (f, a, c) {
    var d = function (c, b) {
        function l() {
            f.setValue(f.__input.value)
        }
        d.superclass.call(this, c, b);
        var f = this;
        this.__input = document.createElement("input");
        this.__input.setAttribute("type", "text");
        a.bind(this.__input, "keyup", l);
        a.bind(this.__input, "change", l);
        a.bind(this.__input, "blur", function () {
            f.__onFinishChange && f.__onFinishChange.call(f, f.getValue())
        });
        a.bind(this.__input, "keydown",
            function (a) {
                13 === a.keyCode && this.blur()
            });
        this.updateDisplay();
        this.domElement.appendChild(this.__input)
    };
    d.superclass = f;
    c.extend(d.prototype, f.prototype, {
        updateDisplay: function () {
            a.isActive(this.__input) || (this.__input.value = this.getValue());
            return d.superclass.prototype.updateDisplay.call(this)
        }
    });
    return d
});
define("dat/controllers/BooleanController", ["dat/controllers/Controller",
    "dat/dom/dom", "dat/utils/common"
], function (f, a, c) {
    var d = function (c, b) {
        d.superclass.call(this, c, b);
        var l = this;
        this.__prev = this.getValue();
        this.__checkbox = document.createElement("input");
        this.__checkbox.setAttribute("type", "checkbox");
        a.bind(this.__checkbox, "change", function () {
            l.setValue(!l.__prev)
        }, !1);
        this.domElement.appendChild(this.__checkbox);
        this.updateDisplay()
    };
    d.superclass = f;
    c.extend(d.prototype, f.prototype, {
        setValue: function (a) {
            a =
                d.superclass.prototype.setValue.call(this, a);
            this.__onFinishChange && this.__onFinishChange.call(this,
                this.getValue());
            this.__prev = this.getValue();
            return a
        },
        updateDisplay: function () {
            !0 === this.getValue() ? (this.__checkbox.setAttribute(
                "checked", "checked"), this.__checkbox.checked = !0) :
                this.__checkbox.checked = !1;
            return d.superclass.prototype.updateDisplay.call(this)
        }
    });
    return d
});
define("dat/controllers/FunctionController", ["dat/controllers/Controller",
    "dat/dom/dom", "dat/utils/common"
], function (f, a, c) {
    var d = function (c, b, l) {
        d.superclass.call(this, c, b);
        var f = this;
        this.__button = document.createElement("div");
        this.__button.innerHTML = void 0 === l ? "Fire" : l;
        a.bind(this.__button, "click", function (a) {
            a.preventDefault();
            f.fire();
            return !1
        });
        a.addClass(this.__button, "button");
        this.domElement.appendChild(this.__button)
    };
    d.superclass = f;
    c.extend(d.prototype, f.prototype, {
        fire: function () {
            this.__onChange &&
                this.__onChange.call(this);
            this.__onFinishChange && this.__onFinishChange.call(this,
                this.getValue());
            this.getValue()
                .call(this.object)
        }
    });
    return d
});
define("dat/controllers/NumberController", ["dat/controllers/Controller",
    "dat/utils/common"
], function (f, a) {
    var c = function (d, e, b) {
        c.superclass.call(this, d, e);
        b = b || {};
        this.__min = b.min;
        this.__max = b.max;
        this.__step = b.step;
        a.isUndefined(this.__step) ? this.__impliedStep = 0 == this.initialValue ?
            1 : Math.pow(10, Math.floor(Math.log(this.initialValue) /
                Math.LN10)) / 10 : this.__impliedStep = this.__step;
        d = this.__impliedStep;
        d = d.toString();
        d = -1 < d.indexOf(".") ? d.length - d.indexOf(".") - 1 : 0;
        this.__precision = d
    };
    c.superclass = f;
    a.extend(c.prototype, f.prototype, {
        setValue: function (a) {
            void 0 !== this.__min && a < this.__min ? a = this.__min :
                void 0 !== this.__max && a > this.__max && (a = this.__max);
            void 0 !== this.__step && 0 != a % this.__step && (a = Math
                .round(a / this.__step) * this.__step);
            return c.superclass.prototype.setValue.call(this, a)
        },
        min: function (a) {
            this.__min = a;
            return this
        },
        max: function (a) {
            this.__max = a;
            return this
        },
        step: function (a) {
            this.__step = this.__impliedStep = a;
            return this
        }
    });
    return c
});
define("dat/controllers/NumberControllerBox", [
    "dat/controllers/NumberController", "dat/dom/dom", "dat/utils/common"
], function (f, a, c) {
    var d = function (e, b, l) {
        function f() {
            var a = parseFloat(t.__input.value);
            c.isNaN(a) || t.setValue(a)
        }

        function q() {
            f();
            t.__onFinishChange && t.__onFinishChange.call(t, t.getValue())
        }

        function w(a) {
            var b = h - a.clientY;
            t.setValue(t.getValue() + b * t.__impliedStep);
            h = a.clientY
        }

        function x() {
            a.unbind(window, "mousemove", w);
            a.unbind(window, "mouseup", x)
        }
        this.__truncationSuspended = !1;
        d.superclass.call(this,
            e, b, l);
        var t = this,
            h;
        this.__input = document.createElement("input");
        this.__input.setAttribute("type", "text");
        a.bind(this.__input, "change", f);
        a.bind(this.__input, "blur", q);
        a.bind(this.__input, "mousedown", function (b) {
            a.bind(window, "mousemove", w);
            a.bind(window, "mouseup", x);
            h = b.clientY
        });
        a.bind(this.__input, "keydown", function (a) {
            13 === a.keyCode && (t.__truncationSuspended = !0, q(),
                t.__truncationSuspended = !1)
        });
        this.updateDisplay();
        this.domElement.appendChild(this.__input)
    };
    d.superclass = f;
    c.extend(d.prototype,
        f.prototype, {
            updateDisplay: function () {
                var a = this.__input,
                    b;
                if (this.__truncationSuspended) b = this.getValue();
                else {
                    b = this.getValue();
                    var c = Math.pow(10, this.__precision);
                    b = Math.round(b * c) / c
                }
                a.value = b;
                return d.superclass.prototype.updateDisplay.call(this)
            }
        });
    return d
});
define("text!dat/controllers/NumberControllerSlider.css", [], function () {
    return ".slider {\n  box-shadow: inset 0 2px 4px rgba(0,0,0,0.15);\n  height: 1em;\n  border-radius: 1em;\n  background-color: #eee;\n  padding: 0 0.5em;\n  overflow: hidden;\n}\n\n.slider-fg {\n  padding: 1px 0 2px 0;\n  background-color: #aaa;\n  height: 100%;\n  margin-left: -0.5em;\n  padding-right: 0.5em;\n  border-radius: 1em 0 0 1em;\n}\n\n.slider-fg:after {\n  display: inline-block;\n  border-radius: 1em;\n  background-color: #fff;\n  border:  1px solid #aaa;\n  content: '';\n  float: right;\n  margin-right: -1em;\n  margin-top: -1px;\n  height: 0.9em;\n  width: 0.9em;\n}"
});
define("dat/controllers/NumberControllerSlider", [
    "dat/controllers/NumberController", "dat/dom/dom", "dat/utils/css",
    "dat/utils/common", "text!dat/controllers/NumberControllerSlider.css"
], function (f, a, c, d, e) {
    function b(a, b, c, d, e) {
        return d + (a - b) / (c - b) * (e - d)
    }
    var l = function (c, d, e, f, t, h, k) {
        function y(c) {
            c.preventDefault();
            var d = a.getOffset(m.__background),
                e = a.getWidth(m.__background);
            m.__normalized = b(c.clientX, d.left, d.left + e, 0, 1);
            c = m.__curve(m.__normalized);
            m.setValue(b(c, 0, 1, m.__min, m.__max));
            return !1
        }

        function n() {
            a.unbind(window, "mousemove", y);
            a.unbind(window, "mouseup", n);
            m.__onFinishChange && m.__onFinishChange.call(m, m.getValue())
        }
        l.superclass.call(this, c, d, {
            min: e,
            max: f,
            step: t
        });
        var m = this;
        this.__background = document.createElement("div");
        this.__foreground = document.createElement("div");
        this.__curve = h || function (a) {
            return a
        };
        this.__invCurve = k || function (a) {
            return a
        };
        a.bind(this.__background, "mousedown", function (b) {
            a.bind(window, "mousemove", y);
            a.bind(window, "mouseup", n);
            y(b)
        });
        a.addClass(this.__background,
            "slider");
        a.addClass(this.__foreground, "slider-fg");
        this.updateDisplay();
        this.__background.appendChild(this.__foreground);
        this.domElement.appendChild(this.__background)
    };
    l.superclass = f;
    l.useDefaultStyles = function () {
        c.inject(e)
    };
    d.extend(l.prototype, f.prototype, {
        updateDisplay: function () {
            var a = (this.getValue() - this.__min) / (this.__max - this
                .__min);
            this.__foreground.style.width = 100 * this.__invCurve(a) +
                "%";
            return l.superclass.prototype.updateDisplay.call(this)
        },
        curve: function (a, b) {
            this.__curve = a;
            this.__invCurve =
                b;
            return this
        }
    });
    return l
});
define("dat/controllers/OptionController", ["dat/controllers/Controller",
    "dat/dom/dom", "dat/utils/common"
], function (f, a, c) {
    var d = function (e, b, f) {
        d.superclass.call(this, e, b);
        var p = this;
        this.__select = document.createElement("select");
        if (c.isArray(f)) {
            var q = {};
            c.each(f, function (a) {
                q[a] = a
            });
            f = q
        }
        c.each(f, function (a, b) {
            var c = document.createElement("option");
            c.innerHTML = b;
            c.setAttribute("value", a);
            p.__select.appendChild(c)
        });
        this.updateDisplay();
        a.bind(this.__select, "change", function () {
            p.setValue(this.options[this.selectedIndex].value)
        });
        this.domElement.appendChild(this.__select)
    };
    d.superclass = f;
    c.extend(d.prototype, f.prototype, {
        setValue: function (a) {
            a = d.superclass.prototype.setValue.call(this, a);
            this.__onFinishChange && this.__onFinishChange.call(this,
                this.getValue());
            return a
        },
        updateDisplay: function () {
            this.__select.value = this.getValue();
            return d.superclass.prototype.updateDisplay.call(this)
        }
    });
    return d
});
define("dat/controllers/factory",
    "dat/controllers/OptionController dat/controllers/NumberControllerBox dat/controllers/NumberControllerSlider dat/controllers/StringController dat/controllers/FunctionController dat/controllers/BooleanController dat/utils/common"
    .split(" "), function (f, a, c, d, e, b, l) {
        return function (p, q, w, x, t, h, k) {
            var y = p[q];
            if (l.isArray(w) || l.isObject(w)) return new f(p, q, w);
            if (l.isNumber(y)) return l.isNumber(w) && l.isNumber(x) ? new c(
                p, q, w, x, t, h, k) : new a(p, q, {
                min: w,
                max: x
            });
            if (l.isString(y)) return new d(p,
                q);
            if (l.isFunction(y)) return new e(p, q, "");
            if (l.isBoolean(y)) return new b(p, q)
        }
    });
define("dat/color/math", [], function () {
    var f;
    return {
        hsv_to_rgb: function (a, c, d) {
            var e = a / 60 - Math.floor(a / 60),
                b = d * (1 - c),
                f = d * (1 - e * c);
            c = d * (1 - (1 - e) * c);
            a = [
                [d, c, b],
                [f, d, b],
                [b, d, c],
                [b, f, d],
                [c, b, d],
                [d, b, f]
            ][Math.floor(a / 60) % 6];
            return {
                r: 255 * a[0],
                g: 255 * a[1],
                b: 255 * a[2]
            }
        },
        rgb_to_hsv: function (a, c, d) {
            var e = Math.min(a, c, d),
                b = Math.max(a, c, d),
                e = b - e;
            if (0 == b) return {
                h: NaN,
                s: 0,
                v: 0
            };
            a = (a == b ? (c - d) / e : c == b ? 2 + (d - a) / e : 4 + (a -
                c) / e) / 6;
            0 > a && (a += 1);
            return {
                h: 360 * a,
                s: e / b,
                v: b / 255
            }
        },
        rgb_to_hex: function (a, c, d) {
            a = this.hex_with_component(0,
                2, a);
            a = this.hex_with_component(a, 1, c);
            return a = this.hex_with_component(a, 0, d)
        },
        component_from_hex: function (a, c) {
            return a >> 8 * c & 255
        },
        hex_with_component: function (a, c, d) {
            return d << (f = 8 * c) | a & ~(255 << f)
        }
    }
});
define("dat/color/toString", ["dat/utils/common"], function (f) {
    return function (a) {
        if (1 == a.a || f.isUndefined(a.a)) {
            for (a = a.hex.toString(16); 6 > a.length;) a = "0" + a;
            return "#" + a
        }
        return "rgba(" + Math.round(a.r) + "," + Math.round(a.g) + "," +
            Math.round(a.b) + "," + a.a + ")"
    }
});
define("dat/color/interpret", ["dat/color/toString", "dat/utils/common"],
    function (f, a) {
        var c, d, e = [{
            litmus: a.isString,
            conversions: {
                THREE_CHAR_HEX: {
                    read: function (a) {
                        a = a.match(
                            /^#([A-F0-9])([A-F0-9])([A-F0-9])$/i);
                        return null === a ? !1 : {
                            space: "HEX",
                            hex: parseInt("0x" + a[1].toString() +
                                a[1].toString() + a[2].toString() +
                                a[2].toString() + a[3].toString() +
                                a[3].toString())
                        }
                    },
                    write: f
                },
                SIX_CHAR_HEX: {
                    read: function (a) {
                        a = a.match(/^#([A-F0-9]{6})$/i);
                        return null === a ? !1 : {
                            space: "HEX",
                            hex: parseInt("0x" + a[1].toString())
                        }
                    },
                    write: f
                },
                CSS_RGB: {
                    read: function (a) {
                        a = a.match(
                            /^rgb\(\s*(.+)\s*,\s*(.+)\s*,\s*(.+)\s*\)/);
                        return null === a ? !1 : {
                            space: "RGB",
                            r: parseFloat(a[1]),
                            g: parseFloat(a[2]),
                            b: parseFloat(a[3])
                        }
                    },
                    write: f
                },
                CSS_RGBA: {
                    read: function (a) {
                        a = a.match(
                            /^rgba\(\s*(.+)\s*,\s*(.+)\s*,\s*(.+)\s*\,\s*(.+)\s*\)/
                        );
                        return null === a ? !1 : {
                            space: "RGB",
                            r: parseFloat(a[1]),
                            g: parseFloat(a[2]),
                            b: parseFloat(a[3]),
                            a: parseFloat(a[4])
                        }
                    },
                    write: f
                }
            }
        }, {
            litmus: a.isNumber,
            conversions: {
                HEX: {
                    read: function (a) {
                        return {
                            space: "HEX",
                            hex: a,
                            conversionName: "HEX"
                        }
                    },
                    write: function (a) {
                        return a.hex
                    }
                }
            }
        }, {
            litmus: a.isArray,
            conversions: {
                RGB_ARRAY: {
                    read: function (a) {
                        return 3 != a.length ? !1 : {
                            space: "RGB",
                            r: a[0],
                            g: a[1],
                            b: a[2]
                        }
                    },
                    write: function (a, c) {
                        c[0] = a.r;
                        c[1] = a.g;
                        c[2] = a.b;
                        return [a.r, a.g, a.b]
                    }
                },
                RGBA_ARRAY: {
                    read: function (a) {
                        return 4 != a.length ? !1 : {
                            space: "RGB",
                            r: a[0],
                            g: a[1],
                            b: a[2],
                            a: a[3]
                        }
                    },
                    write: function (a, c) {
                        c[0] = a.r;
                        c[1] = a.g;
                        c[2] = a.b;
                        c[3] = a.a;
                        return [a.r, a.g, a.b, a.a]
                    }
                }
            }
        }, {
            litmus: a.isObject,
            conversions: {
                RGBA_OBJ: {
                    read: function (b) {
                        return a.isNumber(b.r) && a.isNumber(b.g) && a.isNumber(
                            b.b) && a.isNumber(b.a) ? {
                            space: "RGB",
                            r: b.r,
                            g: b.g,
                            b: b.b,
                            a: b.a
                        } : !1
                    },
                    write: function (a, c) {
                        c.r = a.r;
                        c.g = a.g;
                        c.b = a.b;
                        c.a = a.a;
                        return {
                            r: a.r,
                            g: a.g,
                            b: a.b,
                            a: a.a
                        }
                    }
                },
                RGB_OBJ: {
                    read: function (b) {
                        return a.isNumber(b.r) && a.isNumber(b.g) && a.isNumber(
                            b.b) ? {
                            space: "RGB",
                            r: b.r,
                            g: b.g,
                            b: b.b
                        } : !1
                    },
                    write: function (a, c) {
                        c.r = a.r;
                        c.g = a.g;
                        c.b = a.b;
                        return {
                            r: a.r,
                            g: a.g,
                            b: a.b
                        }
                    }
                },
                HSVA_OBJ: {
                    read: function (b) {
                        return a.isNumber(b.h) && a.isNumber(b.s) && a.isNumber(
                            b.v) && a.isNumber(b.a) ? {
                            space: "HSV",
                            h: b.h,
                            s: b.s,
                            v: b.v,
                            a: b.a
                        } : !1
                    },
                    write: function (a) {
                        return {
                            h: a.h,
                            s: a.s,
                            v: a.v,
                            a: a.a
                        }
                    }
                },
                HSV_OBJ: {
                    read: function (b) {
                        return a.isNumber(b.h) && a.isNumber(b.s) && a.isNumber(
                            b.v) ? {
                            space: "HSV",
                            h: b.h,
                            s: b.s,
                            v: b.v
                        } : !1
                    },
                    write: function (a) {
                        return {
                            h: a.h,
                            s: a.s,
                            v: a.v
                        }
                    }
                }
            }
        }];
        return function () {
            d = !1;
            var b = 1 < arguments.length ? a.toArray(arguments) : arguments[
                0];
            a.each(e, function (e) {
                if (e.litmus(b)) return a.each(e.conversions, function (
                    e, f) {
                    c = e.read(b);
                    if (!1 === d && !1 !== c) return d = c,
                        c.conversionName = f, c.conversion =
                        e, a.BREAK
                }), a.BREAK
            });
            return d
        }
    });
define("dat/controllers/TinkerController", ["dat/controllers/Controller",
    "dat/dom/dom", "dat/utils/common"
], function (f, a, c) {
    var d = function (c, b, f) {
        d.superclass.call(this, c, b);
        var p = this;
        this.__textarea = document.createElement("textarea");
        this.__textarea.innerHTML = this.getValue();
        a.bind(this.__textarea, "keyup", function (a) {
            var b;
            try {
                b = eval("(" + this.value + ")"), p.setValue(b)
            } catch (c) {
                throw c;
            }
        });
        this.domElement.appendChild(this.__textarea)
    };
    d.superclass = f;
    c.extend(d.prototype, f.prototype, {});
    return d
});
define("dat/utils/css", {
    link: function (f, a) {
        a = a || document;
        var c = a.createElement("link");
        c.type = "text/css";
        c.rel = "stylesheet";
        c.setAttribute("href", f);
        var d = a.getElementsByTagName("head")[0];
        c.disable = function () {
            d.removeChild(c)
        };
        var e = function () {};
        c.onLoad = function (a) {
            e = a
        };
        (function (a) {
            document.styleSheets.length != a ? e() : setTimeout(
                arguments.callee, 20)
        })(document.styleSheets.length);
        d.appendChild(c);
        return c
    },
    inject: function (f, a) {
        a = a || document;
        var c = a.createElement("style");
        c.type = "text/css";
        c.innerHTML =
            f;
        var d = a.getElementsByTagName("head")[0];
        d.disable = function () {
            d.removeChild(c)
        };
        d.appendChild(c);
        return c
    }
});
(function () {
    var f = {};
    define("dat/require/css", ["dat/utils/css", "text"], function (a, c) {
        return {
            load: function (d, e, b, l) {
                if (l.isBuild) c.load(d, e, function (a) {
                    f[d] = a;
                    b()
                }, l);
                else a.link(e.toUrl(d))
                    .onLoad(b)
            },
            write: function (a, e, b) {
                if (e in f) {
                    var l = c.jsEscape(f[e]);
                    b.asModule(a + "!" + e,
                        "define(['dat/utils/css'], function(css) {return css.inject('" +
                        l + "');});\n")
                }
            }
        }
    })
})();
define("dat/require/css!dat/gui/gui.css", ["dat/utils/css"], function (f) {
    return f.inject(
        ".dg {\n  /** Clear list styles */\n  /* Auto-place container */\n  /* Auto-placed GUI's */\n  /* Line items that don't contain folders. */\n  /** Folder names */\n  /** Hides closed items */\n  /** Controller row */\n  /** Name-half (left) */\n  /** Controller-half (right) */\n  /** Controller placement */\n  /** Shorter number boxes when slider is present. */\n  /** Ensure the entire boolean and function row shows a hand */ }\n  .dg ul {\n    list-style: none;\n    margin: 0;\n    padding: 0;\n    width: 100%;\n    clear: both; }\n  .dg.ac {\n    position: fixed;\n    top: 0;\n    left: 0;\n    right: 0;\n    height: 0;\n    z-index: 0; }\n  .dg:not(.ac) .main {\n    /** Exclude mains in ac so that we don't hide close button */\n    overflow: hidden; }\n  .dg.main {\n    -webkit-transition: opacity 0.1s linear;\n    -o-transition: opacity 0.1s linear;\n    -moz-transition: opacity 0.1s linear;\n    transition: opacity 0.1s linear; }\n    .dg.main.taller-than-window {\n      overflow-y: auto; }\n      .dg.main.taller-than-window .close-button {\n        opacity: 1;\n        /* TODO, these are style notes */\n        margin-top: -1px;\n        border-top: 1px solid #2c2c2c; }\n    .dg.main ul.closed .close-button {\n      opacity: 1 !important; }\n    .dg.main:hover .close-button,\n    .dg.main .close-button.drag {\n      opacity: 1; }\n    .dg.main .close-button {\n      /*opacity: 0;*/\n      -webkit-transition: opacity 0.1s linear;\n      -o-transition: opacity 0.1s linear;\n      -moz-transition: opacity 0.1s linear;\n      transition: opacity 0.1s linear;\n      border: 0;\n      position: absolute;\n      line-height: 19px;\n      height: 20px;\n      /* TODO, these are style notes */\n      cursor: pointer;\n      text-align: center;\n      background-color: #000; }\n      .dg.main .close-button:hover {\n        background-color: #111; }\n  .dg.a {\n    float: right;\n    margin-right: 15px;\n    overflow-x: hidden; }\n    .dg.a.has-save ul {\n      margin-top: 27px; }\n      .dg.a.has-save ul.closed {\n        margin-top: 0; }\n    .dg.a .save-row {\n      position: fixed;\n      top: 0;\n      z-index: 1002; }\n  .dg li {\n    -webkit-transition: height 0.1s ease-out;\n    -o-transition: height 0.1s ease-out;\n    -moz-transition: height 0.1s ease-out;\n    transition: height 0.1s ease-out; }\n  .dg li:not(.folder) {\n    cursor: auto;\n    height: 27px;\n    line-height: 27px;\n    overflow: hidden;\n    padding: 0 4px 0 5px; }\n  .dg li.folder {\n    padding: 0;\n    border-left: 4px solid rgba(0, 0, 0, 0); }\n  .dg li.tinker {\n    height: 200px; }\n    .dg li.tinker textarea {\n      margin-left: -5px;\n      width: 100%;\n      height: 200px;\n      resize: none; }\n  .dg li.title {\n    cursor: pointer;\n    margin-left: -4px; }\n  .dg .closed li:not(.title),\n  .dg .closed ul li,\n  .dg .closed ul li > * {\n    height: 0;\n    overflow: hidden;\n    border: 0; }\n  .dg .cr {\n    clear: both;\n    padding-left: 3px;\n    height: 27px; }\n  .dg .property-name {\n    cursor: default;\n    float: left;\n    clear: left;\n    width: 40%;\n    overflow: hidden;\n    text-overflow: ellipsis; }\n  .dg .c {\n    float: left;\n    width: 60%; }\n  .dg .c input[type=text] {\n    border: 0;\n    margin-top: 4px;\n    padding: 3px;\n    width: 100%;\n    float: right; }\n  .dg .has-slider input[type=text] {\n    width: 30%;\n    /*display: none;*/\n    margin-left: 0; }\n  .dg .slider {\n    float: left;\n    width: 66%;\n    margin-left: -5px;\n    margin-right: 0;\n    height: 19px;\n    margin-top: 4px; }\n  .dg .slider-fg {\n    height: 100%; }\n  .dg .c input[type=checkbox] {\n    margin-top: 9px; }\n  .dg .c select {\n    margin-top: 5px; }\n  .dg .cr.function:not(.tinker),\n  .dg .cr.function:not(.tinker) .property-name,\n  .dg .cr.function:not(.tinker) *,\n  .dg .cr.boolean,\n  .dg .cr.boolean * {\n    cursor: pointer; }\n  .dg .selector {\n    display: none;\n    position: absolute;\n    margin-left: -9px;\n    margin-top: 23px;\n    z-index: 10; }\n  .dg .c:hover .selector,\n  .dg .selector.drag {\n    display: block; }\n  .dg li.save-row {\n    padding: 0; }\n    .dg li.save-row .button {\n      display: inline-block;\n      padding: 0px 6px; }\n  .dg.dialogue {\n    background-color: #222;\n    width: 460px;\n    padding: 15px;\n    font-size: 13px;\n    line-height: 15px; }\n\n/* TODO Separate style and structure */\n#dg-new-constructor {\n  padding: 10px;\n  color: #222;\n  font-family: Monaco, monospace;\n  font-size: 10px;\n  border: 0;\n  resize: none;\n  box-shadow: inset 1px 1px 1px #888;\n  word-wrap: break-word;\n  margin: 12px 0;\n  display: block;\n  width: 440px;\n  overflow-y: scroll;\n  height: 100px;\n  position: relative; }\n\n#dg-local-explain {\n  display: none;\n  font-size: 11px;\n  line-height: 17px;\n  border-radius: 3px;\n  background-color: #333;\n  padding: 8px;\n  margin-top: 10px; }\n  #dg-local-explain code {\n    font-size: 10px; }\n\n#dat-gui-save-locally {\n  display: none; }\n\n/** Main type */\n.dg {\n  color: #eee;\n  font: 11px 'Lucida Grande', sans-serif;\n  text-shadow: 0 -1px 0 #111111;\n  /** Auto place */\n  /* Controller row, <li> */\n  /** Controllers */ }\n  .dg.main {\n    /** Scrollbar */ }\n    .dg.main::-webkit-scrollbar {\n      width: 5px;\n      background: #1a1a1a; }\n    .dg.main::-webkit-scrollbar-corner {\n      height: 0;\n      display: none; }\n    .dg.main::-webkit-scrollbar-thumb {\n      border-radius: 5px;\n      background: #676767; }\n  .dg li:not(.folder) {\n    background: #1a1a1a;\n    border-bottom: 1px solid #2c2c2c; }\n  .dg li.save-row {\n    line-height: 25px;\n    background: #dad5cb;\n    border: 0; }\n    .dg li.save-row select {\n      margin-left: 5px;\n      width: 108px; }\n    .dg li.save-row .button {\n      margin-left: 5px;\n      margin-top: 1px;\n      border-radius: 2px;\n      font-size: 9px;\n      line-height: 7px;\n      padding: 4px 4px 5px 4px;\n      background: #c5bdad;\n      color: #fff;\n      text-shadow: 0 1px 0 #b0a58f;\n      box-shadow: 0 -1px 0 #b0a58f;\n      cursor: pointer; }\n      .dg li.save-row .button.gears {\n        background: #c5bdad url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAANCAYAAAB/9ZQ7AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAQJJREFUeNpiYKAU/P//PwGIC/ApCABiBSAW+I8AClAcgKxQ4T9hoMAEUrxx2QSGN6+egDX+/vWT4e7N82AMYoPAx/evwWoYoSYbACX2s7KxCxzcsezDh3evFoDEBYTEEqycggWAzA9AuUSQQgeYPa9fPv6/YWm/Acx5IPb7ty/fw+QZblw67vDs8R0YHyQhgObx+yAJkBqmG5dPPDh1aPOGR/eugW0G4vlIoTIfyFcA+QekhhHJhPdQxbiAIguMBTQZrPD7108M6roWYDFQiIAAv6Aow/1bFwXgis+f2LUAynwoIaNcz8XNx3Dl7MEJUDGQpx9gtQ8YCueB+D26OECAAQDadt7e46D42QAAAABJRU5ErkJggg==) 2px 1px no-repeat;\n        height: 7px;\n        width: 8px; }\n      .dg li.save-row .button:hover {\n        background-color: #bab19e;\n        box-shadow: 0 -1px 0 #b0a58f; }\n  .dg li.folder {\n    border-bottom: 0; }\n  .dg li.title {\n    padding-left: 16px;\n    background: black url(data:image/gif;base64,R0lGODlhBQAFAJEAAP////Pz8////////yH5BAEAAAIALAAAAAAFAAUAAAIIlI+hKgFxoCgAOw==) 6px 10px no-repeat;\n    cursor: pointer;\n    border-bottom: 1px solid rgba(255, 255, 255, 0.2); }\n  .dg .closed li.title {\n    background-image: url(data:image/gif;base64,R0lGODlhBQAFAJEAAP////Pz8////////yH5BAEAAAIALAAAAAAFAAUAAAIIlGIWqMCbWAEAOw==); }\n  .dg .cr.boolean {\n    border-left: 3px solid #806787; }\n  .dg .cr.function {\n    border-left: 3px solid #e61d5f; }\n  .dg .cr.number {\n    border-left: 3px solid #2fa1d6; }\n    .dg .cr.number input[type=text] {\n      color: #2fa1d6; }\n  .dg .cr.string {\n    border-left: 3px solid #1ed36f; }\n    .dg .cr.string input[type=text] {\n      color: #1ed36f; }\n  .dg .cr.function:not(.tinker):hover, .dg .cr.boolean:hover {\n    background: #111; }\n  .dg .c input[type=text] {\n    background: #303030;\n    outline: none; }\n    .dg .c input[type=text]:hover {\n      background: #3c3c3c; }\n    .dg .c input[type=text]:focus {\n      background: #494949;\n      color: #fff; }\n  .dg .c .slider {\n    background: #303030;\n    cursor: ew-resize; }\n  .dg .c .slider-fg {\n    background: #2fa1d6; }\n  .dg .c .slider:hover {\n    background: #3c3c3c; }\n    .dg .c .slider:hover .slider-fg {\n      background: #44abda; }\n"
    )
});
define("workshop/improvedNoise", [], function () {
    function f(a, c) {
        var d = a || 362436069,
            e = c || 521288629,
            b = function () {
                d = 36969 * (d & 65535) + (d >>> 16) & 4294967295;
                e = 18E3 * (e & 65535) + (e >>> 16) & 4294967295;
                return ((d & 65535) << 16 | e & 65535) & 4294967295
            };
        this.nextDouble = function () {
            var a = b() / 4294967296;
            return 0 > a ? 1 + a : a
        };
        this.nextInt = b
    }
    f.createRandomized = function () {
        var a = new Date;
        return new f(a / 6E4 & 4294967295, a & 4294967295)
    };
    return (new function (a) {
            function c(a, b, c, d) {
                a &= 15;
                var e = 8 > a ? b : c;
                b = 4 > a ? c : 12 === a || 14 === a ? b : d;
                return (0 === (a &
                    1) ? e : -e) + (0 === (a & 2) ? b : -b)
            }

            function d(a, b, c) {
                w = 0 == (a & 1) ? b : c;
                return 0 == (a & 2) ? -w : w
            }

            function e(a, b, c) {
                return b + a * (c - b)
            }
            a = void 0 !== a ? new f(a) : f.createRandomized();
            var b, l, p = Array(512);
            for (b = 0; 256 > b; ++b) p[b] = b;
            for (b = 0; 256 > b; ++b) {
                var q = p[l = a.nextInt() & 255];
                p[l] = p[b];
                p[b] = q
            }
            for (b = 0; 256 > b; ++b) p[b + 256] = p[b];
            var w;
            this.noise3d = function (a, b, d) {
                var f = Math.floor(a) & 255,
                    h = Math.floor(b) & 255,
                    k = Math.floor(d) & 255;
                a -= Math.floor(a);
                b -= Math.floor(b);
                d -= Math.floor(d);
                var l = (3 - 2 * a) * a * a,
                    t = (3 - 2 * b) * b * b,
                    x = p[f] + h,
                    m = p[x] + k,
                    x =
                    p[x + 1] + k,
                    h = p[f + 1] + h,
                    f = p[h] + k,
                    k = p[h + 1] + k;
                return e((3 - 2 * d) * d * d, e(t, e(l, c(p[m], a, b, d),
                    c(p[f], a - 1, b, d)), e(l, c(p[x], a,
                    b - 1, d), c(p[k], a - 1, b - 1, d))), e(t,
                    e(l, c(p[m + 1], a, b, d - 1), c(p[f + 1],
                        a - 1, b, d - 1)), e(l, c(p[x + 1], a,
                        b - 1, d - 1), c(p[k + 1], a - 1, b -
                        1, d - 1))))
            };
            var x, t, h, k, y, n, m, D;
            this.noise2d = function (a, b) {
                m = Math.floor(a);
                D = Math.floor(b);
                x = m & 255;
                t = D & 255;
                a -= m;
                b -= D;
                h = (3 - 2 * a) * a * a;
                n = (3 - 2 * b) * b * b;
                k = p[x] + t;
                y = p[x + 1] + t;
                return e(n, e(h, d(p[k], a, b), d(p[y], a - 1, b)), e(h,
                    d(p[k + 1], a, b - 1), d(p[y + 1], a - 1, b -
                        1)))
            };
            this.noise1d = function (a) {
                var b =
                    Math.floor(a) & 255;
                a -= Math.floor(a);
                var c = a - 1;
                return e((3 - 2 * a) * a * a, 0 === (p[b] & 1) ? -a : a,
                    0 === (p[b + 1] & 1) ? -c : c)
            }
        }(void 0))
        .noise2d
});
define("dat/types/ExtendableFloatArray", [], function () {
    var f;
    f = "undefined" != typeof Float32Array ? Float32Array : Array;
    var a, c;
    return function (d) {
        d = d || {};
        c = {};
        for (a in d)(function (d) {
            c[a] = {
                get: function () {
                    return this[d]
                },
                set: function (a) {
                    this[d] = a
                }
            }
        })(d[a]);
        Object.defineProperties(f.prototype, c);
        return f
    }
});
define("workshop/fizzyText", ["workshop/improvedNoise",
    "dat/types/ExtendableFloatArray"
], function (f, a) {
    function c() {
        var a = new b(5);
        a[0] = 0;
        a[1] = 0;
        a[2] = 0;
        a[3] = 0;
        a[4] = 0;
        return a
    }
    var d = 2 * Math.PI,
        e, b = a({
            x: 0,
            y: 1,
            r: 2,
            vx: 3,
            vy: 4
        });
    b.prototype.render = function (a) {
        a.beginPath();
        a.arc(this[0], this[1], this[2], 0, d, !1);
        a.fill()
    };
    b.prototype.update = function (a) {
        e = f(this[0] / a.noiseScale, this[1] / a.noiseScale) * a.noiseStrength;
        0 < a.getColor(this[0], this[1]) ? this[2] += a.growthSpeed : this[
            2] -= a.growthSpeed;
        this[3] *= 0.8;
        this[4] *=
            0.8;
        this[0] += Math.cos(e) * a.speed + this[3];
        this[1] -= Math.sin(e) * a.speed + this[4];
        if (this[2] > a.maxSize) this[2] = a.maxSize;
        else if (0 > this[2]) return this[2] = 0, this[0] = Math.random() *
            a.width, this[1] = a.height2 + (2 * Math.random() - 1) * a.fontSize2, !
            1;
        return !0
    };
    return function (a, b, e, f, x) {
        this.growthSpeed = 0.37;
        this.maxSize = 8;
        this.noiseStrength = 10;
        this.speed = 0.4;
        this.displayOutline = !1;
        this.framesRendered = 0;
        Object.defineProperty(this, "message", {
            get: function () {
                return a
            },
            set: function (b) {
                b = a = b;
                y.clearRect(0, 0, h, k);
                y.fillStyle =
                    "#f00";
                y.textAlign = n.textAlign = "center";
                y.textBaseline = n.textBaseline = "middle";
                y.fillText(b, h / 2, k / 2);
                m = y.getImageData(0, 0, h, k)
                    .data
            }
        });
        this.explode = function () {
            for (var a in D) {
                var b = Math.random() * d;
                D[a][3] = 30 * Math.cos(b);
                D[a][4] = 30 * Math.sin(b)
            }
        };
        var t = this,
            h = b,
            k = e;
        x = x || 140;
        this.noiseScale = 300;
        this.color0 = "#00aeff";
        this.color1 = "#0fa954";
        this.color2 = "#54396e";
        this.color3 = "#e61d5f";
        b = document.createElement("canvas");
        var y = b.getContext("2d"),
            n = (this.domElement = document.createElement("canvas"))
            .getContext("2d");
        this.domElement.width = this.width = b.width = h;
        this.domElement.height = this.height = b.height = k;
        var m = [],
            D = [],
            E = f ? "darker" : "lighter";
        y.font = n.font = "bold " + x +
            "px Helvetica, Arial, sans-serif";
        n.globalCompositeOperation = E;
        for (b = 0; 1200 > b; b++) D.push(c());
        var B, g, C, J = D.length / 4;
        this.height2 = k / 2;
        this.fontSize2 = x / 2;
        this.render = function () {
            t.framesRendered++;
            n.clearRect(0, 0, h, k);
            t.displayOutline && (n.globalCompositeOperation =
                "source-over", n.strokeStyle = f ? "#000" : "#fff", n.lineWidth =
                2, n.strokeText(a, h / 2, k / 2), n.globalCompositeOperation =
                E);
            for (var b = 0; 4 > b; b++)
                for (n.fillStyle = this["color" + b], C = J * b, g = 0; g <
                    J; g++) B = D[g + C], B.update(this) && B.render(n)
        };
        this.getColor = function (a, b) {
            return m[4 * (~~b * h + ~~a)]
        };
        this.message = a
    }
});
define("dat/utils/utils", [], function () {
    var f = {
        unescape: function (a) {
            return ("" + a)
                .replace(/&amp;/g, "&")
                .replace(/&lt;/g, "<")
                .replace(/&gt;/g, ">")
                .replace(/&quot;/g, '"')
                .replace(/&#x27;/g, "'")
                .replace(/&#x2F;/g, "/")
        },
        sign: function (a) {
            return 0 <= a ? 1 : -1
        },
        lerp: function (a, c, d) {
            return (c - a) * d + a
        },
        map: function (a, c, d, e, b) {
            return e + (a - c) / (d - c) * (b - e)
        },
        cmap: function (a, c, d, e, b) {
            return f.clamp(e + (b - e) * (a - c) / (d - c), e, b)
        },
        wrap: function (a, c) {
            for (; 0 > a;) a += c;
            return a % c
        },
        cap: function (a, c) {
            return Math.abs(a) > c ? f.sign(a) * c :
                a
        },
        dist: function (a, c, d, e) {
            return Math.sqrt((a - d) * (a - d) + (c - e) * (c - e))
        },
        clamp: function (a, c, d) {
            return Math.max(Math.min(a, d), c)
        },
        roundToDecimal: function (a, c) {
            var d = Math.pow(10, c);
            return Math.round(a * d) / d
        },
        random: function () {
            if (0 == arguments.length) return Math.random();
            if (1 == arguments.length) {
                if ("number" == typeof arguments[0]) return random() *
                    arguments[0];
                if ("array" == typeof arguments[0]) return arguments[0]
                    [Math.floor(random(arguments[0].length))]
            } else if (2 == arguments.length) return lerp(arguments[0],
                arguments[1],
                random())
        },
        clone: function (a) {
            if (null == a || "object" != typeof a) return a;
            var c = a.constructor(),
                d;
            for (d in a) c[d] = clone(a[d]);
            return c
        },
        bezier: function (a, c, d, e, b) {
            var f = 1 - b;
            return a * f * f * f + 3 * c * b * f * f + 3 * d * b * b *
                f + e * b * b * b
        },
        commaify: function (a, c) {
            c || (c = 3);
            a = a.toString()
                .split("")
                .reverse()
                .join("");
            for (var d = "", e = 0, b = 0; b < a.length; b++) {
                var f = a.charAt(b);
                e > c - 1 ? (e = 0, d += ",") : e++;
                d += f
            }
            return d.split("")
                .reverse()
                .join("")
        },
        makeUnselectable: function (a) {
            if (void 0 != a && void 0 != a.style) {
                a.onselectstart = function () {
                    return !1
                };
                a.style.MozUserSelect = "none";
                a.style.KhtmlUserSelect = "none";
                a.unselectable = "on";
                a = a.childNodes;
                for (var c = a.length, d = 0; d < c; d++) this.makeUnselectable(
                    a[d])
            }
        },
        makeSelectable: function (a) {
            if (void 0 != a && void 0 != a.style) {
                a.onselectstart = function () {};
                a.style.MozUserSelect = "auto";
                a.style.KhtmlUserSelect = "auto";
                a.unselectable = "off";
                a = a.childNodes;
                for (var c = a.length, d = 0; d < c; d++) this.makeSelectable(
                    a[d])
            }
        },
        shuffle: function (a) {
            for (var c, d, e = a.length; e; c = parseInt(Math.random() *
                e), d = a[--e], a[e] = a[c], a[c] = d);
            return a
        }
    };
    return f
});
define("dat/color/Color", ["dat/color/interpret", "dat/color/math",
    "dat/color/toString", "dat/utils/common", "dat/utils/utils"
], function (f, a, c, d, e) {
    function b(a, b, c) {
        Object.defineProperty(a, b, {
            get: function () {
                if ("RGB" === this.__state.space) return this.__state[b];
                p(this, b, c);
                return this.__state[b]
            },
            set: function (a) {
                "RGB" !== this.__state.space && (p(this, b, c), this.__state
                    .space = "RGB");
                this.__state[b] = a
            }
        })
    }

    function l(a, b) {
        Object.defineProperty(a, b, {
            get: function () {
                if ("HSV" === this.__state.space) return this.__state[b];
                q(this);
                return this.__state[b]
            },
            set: function (a) {
                "HSV" !== this.__state.space && (q(this), this.__state.space =
                    "HSV");
                this.__state[b] = a
            }
        })
    }

    function p(b, c, e) {
        if ("HEX" === b.__state.space) b.__state[c] = a.component_from_hex(
            b.__state.hex, e);
        else if ("HSV" === b.__state.space) d.extend(b.__state, a.hsv_to_rgb(
            b.__state.h, b.__state.s, b.__state.v));
        else throw "Corrupted color state";
    }

    function q(b) {
        var c = a.rgb_to_hsv(b.r, b.g, b.b);
        d.extend(b.__state, {
            s: c.s,
            v: c.v
        });
        d.isNaN(c.h) ? d.isUndefined(b.__state.h) && (b.__state.h = 0) : b.__state
            .h =
            c.h
    }
    var w = function () {
        this.__state = f.apply(this, arguments);
        if (!1 === this.__state) throw "Failed to interpret color arguments";
        this.__state.a = this.__state.a || 1
    };
    w.lerp_rgb = function (a, b, c) {
        return new w(e.lerp(a.r, b.r, c), e.lerp(a.g, b.g, c), e.lerp(a.b,
            b.b, c), e.lerp(a.a, b.a, c))
    };
    w.lerp_hsv = function (a, b, c) {
        return new w({
            h: e.lerp(a.h, b.h, c),
            s: e.lerp(a.s, b.s, c),
            v: e.lerp(a.v, b.v, c),
            a: e.lerp(a.a, b.a, c)
        })
    };
    w.lerp = w.lerp_rgb;
    w.inverse = function (a) {
        return new w(255 - a.r, 255 - a.g, 255 - a.b)
    };
    w.mix = function (a) {
        1 < arguments.length &&
            (a = arguments);
        for (var b = 0, c = 0, d = 0, e = 0, f = a.length, l = 0; l < f; l++)
            b += a[l].r, c += a[l].g, d += a[l].b, e += a[l].a;
        return new w(b / f, c / f, d / f, e / f)
    };
    w.random = function () {
        return new w(255 * Math.random(), 255 * Math.random(), 255 * Math.random())
    };
    w.COMPONENTS = "r g b h s v hex a".split(" ");
    d.extend(w.prototype, {
        set: function (a) {
            d.extend(this.__state, a.__state)
        },
        toString: function () {
            return c(this)
        },
        toOriginal: function (a) {
            return this.__state.conversion.write(this, a)
        }
    });
    b(w.prototype, "r", 2);
    b(w.prototype, "g", 1);
    b(w.prototype, "b",
        0);
    l(w.prototype, "h");
    l(w.prototype, "s");
    l(w.prototype, "v");
    Object.defineProperty(w.prototype, "a", {
        get: function () {
            return this.__state.a
        },
        set: function (a) {
            this.__state.a = a
        }
    });
    Object.defineProperty(w.prototype, "hex", {
        get: function () {
            "HEX" !== !this.__state.space && (this.__state.hex = a.rgb_to_hex(
                this.r, this.g, this.b));
            return this.__state.hex
        },
        set: function (a) {
            this.__state.space = "HEX";
            this.__state.hex = a
        }
    });
    return w
});
define("dat/controllers/ColorController", ["dat/controllers/Controller",
    "dat/dom/dom", "dat/color/Color", "dat/color/interpret",
    "dat/utils/common"
], function (f, a, c, d, e) {
    function b() {
        this.setValue(this.__color.toOriginal(this.getValue()), !0)
    }

    function l(a, b, c, d) {
        a.style.background = "";
        e.each(w, function (e) {
            a.style.cssText += "background: " + e + "linear-gradient(" +
                b + ", " + c + " 0%, " + d + " 100%); "
        })
    }

    function p(a) {
        a.style.background = "";
        a.style.cssText +=
            "background: -moz-linear-gradient(top,  #ff0000 0%, #ff00ff 17%, #0000ff 34%, #00ffff 50%, #00ff00 67%, #ffff00 84%, #ff0000 100%);";
        a.style.cssText +=
            "background: -webkit-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);";
        a.style.cssText +=
            "background: -o-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);";
        a.style.cssText +=
            "background: -ms-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);";
        a.style.cssText +=
            "background: linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);"
    }
    var q = function (f, t, h) {
        function k(b) {
            w(b);
            a.bind(window, "mousemove", w);
            a.bind(window, "mouseup", y)
        }

        function y() {
            a.unbind(window, "mousemove", w);
            a.unbind(window, "mouseup", y)
        }

        function n() {
            var a = d(this.value);
            !1 !== a ? (B.__color.__state = a, B.setValue(B.__color)) :
                this.value = B.__color.toString();
            B.__onFinishChange(B.getValue())
        }

        function m() {
            a.unbind(window, "mousemove", E);
            a.unbind(window, "mouseup", m)
        }

        function w(c) {
            c.preventDefault();
            var d = a.getWidth(B.__saturation_field),
                e = a.getHeight(B.__saturation_field),
                f =
                a.getOffset(B.__saturation_field),
                d = (c.clientX - f.left + document.body.scrollLeft) / d;
            c = 1 - (c.clientY - f.top + document.body.scrollTop) / e;
            1 < c ? c = 1 : 0 > c && (c = 0);
            1 < d ? d = 1 : 0 > d && (d = 0);
            B.__color.v = c;
            B.__color.s = d;
            b.call(B);
            return !1
        }

        function E(c) {
            c.preventDefault();
            var d = a.getHeight(B.__hue_field),
                e = a.getOffset(B.__hue_field);
            c = 1 - (c.clientY - e.top + document.body.scrollTop) / d;
            1 < c ? c = 1 : 0 > c && (c = 0);
            B.__color.h = 360 * c;
            b.call(B);
            return !1
        }
        q.superclass.call(this, f, t);
        f = this.getValue();
        h = h || {};
        this.__byRef = e.isObject(f) || e.isArray(f);
        this.__color = new c(f);
        this.__temp = new c(0);
        this.__height = h.height || 100;
        this.__width = h.width || 100;
        var B = this;
        this.domElement = document.createElement("div");
        a.makeSelectable(this.domElement, !1);
        this.__selector = document.createElement("div");
        this.__selector.className = "selector";
        this.__saturation_field = document.createElement("div");
        this.__saturation_field.className = "saturation-field";
        this.__field_knob = document.createElement("div");
        this.__field_knob.className = "field-knob";
        this.__field_knob_border = "2px solid ";
        this.__hue_knob = document.createElement("div");
        this.__hue_knob.className = "hue-knob";
        this.__hue_field = document.createElement("div");
        this.__hue_field.className = "hue-field";
        this.__input = document.createElement("input");
        this.__input.type = "text";
        this.__input_textShadow = "0 1px 1px ";
        a.bind(this.__input, "keydown", function (a) {
            13 === a.keyCode && n.call(this)
        });
        a.bind(this.__input, "blur", n);
        a.bind(this.__selector, "mousedown", function (b) {
            var c = function (b) {
                a.removeClass(B.__selector, "drag");
                B.__onFinishChange(B.getValue());
                a.unbind(window, "mouseup", c)
            };
            a.addClass(this, "drag")
                .bind(window, "mouseup", c)
        });
        h = document.createElement("div");
        e.extend(this.__selector.style, {
            width: this.__width + 22 + "px",
            height: this.__height + 2 + "px",
            padding: "3px",
            backgroundColor: "#222",
            boxShadow: "0px 1px 3px rgba(0,0,0,0.3)"
        });
        e.extend(this.__field_knob.style, {
            position: "absolute",
            width: "12px",
            height: "12px",
            border: this.__field_knob_border + (0.5 > this.__color.v ?
                "#fff" : "#000"),
            boxShadow: "0px 1px 3px rgba(0,0,0,0.5)",
            borderRadius: "12px",
            zIndex: 1
        });
        e.extend(this.__hue_knob.style, {
            position: "absolute",
            width: "15px",
            height: "2px",
            borderRight: "4px solid #fff",
            zIndex: 1
        });
        e.extend(this.__saturation_field.style, {
            width: this.__width + "px",
            height: this.__height + "px",
            border: "1px solid #555",
            marginRight: "3px",
            display: "inline-block",
            cursor: "pointer"
        });
        e.extend(h.style, {
            width: "100%",
            height: "100%",
            background: "none"
        });
        l(h, "top", "rgba(0,0,0,0)", "#000");
        e.extend(this.__hue_field.style, {
            width: "15px",
            height: this.__height + "px",
            display: "inline-block",
            border: "1px solid #555",
            cursor: "ns-resize"
        });
        p(this.__hue_field);
        e.extend(this.__input.style, {
            outline: "none",
            textAlign: "center",
            color: "#fff",
            border: 0,
            fontWeight: "bold",
            textShadow: this.__input_textShadow + "rgba(0,0,0,0.7)"
        });
        a.bind(this.__saturation_field, "mousedown", k);
        a.bind(this.__field_knob, "mousedown", k);
        a.bind(this.__hue_field, "mousedown", function (b) {
            E(b);
            a.bind(window, "mousemove", E);
            a.bind(window, "mouseup", m)
        });
        this.__saturation_field.appendChild(h);
        this.__selector.appendChild(this.__field_knob);
        this.__selector.appendChild(this.__saturation_field);
        this.__selector.appendChild(this.__hue_field);
        this.__hue_field.appendChild(this.__hue_knob);
        this.domElement.appendChild(this.__input);
        this.domElement.appendChild(this.__selector);
        this.updateDisplay()
    };
    q.superclass = f;
    e.extend(q.prototype, f.prototype, {
        updateDisplay: function () {
            var b = this.getValue();
            if (e.isUndefined(b)) return this;
            var d = new c(b);
            if (!1 !== d) {
                var f = !1;
                e.each(c.COMPONENTS, function (a) {
                    if (!e.isUndefined(d[a]) && !e.isUndefined(this
                            .__color.__state[a]) && d[a] !== this.__color
                        .__state[a]) return f = !0, {}
                }, this);
                f && e.extend(this.__color.__state,
                    d)
            }
            e.extend(this.__temp.__state, this.__color.__state);
            this.__temp.a = 1;
            var b = 0.5 > this.__color.v || 0.5 < this.__color.s ? 255 :
                0,
                k = 255 - b,
                p = a.getHeight(this.__field_knob) / 2;
            e.extend(this.__field_knob.style, {
                marginLeft: this.__width * this.__color.s - p +
                    "px",
                marginTop: Math.round(this.__height * (1 - this.__color
                    .v) - p) + "px",
                backgroundColor: this.__temp.toString(),
                borderColor: "rgb(" + b + "," + b + "," + b + ")"
            });
            var p = a.getHeight(this.__hue_knob) / 2 + 1,
                n = new c(this.__color.r, this.__color.g, this.__color.b);
            n.s = n.v = 1;
            n.h = this.__color.h;
            e.extend(this.__hue_knob.style, {
                backgroundColor: n.toString(),
                marginTop: Math.round(this.__height * (1 - this.__color
                    .h / 360) - p) + "px"
            });
            this.__temp.s = 1;
            this.__temp.v = 1;
            l(this.__saturation_field, "left", "#fff", this.__temp.toString());
            e.extend(this.__input.style, {
                backgroundColor: this.__input.value = this.__color.toString(),
                color: "rgb(" + b + "," + b + "," + b + ")",
                textShadow: this.__input_textShadow + "rgba(" + k +
                    "," + k + "," + k + ",.7)"
            })
        }
    });
    var w = ["-moz-", "-o-", "-webkit-", "-ms-", ""];
    return q
});
define("examples/utils/utils", ["dat/dom/dom", "dat/utils/utils"], function (f,
    a) {
    return {
        addTableOfContents: function (a, d) {
            var e = document.createElement("ul");
            _.each(d.domElement.getElementsByClassName("slide"), function (
                a, b) {
                var c = a.innerHTML.match(/\<h1\>(.*)\<\/h1\>/)[1],
                    w = "#" + c.replace(/[\ \W\s]/g, "-"),
                    x = document.createElement("li"),
                    t = document.createElement("a");
                t.setAttribute("href", w);
                t.innerHTML = c;
                f.bind(t, "click", function (a) {
                    a.preventDefault();
                    d.activate(b);
                    return !1
                });
                x.appendChild(t);
                e.appendChild(x)
            });
            a.appendChild(e);
            var b = f.getHeight(a);
            a.style.height = "0px";
            a.style.zIndex = "1001";
            f.bind(a.parentNode, "mouseover", function (d) {
                a.style.height = b + "px"
            })
                .bind(a.parentNode, "mouseout", function (b) {
                    a.style.height = "0px"
                })
        },
        addBackButton: function (a) {
            var d = document.createElement("li");
            d.innerHTML = '<a id="back" href="/">back to workshop</a>';
            a.insertBefore(d, a.firstChild)
        },
        makeFooter: function (c, d, e) {
            var b = d[a.wrap(c - 1, d.length)],
                l = d[a.wrap(c + 1, d.length)],
                b = b.match(/\<h1\>(.*)\<\/h1\>/)[1] || "",
                l = l.match(/\<h1\>(.*)\<\/h1\>/)[1] ||
                "",
                p = document.createElement("div");
            f.addClass(p, "nav");
            if (0 < c) {
                var q = document.createElement("a");
                q.innerHTML = b;
                q.setAttribute("href", "#");
                f.bind(q, "click", function (a) {
                    a.preventDefault();
                    e.prev();
                    return !1
                });
                f.addClass(q, "prev");
                p.appendChild(q)
            }
            c < d.length - 1 && (c = document.createElement("a"), c.innerHTML =
                l, c.setAttribute("href", "#"), f.bind(c, "click", function (
                    a) {
                    a.preventDefault();
                    e.next();
                    return !1
                }), f.addClass(c, "next"), p.appendChild(c));
            return p
        }
    }
});
(function () {
    var f = this,
        a = f._,
        c = {},
        d = Array.prototype,
        e = Object.prototype,
        b = d.slice,
        l = d.unshift,
        p = e.toString,
        q = e.hasOwnProperty,
        w = d.forEach,
        x = d.map,
        t = d.reduce,
        h = d.reduceRight,
        k = d.filter,
        y = d.every,
        n = d.some,
        m = d.indexOf,
        D = d.lastIndexOf,
        e = Array.isArray,
        E = Object.keys,
        B = Function.prototype.bind,
        g = function (a) {
            return new F(a)
        };
    "undefined" !== typeof module && module.exports ? (module.exports = g,
        g._ = g) : f._ = g;
    g.VERSION = "1.1.7";
    var C = g.each = g.forEach = function (a, b, d) {
        if (null != a)
            if (w && a.forEach === w) a.forEach(b, d);
            else if (a.length ===
            +a.length)
            for (var e = 0, g = a.length; e < g && !(e in a && b.call(d,
                a[e], e, a) === c); e++);
        else
            for (e in a)
                if (q.call(a, e) && b.call(d, a[e], e, a) === c) break
    };
    g.map = function (a, b, c) {
        var d = [];
        if (null == a) return d;
        if (x && a.map === x) return a.map(b, c);
        C(a, function (a, r, e) {
            d[d.length] = b.call(c, a, r, e)
        });
        return d
    };
    g.reduce = g.foldl = g.inject = function (a, b, c, d) {
        var e = void 0 !== c;
        null == a && (a = []);
        if (t && a.reduce === t) return d && (b = g.bind(b, d)), e ? a.reduce(
            b, c) : a.reduce(b);
        C(a, function (a, r, g) {
            e ? c = b.call(d, c, a, r, g) : (c = a, e = !0)
        });
        if (!e) throw new TypeError(
            "Reduce of empty array with no initial value");
        return c
    };
    g.reduceRight = g.foldr = function (a, b, c, d) {
        null == a && (a = []);
        if (h && a.reduceRight === h) return d && (b = g.bind(b, d)), void 0 !==
            c ? a.reduceRight(b, c) : a.reduceRight(b);
        a = (g.isArray(a) ? a.slice() : g.toArray(a))
            .reverse();
        return g.reduce(a, b, c, d)
    };
    g.find = g.detect = function (a, b, c) {
        var d;
        J(a, function (a, e, r) {
            if (b.call(c, a, e, r)) return d = a, !0
        });
        return d
    };
    g.filter = g.select = function (a, b, c) {
        var d = [];
        if (null == a) return d;
        if (k && a.filter === k) return a.filter(b, c);
        C(a, function (a, e, r) {
            b.call(c, a, e, r) && (d[d.length] = a)
        });
        return d
    };
    g.reject = function (a, b, c) {
        var d = [];
        if (null == a) return d;
        C(a, function (a, e, r) {
            b.call(c, a, e, r) || (d[d.length] = a)
        });
        return d
    };
    g.every = g.all = function (a, b, d) {
        var e = !0;
        if (null == a) return e;
        if (y && a.every === y) return a.every(b, d);
        C(a, function (a, r, s) {
            if (!(e = e && b.call(d, a, r, s))) return c
        });
        return e
    };
    var J = g.some = g.any = function (a, b, d) {
        b = b || g.identity;
        var e = !1;
        if (null == a) return e;
        if (n && a.some === n) return a.some(b, d);
        C(a, function (a, r, s) {
            if (e |= b.call(d, a, r, s)) return c
        });
        return !!e
    };
    g.include = g.contains = function (a, b) {
        var c = !1;
        if (null == a) return c;
        if (m && a.indexOf === m) return -1 != a.indexOf(b);
        J(a, function (a) {
            if (c = a === b) return !0
        });
        return c
    };
    g.invoke = function (a, c) {
        var d = b.call(arguments, 2);
        return g.map(a, function (a) {
            return (c.call ? c || a : a[c])
                .apply(a, d)
        })
    };
    g.pluck = function (a, b) {
        return g.map(a, function (a) {
            return a[b]
        })
    };
    g.max = function (a, b, c) {
        if (!b && g.isArray(a)) return Math.max.apply(Math, a);
        var d = {
            computed: -Infinity
        };
        C(a, function (a, e, r) {
            e = b ? b.call(c, a, e, r) : a;
            e >= d.computed && (d = {
                value: a,
                computed: e
            })
        });
        return d.value
    };
    g.min = function (a,
        b, c) {
        if (!b && g.isArray(a)) return Math.min.apply(Math, a);
        var d = {
            computed: Infinity
        };
        C(a, function (a, e, r) {
            e = b ? b.call(c, a, e, r) : a;
            e < d.computed && (d = {
                value: a,
                computed: e
            })
        });
        return d.value
    };
    g.sortBy = function (a, b, c) {
        return g.pluck(g.map(a, function (a, d, e) {
                return {
                    value: a,
                    criteria: b.call(c, a, d, e)
                }
            })
            .sort(function (a, b) {
                var c = a.criteria,
                    d = b.criteria;
                return c < d ? -1 : c > d ? 1 : 0
            }), "value")
    };
    g.groupBy = function (a, b) {
        var c = {};
        C(a, function (a, d) {
            var e = b(a, d);
            (c[e] || (c[e] = []))
                .push(a)
        });
        return c
    };
    g.sortedIndex = function (a, b, c) {
        c ||
            (c = g.identity);
        for (var d = 0, e = a.length; d < e;) {
            var f = d + e >> 1;
            c(a[f]) < c(b) ? d = f + 1 : e = f
        }
        return d
    };
    g.toArray = function (a) {
        return a ? a.toArray ? a.toArray() : g.isArray(a) || g.isArguments(
            a) ? b.call(a) : g.values(a) : []
    };
    g.size = function (a) {
        return g.toArray(a)
            .length
    };
    g.first = g.head = function (a, c, d) {
        return null == c || d ? a[0] : b.call(a, 0, c)
    };
    g.rest = g.tail = function (a, c, d) {
        return b.call(a, null == c || d ? 1 : c)
    };
    g.last = function (a) {
        return a[a.length - 1]
    };
    g.compact = function (a) {
        return g.filter(a, function (a) {
            return !!a
        })
    };
    g.flatten = function (a) {
        return g.reduce(a,
            function (a, b) {
                if (g.isArray(b)) return a.concat(g.flatten(b));
                a[a.length] = b;
                return a
            }, [])
    };
    g.without = function (a) {
        return g.difference(a, b.call(arguments, 1))
    };
    g.uniq = g.unique = function (a, b) {
        return g.reduce(a, function (a, c, d) {
            0 != d && (!0 === b ? g.last(a) == c : g.include(a, c)) ||
                (a[a.length] = c);
            return a
        }, [])
    };
    g.union = function () {
        return g.uniq(g.flatten(arguments))
    };
    g.intersection = g.intersect = function (a) {
        var c = b.call(arguments, 1);
        return g.filter(g.uniq(a), function (a) {
            return g.every(c, function (b) {
                return 0 <= g.indexOf(b,
                    a)
            })
        })
    };
    g.difference = function (a, b) {
        return g.filter(a, function (a) {
            return !g.include(b, a)
        })
    };
    g.zip = function () {
        for (var a = b.call(arguments), c = g.max(g.pluck(a, "length")), d =
            Array(c), e = 0; e < c; e++) d[e] = g.pluck(a, "" + e);
        return d
    };
    g.indexOf = function (a, b, c) {
        if (null == a) return -1;
        var d;
        if (c) return c = g.sortedIndex(a, b), a[c] === b ? c : -1;
        if (m && a.indexOf === m) return a.indexOf(b);
        c = 0;
        for (d = a.length; c < d; c++)
            if (a[c] === b) return c;
        return -1
    };
    g.lastIndexOf = function (a, b) {
        if (null == a) return -1;
        if (D && a.lastIndexOf === D) return a.lastIndexOf(b);
        for (var c = a.length; c--;)
            if (a[c] === b) return c;
        return -1
    };
    g.range = function (a, b, c) {
        1 >= arguments.length && (b = a || 0, a = 0);
        c = arguments[2] || 1;
        for (var d = Math.max(Math.ceil((b - a) / c), 0), e = 0, g = Array(
            d); e < d;) g[e++] = a, a += c;
        return g
    };
    g.bind = function (a, c) {
        if (a.bind === B && B) return B.apply(a, b.call(arguments, 1));
        var d = b.call(arguments, 2);
        return function () {
            return a.apply(c, d.concat(b.call(arguments)))
        }
    };
    g.bindAll = function (a) {
        var c = b.call(arguments, 1);
        0 == c.length && (c = g.functions(a));
        C(c, function (b) {
            a[b] = g.bind(a[b], a)
        });
        return a
    };
    g.memoize = function (a, b) {
        var c = {};
        b || (b = g.identity);
        return function () {
            var d = b.apply(this, arguments);
            return q.call(c, d) ? c[d] : c[d] = a.apply(this, arguments)
        }
    };
    g.delay = function (a, c) {
        var d = b.call(arguments, 2);
        return setTimeout(function () {
            return a.apply(a, d)
        }, c)
    };
    g.defer = function (a) {
        return g.delay.apply(g, [a, 1].concat(b.call(arguments, 1)))
    };
    var A = function (a, b, c) {
        var d;
        return function () {
            var e = this,
                g = arguments,
                s = function () {
                    d = null;
                    a.apply(e, g)
                };
            c && clearTimeout(d);
            if (c || !d) d = setTimeout(s, b)
        }
    };
    g.throttle =
        function (a, b) {
            return A(a, b, !1)
    };
    g.debounce = function (a, b) {
        return A(a, b, !0)
    };
    g.once = function (a) {
        var b = !1,
            c;
        return function () {
            if (b) return c;
            b = !0;
            return c = a.apply(this, arguments)
        }
    };
    g.wrap = function (a, c) {
        return function () {
            var d = [a].concat(b.call(arguments));
            return c.apply(this, d)
        }
    };
    g.compose = function () {
        var a = b.call(arguments);
        return function () {
            for (var c = b.call(arguments), d = a.length - 1; 0 <= d; d--)
                c = [a[d].apply(this, c)];
            return c[0]
        }
    };
    g.after = function (a, b) {
        return function () {
            if (1 > --a) return b.apply(this, arguments)
        }
    };
    g.keys = E || function (a) {
        if (a !== Object(a)) throw new TypeError("Invalid object");
        var b = [],
            c;
        for (c in a) q.call(a, c) && (b[b.length] = c);
        return b
    };
    g.values = function (a) {
        return g.map(a, g.identity)
    };
    g.functions = g.methods = function (a) {
        var b = [],
            c;
        for (c in a) g.isFunction(a[c]) && b.push(c);
        return b.sort()
    };
    g.extend = function (a) {
        C(b.call(arguments, 1), function (b) {
            for (var c in b) void 0 !== b[c] && (a[c] = b[c])
        });
        return a
    };
    g.defaults = function (a) {
        C(b.call(arguments, 1), function (b) {
            for (var c in b) null == a[c] && (a[c] = b[c])
        });
        return a
    };
    g.clone = function (a) {
        return g.isArray(a) ? a.slice() : g.extend({}, a)
    };
    g.tap = function (a, b) {
        b(a);
        return a
    };
    g.isEqual = function (a, b) {
        if (a === b) return !0;
        var c = typeof a;
        if (c != typeof b) return !1;
        if (a == b) return !0;
        if (!a && b || a && !b) return !1;
        a._chain && (a = a._wrapped);
        b._chain && (b = b._wrapped);
        if (a.isEqual) return a.isEqual(b);
        if (b.isEqual) return b.isEqual(a);
        if (g.isDate(a) && g.isDate(b)) return a.getTime() === b.getTime();
        if (g.isNaN(a) && g.isNaN(b)) return !1;
        if (g.isRegExp(a) && g.isRegExp(b)) return a.source === b.source &&
            a.global ===
            b.global && a.ignoreCase === b.ignoreCase && a.multiline ===
            b.multiline;
        if ("object" !== c || a.length && a.length !== b.length) return !1;
        var c = g.keys(a),
            d = g.keys(b);
        if (c.length != d.length) return !1;
        for (var e in a)
            if (!(e in b && g.isEqual(a[e], b[e]))) return !1;
        return !0
    };
    g.isEmpty = function (a) {
        if (g.isArray(a) || g.isString(a)) return 0 === a.length;
        for (var b in a)
            if (q.call(a, b)) return !1;
        return !0
    };
    g.isElement = function (a) {
        return !(!a || 1 != a.nodeType)
    };
    g.isArray = e || function (a) {
        return "[object Array]" === p.call(a)
    };
    g.isObject = function (a) {
        return a ===
            Object(a)
    };
    g.isArguments = function (a) {
        return !(!a || !q.call(a, "callee"))
    };
    g.isFunction = function (a) {
        return !!(a && a.constructor && a.call && a.apply)
    };
    g.isString = function (a) {
        return !!("" === a || a && a.charCodeAt && a.substr)
    };
    g.isNumber = function (a) {
        return !!(0 === a || a && a.toExponential && a.toFixed)
    };
    g.isNaN = function (a) {
        return a !== a
    };
    g.isBoolean = function (a) {
        return !0 === a || !1 === a
    };
    g.isDate = function (a) {
        return !!(a && a.getTimezoneOffset && a.setUTCFullYear)
    };
    g.isRegExp = function (a) {
        return !(!a || !a.test || !a.exec || !a.ignoreCase &&
            !1 !== a.ignoreCase)
    };
    g.isNull = function (a) {
        return null === a
    };
    g.isUndefined = function (a) {
        return void 0 === a
    };
    g.noConflict = function () {
        f._ = a;
        return this
    };
    g.identity = function (a) {
        return a
    };
    g.times = function (a, b, c) {
        for (var d = 0; d < a; d++) b.call(c, d)
    };
    g.mixin = function (a) {
        C(g.functions(a), function (b) {
            N(b, g[b] = a[b])
        })
    };
    var P = 0;
    g.uniqueId = function (a) {
        var b = P++;
        return a ? a + b : b
    };
    g.templateSettings = {
        evaluate: /<%([\s\S]+?)%>/g,
        interpolate: /<%=([\s\S]+?)%>/g
    };
    g.template = function (a, b) {
        var c = g.templateSettings,
            c =
            "var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('" +
            a.replace(/\\/g, "\\\\")
            .replace(/'/g, "\\'")
            .replace(c.interpolate, function (a, b) {
                return "'," + b.replace(/\\'/g, "'") + ",'"
            })
            .replace(c.evaluate || null, function (a, b) {
                return "');" + b.replace(/\\'/g, "'")
                    .replace(/[\r\n\t]/g, " ") + "__p.push('"
            })
            .replace(/\r/g, "\\r")
            .replace(/\n/g, "\\n")
            .replace(/\t/g, "\\t") + "');}return __p.join('');",
            c = new Function("obj", c);
        return b ? c(b) : c
    };
    var F = function (a) {
        this._wrapped = a
    };
    g.prototype = F.prototype;
    var v = function (a, b) {
            return b ? g(a)
                .chain() : a
        },
        N = function (a, c) {
            F.prototype[a] = function () {
                var a =
                    b.call(arguments);
                l.call(a, this._wrapped);
                return v(c.apply(g, a), this._chain)
            }
        };
    g.mixin(g);
    C("pop push reverse shift sort splice unshift".split(" "), function (a) {
        var b = d[a];
        F.prototype[a] = function () {
            b.apply(this._wrapped, arguments);
            return v(this._wrapped, this._chain)
        }
    });
    C(["concat", "join", "slice"], function (a) {
        var b = d[a];
        F.prototype[a] = function () {
            return v(b.apply(this._wrapped, arguments), this._chain)
        }
    });
    F.prototype.chain = function () {
        this._chain = !0;
        return this
    };
    F.prototype.value = function () {
        return this._wrapped
    }
})();
define("underscore", function () {});
define("dat/utils/urlArgs", ["underscore"], function () {
    var f = {},
        a = {},
        c = {},
        d;
    f.getBoolean = function (c, b) {
        return a.hasOwnProperty(c) ? a.hasOwnProperty(c) && "false" !== a[c] &&
            "0" !== a[c] || "1" === a[c] || "true" === a[c] || !1 : b
    };
    f.getFloat = function (c, b) {
        var d = parseFloat(a[c]);
        return _.isNaN(d) ? b || 0 : d
    };
    f.getInt = function (c, b) {
        var d = parseInt(a[c]);
        return _.isNaN(d) ? b || 0 : d
    };
    f.getHash = function () {
        return location.hash ? location.hash.substr(1) : location.hash
    };
    f.refresh = function (a, b) {
        var f = [];
        _.extend(c, a);
        _.each(c, function (a,
            b) {
            f.push(b + "=" + a)
        });
        window.location.href = (b || d) + "?" + f.join("&")
    };
    f.update = function () {
        a = {};
        c = {};
        d = window.location.href.substr(0, window.location.href.indexOf("?"));
        window.location.search.replace(RegExp("([^?=&]+)(=([^&]*))?", "g"),
            function (d, b, f, p) {
                a[b] = p;
                c[b] = p
            });
        f.result = a
    };
    f.get = function (c) {
        this.update();
        return a[c]
    };
    f.update();
    return f
});
define("dat/utils/System", ["underscore"], function () {
    function f(a) {
        var e = [];
        _.each(a, function (a, d) {
            a.test(c) && e.push(d)
        });
        return _.isEmpty(e) ? !1 : _.first(e)
    }
    var a = {},
        c = navigator.userAgent;
    a.Browsers = {
        Arora: /Arora/,
        Chrome: /Chrome/,
        "Chrome iOS": /CriOS/,
        Epiphany: /Epiphany/,
        Firefox: /Firefox/,
        "Mobile Safari": /Mobile Safari/,
        "Internet Explorer": /MSIE/,
        Midori: /Midori/,
        Opera: /Opera/,
        Safari: /Safari/
    };
    a.OS = {
        Android: /Android/,
        "Chrome OS": /CrOS/,
        iOS: /iP[ao]d|iPhone/i,
        Linux: /Linux/,
        "Mac OS": /Mac OS/,
        Windows: /windows/
    };
    a.browser = f(a.Browsers);
    a.version = function () {
        var a = c,
            e = parseFloat(navigator.appVersion),
            b = parseInt(navigator.appVersion, 10),
            f; - 1 != (b = a.indexOf("Opera")) ? (e = a.substring(b + 6), -
            1 != (b = a.indexOf("Version")) && (e = a.substring(b + 8))) :
            -1 != (b = a.indexOf("MSIE")) ? e = a.substring(b + 5) : -1 !=
            (b = a.indexOf("Chrome")) ? e = a.substring(b + 7) : -1 != (b =
                a.indexOf("Safari")) ? (e = a.substring(b + 7), -1 != (b =
                a.indexOf("Version")) && (e = a.substring(b + 8))) : -1 !=
            (b = a.indexOf("Firefox")) ? e = a.substring(b + 8) : a.lastIndexOf(
                " ") + 1 < (b = a.lastIndexOf("/")) &&
            (e = a.substring(b + 1)); - 1 != (f = e.indexOf(";")) && (e = e
                .substring(0, f)); - 1 != (f = e.indexOf(" ")) && (e = e.substring(
                0, f));
        b = parseInt("" + e, 10);
        isNaN(b) && (e = parseFloat(navigator.appVersion), b = parseInt(
            navigator.appVersion, 10));
        return {
            full: e,
            major: b
        }
    }();
    a.os = f(a.OS);
    a.supports = {
        canvas: !!window.CanvasRenderingContext2D,
        localStorage: !!localStorage.getItem,
        file: !!window.File && !!window.FileReader && !!window.FileList &&
            !!window.Blob,
        fileSystem: !!window.requestFileSystem,
        requestAnimationFrame: !!window.mozRequestAnimationFrame ||
            !!window.webkitRequestAnimationFrame || !!window.oRequestAnimationFrame ||
            !!window.msRequestAnimationFrame,
        sessionStorage: !!sessionStorage.getItem,
        webgl: !!window.WebGLRenderingContext,
        worker: !!window.Worker
    };
    return a
});
define("dat/slides/Slides",
    "dat/utils/css text!dat/slides/style.css dat/dom/dom dat/utils/requestAnimationFrame dat/events/Events dat/utils/urlArgs dat/utils/System underscore"
    .split(" "), function (f, a, c, d, e, b, l) {
        function p(a) {
            var b = a.navContainer = document.createElement("div"),
                d = document.createElement("ul");
            c.addClass(b, "navigation-container")
                .addClass(d, "navigation")
                .makeSelectable(b, !1);
            var e = a.desc = document.createElement("li");
            c.addClass(e, "desc");
            e.setAttribute("id", "dat-slides-desc");
            e.innerHTML =
                '<span></span><div id="dat-slides-toc"></div>';
            var f = a._next = document.createElement("li");
            f.innerHTML = '<span id="s1-next-slide"></span><a>&rarr;</a>';
            var m = a._previous = document.createElement("li");
            m.innerHTML = '<a>&larr;</a><span id="s1-prev-slide"></span>';
            d.appendChild(m);
            d.appendChild(e);
            d.appendChild(f);
            c.addClass(f, "next")
                .addClass(m, "prev")
                .addClass(a.domElement, "auto-ui")
                .bind(f, "click", function (b) {
                    a.next()
                })
                .bind(m, "click", function (b) {
                    a.prev()
                });
            b.appendChild(d);
            a.domElement.appendChild(b)
        }

        function q(a) {
            _.isElement(a.desc) && (a.desc.firstChild.innerHTML = a.cid() + 1 +
                "/" + a.deck.length);
            a.onChange.call(this)
        }

        function w(a) {
            return "Firefox" === l.browser ? 0 : a.navContainer ? c.getHeight(a
                .navContainer) : 0
        }
        var x = function (a, b, d) {
            this.domElement = document.createElement("li");
            _.isElement(a) ? this.domElement.appendChild(a) : this.domElement
                .innerHTML = a;
            c.addClass(this.domElement, "slide");
            this.domElement.width = this.domElement.style.width = d;
            this.update = b
        };
        b = function (b) {
            function e() {
                d(e);
                !_.isUndefined(k.active) &&
                    _.isFunction(k.active.update) && k.active.update()
            }
            var k = this,
                l = _.defaults(b || {}, {
                    css: "",
                    container: document.body,
                    transition: function (a) {
                        _.extend(k.domElement.firstChild.style, {
                            marginLeft: -c.getWidth(k.domElement) * k.cid() +
                                "px"
                        })
                    },
                    loopKeys: !1,
                    onChange: _.identity,
                    autoUI: !1
                });
            this.__loopKeys = l.loopKeys;
            f.inject(l.css || a);
            b = this.domElement = document.createElement("div");
            c.addClass(b, "dat-slides-container");
            b.innerHTML = '<ul class="slides"></ul>';
            l.container.appendChild(b);
            c.makeFullscreen(b);
            this.deck = [];
            this.urlMap = [];
            this.onLoadUrl = window.location.hash;
            l.autoUI && p(this);
            c.bind(window, "keyup", function (a) {
                if ("text" !== document.activeElement.type) switch (a.which) {
                case 37:
                    if (!k.__loopKeys && 0 == k.cid()) break;
                    k.prev();
                    break;
                case 39:
                    if (!k.__loopKeys && k.cid() == k.deck.length - 1)
                        break;
                    k.next()
                }
            });
            this.transition = function (a) {
                l.transition.call(a)
            };
            this.transitioning = !1;
            this.onChange = l.onChange;
            var n = _.debounce(function () {
                c.removeClass(k.domElement.firstChild, "resize")
            }, 500);
            c.bind(window, "popstate", function (a) {
                a =
                    window.location.hash.toString();
                for (var b = 0, c = k.urlMap.length; b < c; b++)
                    if (a === k.urlMap[b]) {
                        k.activate(b, !0);
                        break
                    }
            })
                .bind(window, "resize", function (a) {
                    var b = c.getWidth(k.domElement),
                        d = c.getHeight(k.domElement) - w(k);
                    c.addClass(k.domElement.firstChild, "resize");
                    _.extend(k.domElement.firstChild.style, {
                        marginLeft: -b * k.cid() + "px",
                        width: b * k.deck.length + 5E3 + "px"
                    });
                    _.each(k.deck, function (a) {
                        _.extend(a.domElement.style, {
                            overflowX: "auto",
                            height: d + "px",
                            width: b + "px"
                        })
                    });
                    n()
                });
            e()
        };
        _.extend(b.prototype, e, {
            activate: function (a,
                b) {
                _.isUndefined(a) && (a = 0);
                this.active = this.deck[a];
                this.transition(this.active);
                q(this);
                history && !b && (window.location.hash = this.urlMap[a]);
                this.trigger("activated", {
                    index: a
                })
            },
            add: function (a, b) {
                var d = c.getWidth(this.domElement),
                    e = c.getHeight(this.domElement) - w(this),
                    f = new x(a, b, d);
                _.extend(this.domElement.firstChild.style, {
                    width: d * this.deck.length + 5E3 + "px"
                });
                _.extend(f.domElement.style, {
                    width: d + "px",
                    height: e + "px",
                    overflow: "auto"
                });
                d = this.deck.length;
                e = a.querySelector("h1")
                    .innerHTML || "slide " + d;
                this.urlMap.push("#" + e.replace(/[\ \W\s]/g, "-"));
                this.deck.push(f);
                this.domElement.firstChild.appendChild(f.domElement);
                1 >= this.deck.length ? this.activate(0) : this.onLoadUrl ===
                    this.urlMap[d] && this.activate(d);
                q(this);
                return this
            },
            at: function (a) {
                return this.deck[a]
            },
            cid: function () {
                return this.indexOf(this.active)
            },
            indexOf: function (a) {
                return _.indexOf(this.deck, a)
            },
            next: function () {
                var a = (this.cid() + 1) % this.deck.length;
                this.activate(a)
            },
            prev: function () {
                var a = this.cid() - 1;
                0 > a && (a = this.deck.length - 1);
                this.activate(a)
            }
        });
        return b
    });
define("dat/dom/CenteredDiv", ["dat/dom/dom", "underscore"], function (f) {
    var a = function (a) {
        this.backgroundElement = document.createElement("div");
        _.extend(this.backgroundElement.style, {
            backgroundColor: "rgba(0,0,0,0.8)",
            top: 0,
            left: 0,
            display: "none",
            zIndex: "1000",
            opacity: 0,
            WebkitTransition: "opacity 0.2s linear"
        });
        f.makeFullscreen(this.backgroundElement);
        this.backgroundElement.style.position = "fixed";
        this.domElement = document.createElement("div");
        _.extend(this.domElement.style, {
            position: "fixed",
            display: "none",
            zIndex: "1001",
            opacity: 0,
            WebkitTransition: "-webkit-transform 0.2s ease-out, opacity 0.2s linear"
        });
        this.__visible = !1;
        document.body.appendChild(this.backgroundElement);
        document.body.appendChild(this.domElement);
        var d = this;
        this.permanent = !!a;
        f.bind(this.backgroundElement, "click", function () {
            d.permanent || d.hide()
        })
    };
    a.prototype.show = function (a) {
        var d = this;
        this.backgroundElement.style.display = "block";
        this.domElement.style.display = "block";
        this.domElement.style.opacity = 0;
        this.domElement.style.webkitTransform = "scale(1.1)";
        this.layout();
        _.defer(function () {
            d.backgroundElement.style.opacity = 1;
            d.domElement.style.opacity = 1;
            d.domElement.style.webkitTransform = "scale(1)"
        });
        _.isFunction(a) && _.delay(function () {
            a.call(d)
        }, 200);
        this.__visible = !0;
        return this
    };
    a.prototype.hide = function (a) {
        var d = this;
        _.delay(function () {
            d.domElement.style.display = "none";
            d.backgroundElement.style.display = "none";
            _.isFunction(a) && a.call(d)
        }, 200);
        this.backgroundElement.style.opacity = 0;
        this.domElement.style.opacity = 0;
        this.domElement.style.webkitTransform =
            "scale(1.1)";
        this.__visible = !1;
        return this
    };
    a.prototype.layout = function () {
        this.domElement.style.left = (f.getWidth(window) - f.getWidth(this.domElement)) /
            2 + "px";
        this.domElement.style.top = (f.getHeight(window) - f.getHeight(this
            .domElement)) / 2 + "px"
    };
    return a
});
define("dat/gui/GUI",
    "text!dat/gui/saveDialogue.html dat/controllers/factory dat/controllers/Controller dat/controllers/BooleanController dat/controllers/FunctionController dat/controllers/NumberControllerBox dat/controllers/NumberControllerSlider dat/controllers/OptionController dat/controllers/ColorController dat/controllers/TinkerController dat/utils/requestAnimationFrame dat/dom/CenteredDiv dat/dom/dom dat/utils/common dat/require/css!dat/gui/gui.css"
    .split(" "), function (f, a, c, d, e, b, l, p, q, w, x,
        t, h, k) {
        function y(b, d, e, f) {
            if (void 0 === d[e]) throw Error("Object " + d +
                ' has no property "' + e + '"');
            f.color ? d = new q(d, e) : f.tinker ? d = new w(d, e) : (d = [d, e]
                .concat(f.factoryArgs), d = a.apply(b, d));
            f.before instanceof c && (f.before = f.before.__li);
            D(b, d);
            h.addClass(d.domElement, "c");
            e = document.createElement("span");
            h.addClass(e, "property-name");
            e.innerHTML = d.property;
            var g = document.createElement("div");
            g.appendChild(e);
            g.appendChild(d.domElement);
            e = n(b, g, f.before);
            h.addClass(e, z.CLASS_CONTROLLER_ROW);
            h.addClass(e,
                typeof d.getValue());
            f.tinker && h.addClass(e, "tinker");
            m(b, e, d);
            b.__controllers.push(d);
            return d
        }

        function n(a, b, c) {
            var d = document.createElement("li");
            b && d.appendChild(b);
            c ? a.__ul.insertBefore(d, params.before) : a.__ul.appendChild(d);
            a.onResize();
            return d
        }

        function m(a, c, f) {
            f.__li = c;
            f.__gui = a;
            k.extend(f, {
                options: function (b) {
                    if (1 < arguments.length) return f.remove(), y(a, f.object,
                        f.property, {
                            before: f.__li.nextElementSibling,
                            factoryArgs: [k.toArray(arguments)]
                        });
                    if (k.isArray(b) || k.isObject(b)) return f.remove(),
                        y(a, f.object, f.property, {
                            before: f.__li.nextElementSibling,
                            factoryArgs: [b]
                        })
                },
                name: function (a) {
                    f.__li.firstElementChild.firstElementChild.innerHTML =
                        a;
                    return f
                },
                listen: function () {
                    f.__gui.listen(f);
                    return f
                },
                remove: function () {
                    f.__gui.remove(f);
                    return f
                }
            });
            if (f instanceof l) {
                var g = new b(f.object, f.property, {
                    min: f.__min,
                    max: f.__max,
                    step: f.__step
                });
                f.attached = g;
                g.attached = f;
                k.each(b.prototype, function (a, b) {
                    var c = f[b],
                        d = g[b];
                    f[b] = g[b] = function () {
                        var a = Array.prototype.slice.call(arguments);
                        d.apply(g, a);
                        return c.apply(f,
                            a)
                    }
                });
                h.addClass(c, "has-slider");
                f.domElement.insertBefore(g.domElement, f.domElement.firstElementChild)
            } else if (f instanceof b) {
                var m = function (b) {
                    return k.isNumber(f.__min) && k.isNumber(f.__max) ? (f.remove(),
                        y(a, f.object, f.property, {
                            before: f.__li.nextElementSibling,
                            factoryArgs: [f.__min, f.__max, f.__step]
                        })) : b
                };
                f.min = k.compose(m, f.min);
                f.max = k.compose(m, f.max)
            } else f instanceof d ? (h.bind(c, "click", function () {
                    h.fakeEvent(f.__checkbox, "click")
                }), h.bind(f.__checkbox, "click", function (a) {
                    a.stopPropagation()
                })) :
                f instanceof e ? (h.bind(c, "click", function () {
                    h.fakeEvent(f.__button, "click")
                }), h.bind(c, "mouseover", function () {
                    h.addClass(f.__button, "hover")
                }), h.bind(c, "mouseout", function () {
                    h.removeClass(f.__button, "hover")
                })) : f instanceof q && (h.addClass(c, "color"), f.updateDisplay =
                    k.compose(function (a) {
                        c.style.borderLeftColor = f.__color.toString();
                        return a
                    }, f.updateDisplay), f.updateDisplay());
            f.setValue = k.compose(function (b) {
                a.getRoot()
                    .__preset_select && f.isModified() && A(a.getRoot(), !0);
                return b
            }, f.setValue)
        }

        function D(a,
            b) {
            var c = a.getRoot(),
                d = c.__rememberedObjects.indexOf(b.object);
            if (-1 != d) {
                var e = c.__rememberedObjectIndecesToControllers[d];
                void 0 === e && (e = {}, c.__rememberedObjectIndecesToControllers[
                    d] = e);
                e[b.property] = b;
                if (c.load && c.load.remembered) {
                    c = c.load.remembered;
                    if (c[a.preset]) c = c[a.preset];
                    else if (c[F]) c = c[F];
                    else return;
                    c[d] && void 0 !== c[d][b.property] && (d = c[d][b.property],
                        b.initialValue = k.isObject(d) ? _.clone(d) : d, b.setValue(
                            k.isObject(d) ? _.clone(d) : d))
                }
            }
        }

        function E(a, b) {
            var c = a.__save_row = document.createElement("li");
            h.addClass(a.domElement, "has-save");
            b || a.__ul.insertBefore(c, a.__ul.firstChild);
            h.addClass(c, "save-row");
            var d = document.createElement("span");
            d.innerHTML = "&nbsp;";
            h.addClass(d, "button gears");
            var e = document.createElement("span");
            e.innerHTML = "Save";
            h.addClass(e, "button");
            h.addClass(e, "save");
            var f = document.createElement("span");
            f.innerHTML = "New";
            h.addClass(f, "button");
            h.addClass(f, "save-as");
            var g = document.createElement("span");
            g.innerHTML = "Revert";
            h.addClass(g, "button");
            h.addClass(g, "revert");
            var l =
                a.__preset_select = document.createElement("select");
            a.load && a.load.remembered ? k.each(a.load.remembered, function (b,
                c) {
                J(a, c, c == a.preset)
            }) : J(a, F, !1);
            h.bind(l, "change", function () {
                for (var b = 0; b < a.__preset_select.length; b++) a.__preset_select[
                    b].innerHTML = a.__preset_select[b].value;
                a.preset = this.value
            });
            if (!b) {
                c.appendChild(l);
                c.appendChild(d);
                c.appendChild(e);
                c.appendChild(f);
                c.appendChild(g);
                if (v) {
                    var c = document.getElementById("dg-save-locally"),
                        m = document.getElementById("dg-local-explain");
                    c.style.display =
                        "block";
                    c = document.getElementById("dg-local-storage");
                    "true" === localStorage.getItem(document.location.href +
                        ".isLocal") && c.setAttribute("checked", "checked");
                    var p = function () {
                        m.style.display = a.useLocalStorage ? "block" :
                            "none"
                    };
                    p();
                    h.bind(c, "change", function () {
                        a.useLocalStorage = !a.useLocalStorage;
                        p()
                    })
                }
                var n = document.getElementById("dg-new-constructor");
                h.bind(n, "keydown", function (a) {
                    !a.metaKey || 67 !== a.which && 67 != a.keyCode || r.hide()
                });
                h.bind(d, "click", function () {
                    n.innerHTML = JSON.stringify(a.getSaveObject(),
                        void 0, 2);
                    r.show();
                    n.focus();
                    n.select()
                });
                h.bind(e, "click", function () {
                    a.save()
                });
                h.bind(f, "click", function () {
                    var b = prompt("Enter a new preset name.");
                    b && a.saveAs(b)
                });
                h.bind(g, "click", function () {
                    a.revert()
                })
            }
        }

        function B(a) {
            function b(f) {
                f.preventDefault();
                e = f.clientX;
                h.addClass(a.__closeButton, z.CLASS_DRAG);
                h.bind(window, "mousemove", c);
                h.bind(window, "mouseup", d);
                return !1
            }

            function c(b) {
                b.preventDefault();
                a.width += e - b.clientX;
                a.onResize();
                e = b.clientX;
                return !1
            }

            function d() {
                h.removeClass(a.__closeButton,
                    z.CLASS_DRAG);
                h.unbind(window, "mousemove", c);
                h.unbind(window, "mouseup", d)
            }
            a.__resize_handle = document.createElement("div");
            k.extend(a.__resize_handle.style, {
                width: "6px",
                marginLeft: "-3px",
                height: "200px",
                cursor: "ew-resize",
                position: "absolute"
            });
            var e;
            h.bind(a.__resize_handle, "mousedown", b);
            h.bind(a.__closeButton, "mousedown", b);
            a.domElement.insertBefore(a.__resize_handle, a.domElement.firstElementChild)
        }

        function g(a, b) {
            a.domElement.style.width = b + "px";
            a.__save_row && a.autoPlace && (a.__save_row.style.width =
                b + "px");
            a.__closeButton && (a.__closeButton.style.width = b + "px")
        }

        function C(a, b) {
            var c = {};
            k.each(a.__rememberedObjects, function (d, e) {
                var f = {},
                    g = a.__rememberedObjectIndecesToControllers[e];
                g || (g = {}, _.each(d, function (b, c) {
                    for (var d, e = 0, f = a.__controllers.length; e <
                        f; e++) {
                        var k = a.__controllers[e];
                        if (k.property === c) {
                            d = k;
                            break
                        }
                    }
                    d && (g[c] = d)
                }), a.__rememberedObjectIndecesToControllers[e] = g);
                k.each(g, function (a, c) {
                    var d = b ? a.initialValue : a.getValue();
                    f[c] = k.isObject(d) ? _.clone(d) : d
                });
                c[e] = f
            });
            return c
        }

        function J(a,
            b, c) {
            if (a.__preset_select) {
                var d = document.createElement("option");
                d.innerHTML = b;
                d.value = b;
                a.__preset_select.appendChild(d);
                c && (a.__preset_select.selectedIndex = a.__preset_select.length -
                    1)
            }
        }

        function A(a, b) {
            if (a.__preset_select) {
                var c = a.__preset_select[a.__preset_select.selectedIndex];
                c.innerHTML = b ? c.value + "*" : c.value
            }
        }

        function P(a) {
            0 != a.length && x(function () {
                P(a)
            });
            k.each(a, function (a) {
                a.updateDisplay()
            })
        }
        p = document.createElement("br");
        k.extend(p.style, {
            clear: "both",
            width: 0,
            height: 0,
            display: "block",
            lineHeight: 0,
            fontSize: 0,
            visibility: "hidden"
        });
        var F = "Default",
            v;
        try {
            v = "localStorage" in window && null !== window.localStorage
        } catch (N) {
            v = !1
        }
        var r, K = !0,
            L, H = !1,
            I = [],
            z = function (a) {
                function b() {
                    localStorage.setItem(document.location.href + ".gui", JSON.stringify(
                        d.getSaveObject()))
                }

                function c() {
                    var a = d.getRoot();
                    a.width += 1;
                    k.defer(function () {
                        a.width -= 1
                    })
                }
                var d = this;
                this.domElement = document.createElement("div");
                this.__ul = document.createElement("ul");
                this.domElement.appendChild(this.__ul);
                h.addClass(this.domElement,
                    "dg");
                this.__folders = {};
                this.__controllers = [];
                this.__rememberedObjects = [];
                this.__rememberedObjectIndecesToControllers = [];
                this.__listening = [];
                a = a || {};
                a = k.defaults(a, {
                    autoPlace: !0,
                    width: z.DEFAULT_WIDTH
                });
                a = k.defaults(a, {
                    resizable: a.autoPlace,
                    hideable: a.autoPlace
                });
                k.isUndefined(a.load) ? a.load = {
                    preset: F
                } : a.preset && (a.load.preset = a.preset);
                k.isUndefined(a.parent) && a.hideable && I.push(this);
                a.resizable = k.isUndefined(a.parent) && a.resizable;
                a.autoPlace && k.isUndefined(a.scrollable) && (a.scrollable = !
                    0);
                var e =
                    v && "true" === localStorage.getItem(document.location.href +
                        ".isLocal");
                Object.defineProperties(this, {
                    parent: {
                        get: function () {
                            return a.parent
                        }
                    },
                    scrollable: {
                        get: function () {
                            return a.scrollable
                        }
                    },
                    autoPlace: {
                        get: function () {
                            return a.autoPlace
                        }
                    },
                    preset: {
                        get: function () {
                            return d.parent ? d.getRoot()
                                .preset : a.load.preset
                        },
                        set: function (b) {
                            d.parent ? d.getRoot()
                                .preset = b : a.load.preset = b;
                            if (this.__preset_select)
                                for (b = 0; b < this.__preset_select.length; b++)
                                    this.__preset_select[b].value == this.preset &&
                                    (this.__preset_select.selectedIndex =
                                        b);
                            d.revert()
                        }
                    },
                    width: {
                        get: function () {
                            return a.width
                        },
                        set: function (b) {
                            a.width = b;
                            g(d, b)
                        }
                    },
                    name: {
                        get: function () {
                            return a.name
                        },
                        set: function (b) {
                            a.name = b;
                            l && (l.innerHTML = a.name)
                        }
                    },
                    closed: {
                        get: function () {
                            return a.closed
                        },
                        set: function (b) {
                            a.closed = b;
                            a.closed ? h.addClass(d.__ul, z.CLASS_CLOSED) :
                                h.removeClass(d.__ul, z.CLASS_CLOSED);
                            this.onResize();
                            d.__closeButton && (d.__closeButton.innerHTML =
                                b ? z.TEXT_OPEN : z.TEXT_CLOSED)
                        }
                    },
                    load: {
                        get: function () {
                            return a.load
                        }
                    },
                    useLocalStorage: {
                        get: function () {
                            return e
                        },
                        set: function (a) {
                            v &&
                                ((e = a) ? h.bind(window, "unload", b) : h.unbind(
                                window, "unload", b), localStorage.setItem(
                                document.location.href + ".isLocal", a))
                        }
                    }
                });
                if (k.isUndefined(a.parent)) {
                    a.closed = !1;
                    h.addClass(this.domElement, z.CLASS_MAIN);
                    h.makeSelectable(this.domElement, !1);
                    if (v && e) {
                        d.useLocalStorage = !0;
                        var f = localStorage.getItem(document.location.href +
                            ".gui");
                        f && (a.load = JSON.parse(f))
                    }
                    this.__closeButton = document.createElement("div");
                    this.__closeButton.innerHTML = z.TEXT_CLOSED;
                    h.addClass(this.__closeButton, z.CLASS_CLOSE_BUTTON);
                    this.domElement.appendChild(this.__closeButton);
                    h.bind(this.__closeButton, "click", function () {
                        d.closed ? d.open() : d.close()
                    })
                } else {
                    void 0 === a.closed && (a.closed = !0);
                    var l = document.createTextNode(a.name);
                    h.addClass(l, "controller-name");
                    f = n(d, l);
                    h.addClass(this.__ul, z.CLASS_CLOSED);
                    h.addClass(f, "title");
                    h.bind(f, "click", function (a) {
                        a.preventDefault();
                        d.closed ? d.open() : d.close();
                        return !1
                    });
                    a.closed || this.close()
                }
                a.autoPlace && (k.isUndefined(a.parent) && (K && (L = document.createElement(
                            "div"), L.style.zIndex = 1001, h.addClass(L,
                            "dg"), h.addClass(L, z.CLASS_AUTO_PLACE_CONTAINER),
                        document.body.appendChild(L), K = !1), L.appendChild(
                        this.domElement), h.addClass(this.domElement, z.CLASS_AUTO_PLACE)),
                    this.parent || g(d, a.width));
                h.bind(window, "resize", function () {
                    d.onResize()
                });
                h.bind(this.__ul, "webkitTransitionEnd", function () {
                    d.onResize()
                });
                h.bind(this.__ul, "transitionend", function () {
                    d.onResize()
                });
                h.bind(this.__ul, "oTransitionEnd", function () {
                    d.onResize()
                });
                this.onResize();
                a.resizable && B(this);
                d.getRoot();
                a.parent || c()
            };
        z.toggleHide = function () {
            H = !H;
            k.each(I, function (a) {
                a.domElement.style.display =
                    H ? "none" : "block"
            })
        };
        z.CLASS_AUTO_PLACE = "a";
        z.CLASS_AUTO_PLACE_CONTAINER = "ac";
        z.CLASS_MAIN = "main";
        z.CLASS_CONTROLLER_ROW = "cr";
        z.CLASS_TOO_TALL = "taller-than-window";
        z.CLASS_CLOSED = "closed";
        z.CLASS_CLOSE_BUTTON = "close-button";
        z.CLASS_DRAG = "drag";
        z.DEFAULT_WIDTH = 245;
        z.TEXT_CLOSED = "Close Controls";
        z.TEXT_OPEN = "Open Controls";
        h.bind(window, "keydown", function (a) {
            "text" === document.activeElement.type || 72 !== a.which && 72 !=
                a.keyCode || z.toggleHide()
        }, !1);
        k.extend(z.prototype, {
            add: function (a, b) {
                return y(this, a,
                    b, {
                        factoryArgs: Array.prototype.slice.call(
                            arguments, 2)
                    })
            },
            addColor: function (a, b) {
                return y(this, a, b, {
                    color: !0
                })
            },
            tinker: function (a, b) {
                return y(this, a, b, {
                    tinker: !0
                })
            },
            remove: function (a) {
                if (!a.__li.parentNode) return this;
                this.__ul.removeChild(a.__li);
                this.__controllers.slice(this.__controllers.indexOf(a), 1);
                var b = this;
                k.defer(function () {
                    b.onResize()
                })
            },
            hideController: function (a) {
                if (0 > this.__controllers.indexOf(a)) return this;
                if (a = a.__li) a.getAttribute("height") || a.setAttribute(
                    "height", h.getHeight(a) ||
                    27), k.extend(a.style, {
                    height: 0
                });
                return this
            },
            showController: function (a) {
                if (0 > this.__controllers.indexOf(a)) return this;
                (a = a.__li) && k.extend(a.style, {
                    height: a.getAttribute("height") + "px"
                });
                return this
            },
            destroy: function () {
                this.autoPlace && L.removeChild(this.domElement)
            },
            addFolder: function (a) {
                if (void 0 !== this.__folders[a]) throw Error(
                    'You already have a folder in this GUI by the name "' +
                    a + '"');
                var b = {
                    name: a,
                    parent: this
                };
                b.autoPlace = this.autoPlace;
                this.load && this.load.folders && this.load.folders[a] && (
                    b.closed =
                    this.load.folders[a].closed, b.load = this.load.folders[
                        a]);
                b = new z(b);
                this.__folders[a] = b;
                a = n(this, b.domElement);
                h.addClass(a, "folder");
                return b
            },
            open: function () {
                this.closed = !1
            },
            close: function () {
                this.closed = !0
            },
            onResize: function () {
                var a = this.getRoot();
                if (a.scrollable) {
                    var b = h.getOffset(a.__ul)
                        .top,
                        c = 0;
                    k.each(a.__ul.childNodes, function (b) {
                        a.autoPlace && b === a.__save_row || (c += h.getHeight(
                            b))
                    });
                    window.innerHeight - b - 20 < c ? (h.addClass(a.domElement,
                            z.CLASS_TOO_TALL), a.__ul.style.height = window
                        .innerHeight - b -
                        20 + "px") : (h.removeClass(a.domElement, z.CLASS_TOO_TALL),
                        a.__ul.style.height = "auto")
                }
                a.__resize_handle && k.defer(function () {
                    a.__resize_handle.style.height = a.__ul.offsetHeight +
                        "px"
                });
                a.__closeButton && (a.__closeButton.style.width = a.width +
                    "px")
            },
            remember: function (a, b) {
                !b && k.isUndefined(r) && (r = new t, r.domElement.innerHTML =
                    f);
                if (this.parent) throw Error(
                    "You can only call remember on a top level GUI.");
                0 == this.__rememberedObjects.length && E(this, !!b); - 1 ==
                    this.__rememberedObjects.indexOf(a) && this.__rememberedObjects
                    .push(a);
                this.autoPlace && g(this, this.width)
            },
            getRoot: function () {
                for (var a = this; a.parent;) a = a.parent;
                return a
            },
            getSaveObject: function () {
                var a = this.load;
                a.closed = this.closed;
                0 < this.__rememberedObjects.length && (a.preset = this.preset,
                    a.remembered || (a.remembered = {}), a.remembered[this.preset] =
                    C(this));
                a.folders = {};
                k.each(this.__folders, function (b, c) {
                    a.folders[c] = b.getSaveObject()
                });
                return a
            },
            save: function () {
                this.load.remembered || (this.load.remembered = {});
                this.load.remembered[this.preset] = C(this);
                A(this, !1)
            },
            saveAs: function (a) {
                this.load.remembered ||
                    (this.load.remembered = {}, this.load.remembered[F] = C(
                    this, !0));
                this.load.remembered[a] = C(this);
                this.preset = a;
                J(this, a, !0)
            },
            revert: function (a) {
                k.each(this.__controllers, function (b) {
                    this.getRoot()
                        .load.remembered ? D(a || this.getRoot(), b) :
                        b.setValue(b.initialValue)
                }, this);
                k.each(this.__folders, function (a) {
                    a.revert(a)
                });
                a || A(this.getRoot(), !1)
            },
            listen: function (a) {
                var b = 0 == this.__listening.length;
                this.__listening.push(a);
                b && P(this.__listening)
            }
        });
        return z
    });
define("dat/google/webfont/loader", ["underscore"], function () {
    return function (f) {
        window.WebFontConfig = window.WebFontConfig || {};
        _.extend(window.WebFontConfig, f);
        f = document.createElement("script");
        f.src = ("https:" == document.location.protocol ? "https" :
            "http") +
            "://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js";
        f.type = "text/javascript";
        f.async = "true";
        var a = document.getElementsByTagName("script")[0];
        a.parentNode.insertBefore(f, a)
    }
});
window.PR_SHOULD_USE_CONTINUATION = !0;
window.PR_TAB_WIDTH = 8;
window.PR_normalizedHtml = window.PR = window.prettyPrintOne = window.prettyPrint =
    void 0;
window._pr_isIE6 = function () {
    var f = navigator && navigator.userAgent && navigator.userAgent.match(
            /\bMSIE ([678])\./),
        f = f ? +f[1] : !1;
    window._pr_isIE6 = function () {
        return f
    };
    return f
};
(function () {
    function f(a) {
        return a.replace(C, "&amp;")
            .replace(J, "&lt;")
            .replace(A, "&gt;")
    }

    function a(b, c, d) {
        switch (b.nodeType) {
        case 1:
            var e = b.tagName.toLowerCase();
            c.push("<", e);
            var g = b.attributes,
                k = g.length;
            if (k) {
                if (d) {
                    for (var h = [], l = k; 0 <= --l;) h[l] = g[l];
                    h.sort(function (a, b) {
                        return a.name < b.name ? -1 : a.name === b.name ?
                            0 : 1
                    });
                    g = h
                }
                for (l = 0; l < k; ++l) h = g[l], h.specified && c.push(" ",
                    h.name.toLowerCase(), '="', h.value.replace(C,
                        "&amp;")
                    .replace(J, "&lt;")
                    .replace(A, "&gt;")
                    .replace(P, "&quot;"), '"')
            }
            c.push(">");
            for (g =
                b.firstChild; g; g = g.nextSibling) a(g, c, d);
            !b.firstChild && /^(?:br|link|img)$/.test(e) || c.push("</", e,
                ">");
            break;
        case 3:
        case 4:
            c.push(f(b.nodeValue))
        }
    }

    function c(a) {
        function b(a) {
            if ("\\" !== a.charAt(0)) return a.charCodeAt(0);
            switch (a.charAt(1)) {
            case "b":
                return 8;
            case "t":
                return 9;
            case "n":
                return 10;
            case "v":
                return 11;
            case "f":
                return 12;
            case "r":
                return 13;
            case "u":
            case "x":
                return parseInt(a.substring(2), 16) || a.charCodeAt(1);
            case "0":
            case "1":
            case "2":
            case "3":
            case "4":
            case "5":
            case "6":
            case "7":
                return parseInt(a.substring(1),
                    8);
            default:
                return a.charCodeAt(1)
            }
        }

        function c(a) {
            if (32 > a) return (16 > a ? "\\x0" : "\\x") + a.toString(16);
            a = String.fromCharCode(a);
            if ("\\" === a || "-" === a || "[" === a || "]" === a) a = "\\" +
                a;
            return a
        }

        function d(a) {
            var e = a.substring(1, a.length - 1)
                .match(RegExp(
                    "\\\\u[0-9A-Fa-f]{4}|\\\\x[0-9A-Fa-f]{2}|\\\\[0-3][0-7]{0,2}|\\\\[0-7]{1,2}|\\\\[\\s\\S]|-|[^-\\\\]",
                    "g"));
            a = [];
            for (var f = [], g = "^" === e[0], k = g ? 1 : 0, h = e.length; k <
                h; ++k) {
                var l = e[k];
                switch (l) {
                case "\\B":
                case "\\b":
                case "\\D":
                case "\\d":
                case "\\S":
                case "\\s":
                case "\\W":
                case "\\w":
                    a.push(l);
                    continue
                }
                var l = b(l),
                    m;
                k + 2 < h && "-" === e[k + 1] ? (m = b(e[k + 2]), k += 2) :
                    m = l;
                f.push([l, m]);
                65 > m || 122 < l || (65 > m || 90 < l || f.push([Math.max(
                        65, l) | 32, Math.min(m, 90) | 32]), 97 > m || 122 <
                    l || f.push([Math.max(97, l) & -33, Math.min(m, 122) &
                        -33
                    ]))
            }
            f.sort(function (a, b) {
                return a[0] - b[0] || b[1] - a[1]
            });
            e = [];
            l = [NaN, NaN];
            for (k = 0; k < f.length; ++k) h = f[k], h[0] <= l[1] + 1 ? l[1] =
                Math.max(l[1], h[1]) : e.push(l = h);
            f = ["["];
            g && f.push("^");
            f.push.apply(f, a);
            for (k = 0; k < e.length; ++k) h = e[k], f.push(c(h[0])), h[1] >
                h[0] && (h[1] + 1 > h[0] && f.push("-"), f.push(c(h[1])));
            f.push("]");
            return f.join("")
        }

        function e(a) {
            for (var b = a.source.match(RegExp(
                "(?:\\[(?:[^\\x5C\\x5D]|\\\\[\\s\\S])*\\]|\\\\u[A-Fa-f0-9]{4}|\\\\x[A-Fa-f0-9]{2}|\\\\[0-9]+|\\\\[^ux0-9]|\\(\\?[:!=]|[\\(\\)\\^]|[^\\x5B\\x5C\\(\\)\\^]+)",
                "g")), c = b.length, k = [], h = 0, l = 0; h < c; ++h) {
                var m = b[h];
                "(" === m ? ++l : "\\" === m.charAt(0) && (m = +m.substring(
                    1)) && m <= l && (k[m] = -1)
            }
            for (h = 1; h < k.length; ++h) - 1 === k[h] && (k[h] = ++f);
            for (l = h = 0; h < c; ++h) m = b[h], "(" === m ? (++l, void 0 ===
                    k[l] && (b[h] = "(?:")) : "\\" === m.charAt(0) && (m = +
                    m.substring(1)) &&
                m <= l && (b[h] = "\\" + k[l]);
            for (l = h = 0; h < c; ++h) "^" === b[h] && "^" !== b[h + 1] &&
                (b[h] = "");
            if (a.ignoreCase && g)
                for (h = 0; h < c; ++h) m = b[h], a = m.charAt(0), 2 <= m.length &&
                    "[" === a ? b[h] = d(m) : "\\" !== a && (b[h] = m.replace(
                        /[a-zA-Z]/g, function (a) {
                            a = a.charCodeAt(0);
                            return "[" + String.fromCharCode(a & -33, a |
                                32) + "]"
                        }));
            return b.join("")
        }
        for (var f = 0, g = !1, k = !1, h = 0, l = a.length; h < l; ++h) {
            var m = a[h];
            if (m.ignoreCase) k = !0;
            else if (/[a-z]/i.test(m.source.replace(
                /\\u[0-9a-f]{4}|\\x[0-9a-f]{2}|\\[^ux]/gi, ""))) {
                g = !0;
                k = !1;
                break
            }
        }
        for (var p = [], h = 0, l = a.length; h <
            l; ++h) {
            m = a[h];
            if (m.global || m.multiline) throw Error("" + m);
            p.push("(?:" + e(m) + ")")
        }
        return RegExp(p.join("|"), k ? "gi" : "g")
    }

    function d(a) {
        var b = 0;
        return function (c) {
            for (var d = null, e = 0, f = 0, g = c.length; f < g; ++f)
                switch (c.charAt(f)) {
                case "\t":
                    d || (d = []);
                    d.push(c.substring(e, f));
                    e = a - b % a;
                    for (b += e; 0 <= e; e -= 16) d.push(
                        "                ".substring(0, e));
                    e = f + 1;
                    break;
                case "\n":
                    b = 0;
                    break;
                default:
                    ++b
                }
            if (!d) return c;
            d.push(c.substring(e));
            return d.join("")
        }
    }

    function e(a, b, c, d) {
        b && (a = {
            source: b,
            basePos: a
        }, c(a), d.push.apply(d,
            a.decorations))
    }

    function b(a, b) {
        var d = {},
            f;
        (function () {
            for (var e = a.concat(b), g = [], h = {}, k = 0, l = e.length; k <
                l; ++k) {
                var m = e[k],
                    p = m[3];
                if (p)
                    for (var r = p.length; 0 <= --r;) d[p.charAt(r)] =
                        m;
                m = m[1];
                p = "" + m;
                h.hasOwnProperty(p) || (g.push(m), h[p] = null)
            }
            g.push(/[\0-\uffff]/);
            f = c(g)
        })();
        var g = b.length,
            h = function (a) {
                for (var c = a.basePos, k = [c, D], l = 0, m = a.source.match(
                    f) || [], p = {}, r = 0, s = m.length; r < s; ++r) {
                    var u = m[r],
                        n = p[u],
                        q = void 0,
                        t;
                    if ("string" === typeof n) t = !1;
                    else {
                        var v = d[u.charAt(0)];
                        if (v) q = u.match(v[1]), n = v[0];
                        else {
                            for (t =
                                0; t < g; ++t)
                                if (v = b[t], q = u.match(v[1])) {
                                    n = v[0];
                                    break
                                }
                            q || (n = D)
                        }!(t = 5 <= n.length && "lang-" === n.substring(0,
                            5)) || q && "string" === typeof q[1] || (t = !1,
                            n = E);
                        t || (p[u] = n)
                    }
                    v = l;
                    l += u.length;
                    if (t) {
                        t = q[1];
                        var x = u.indexOf(t),
                            y = x + t.length;
                        q[2] && (y = u.length - q[2].length, x = y - t.length);
                        n = n.substring(5);
                        e(c + v, u.substring(0, x), h, k);
                        e(c + v + x, t, w(n, t), k);
                        e(c + v + y, u.substring(y), h, k)
                    } else k.push(c + v, n)
                }
                a.decorations = k
            };
        return h
    }

    function l(a) {
        var c = [],
            d = [];
        a.tripleQuotedStrings ? c.push([t,
            /^(?:\'\'\'(?:[^\'\\]|\\[\s\S]|\'{1,2}(?=[^\']))*(?:\'\'\'|$)|\"\"\"(?:[^\"\\]|\\[\s\S]|\"{1,2}(?=[^\"]))*(?:\"\"\"|$)|\'(?:[^\\\']|\\[\s\S])*(?:\'|$)|\"(?:[^\\\"]|\\[\s\S])*(?:\"|$))/,
            null, "'\""
        ]) : a.multiLineStrings ? c.push([t,
            /^(?:\'(?:[^\\\']|\\[\s\S])*(?:\'|$)|\"(?:[^\\\"]|\\[\s\S])*(?:\"|$)|\`(?:[^\\\`]|\\[\s\S])*(?:\`|$))/,
            null, "'\"`"
        ]) : c.push([t,
            /^(?:\'(?:[^\\\'\r\n]|\\.)*(?:\'|$)|\"(?:[^\\\"\r\n]|\\.)*(?:\"|$))/,
            null, "\"'"
        ]);
        a.verbatimStrings && d.push([t, /^@\"(?:[^\"]|\"\")*(?:\"|$)/, null]);
        var e = a.hashComments;
        e && (a.cStyleComments ? (1 < e ? c.push([k,
            /^#(?:##(?:[^#]|#(?!##))*(?:###|$)|.*)/, null, "#"
        ]) : c.push([k,
            /^#(?:(?:define|elif|else|endif|error|ifdef|include|ifndef|line|pragma|undef|warning)\b|[^\r\n]*)/,
            null, "#"
        ]), d.push([t,
            /^<(?:(?:(?:\.\.\/)*|\/?)(?:[\w-]+(?:\/[\w-]+)+)?[\w-]+\.h|[a-z]\w*)>/,
            null
        ])) : c.push([k, /^#[^\r\n]*/, null, "#"]));
        a.cStyleComments && (d.push([k, /^\/\/[^\r\n]*/, null]), d.push([k,
            /^\/\*[\s\S]*?(?:\*\/|$)/, null
        ]));
        a.regexLiterals && d.push(["lang-regex", RegExp("^" + g +
            "(/(?=[^/*])(?:[^/\\x5B\\x5C]|\\x5C[\\s\\S]|\\x5B(?:[^\\x5C\\x5D]|\\x5C[\\s\\S])*(?:\\x5D|$))+/)"
        )]);
        a = a.keywords.replace(/^\s+|\s+$/g, "");
        a.length && d.push([h, RegExp("^(?:" + a.replace(/\s+/g, "|") +
            ")\\b"), null]);
        c.push([D,
            /^\s+/, null, " \r\n\t\u00a0"
        ]);
        d.push([n, /^@[a-z_$][a-z_$@0-9]*/i, null], [y,
            /^@?[A-Z]+[a-z][A-Za-z_$@0-9]*/, null
        ], [D, /^[a-z_$][a-z_$@0-9]*/i, null], [n,
            /^(?:0x[a-f0-9]+|(?:\d(?:_\d+)*\d*(?:\.\d*)?|\.\d\+)(?:e[+\-]?\d+)?)[a-z]*/i,
            null, "0123456789"
        ], [m, /^.[^\s\w\.$@\'\"\`\/\#]*/, null]);
        return b(c, d)
    }

    function p(a) {
        function b(a) {
            if (a > m) {
                p && p !== r && (l.push("</span>"), p = null);
                !p && r && (p = r, l.push('<span class="', p, '">'));
                var d = f(s(c.substring(m, a)))
                    .replace(x ? t : u, "$1&#160;");
                x = w.test(d);
                l.push(d.replace(v, z));
                m = a
            }
        }
        var c = a.source,
            e = a.extractedTags,
            g = a.decorations,
            h = a.numberLines,
            k = a.sourceNode,
            l = [],
            m = 0,
            p = null,
            r = null,
            n = 0,
            q = 0,
            s = d(window.PR_TAB_WIDTH),
            u = /([\r\n ]) /g,
            t = /(^| ) /gm,
            v = /\r\n?|\n/g,
            w = /[ \r\n]$/,
            x = !0,
            y = window._pr_isIE6(),
            k = y ? k && "PRE" === k.tagName ? 6 === y ? "&#160;\r\n" : 7 ===
            y ? "&#160;<br />\r" : 8 === y ? "&#160;<br />" : "&#160;\r" :
            "&#160;<br />" : "<br />",
            z;
        if (h) {
            for (var B = [], y = 0; 10 > y; ++y) B[y] = k +
                '</li><li class="L' + y + '">';
            var A = "number" === typeof h ? h - 1 : 0;
            l.push('<ol class="linenums"><li class="L', A % 10, '"');
            A &&
                l.push(' value="', A + 1, '"');
            l.push(">");
            z = function () {
                var a = B[++A % 10];
                return p ? "</span>" + a + '<span class="' + p + '">' : a
            }
        } else z = k;
        for (;;)
            if (n < e.length && (q < g.length ? e[n] <= g[q] : 1)) b(e[n]),
                p && (l.push("</span>"), p = null), l.push(e[n + 1]), n +=
                2;
            else if (q < g.length) b(g[q]), r = g[q + 1], q += 2;
        else break;
        b(c.length);
        p && l.push("</span>");
        h && l.push("</li></ol>");
        a.prettyPrintedHtml = l.join("")
    }

    function q(a, b) {
        for (var c = b.length; 0 <= --c;) {
            var d = b[c];
            W.hasOwnProperty(d) ? "console" in window && console.warn(
                "cannot override language handler %s",
                d) : W[d] = a
        }
    }

    function w(a, b) {
        a && W.hasOwnProperty(a) || (a = /^\s*</.test(b) ? "default-markup" :
            "default-code");
        return W[a]
    }

    function x(a) {
        var b, c = a.sourceCodeHtml,
            d = a.langExtension;
        a.prettyPrintedHtml = c;
        try {
            var e = c.match(z),
                c = [],
                f = 0,
                g = [];
            if (e)
                for (var h = 0, k = e.length; h < k; ++h) {
                    var l = e[h];
                    if (1 < l.length && "<" === l.charAt(0)) {
                        if (!s.test(l))
                            if (M.test(l)) c.push(l.substring(9, l.length -
                                3)), f += l.length - 12;
                            else if (T.test(l)) c.push("\n"), ++f;
                        else if (0 <= l.indexOf(B) && l.replace(
                                /\s(\w+)\s*=\s*(?:\"([^\"]*)\"|'([^\']*)'|(\S+))/g,
                                ' $1="$2$3$4"')
                            .match(
                                /[cC][lL][aA][sS][sS]=\"[^\"]*\bnocode\b/)) {
                            var m = l.match(U)[2],
                                n = 1,
                                q;
                            q = h + 1;
                            a: for (; q < k; ++q) {
                                var t = e[q].match(U);
                                if (t && t[2] === m)
                                    if ("/" === t[1]) {
                                        if (0 === --n) break a
                                    } else ++n
                            }
                            q < k ? (g.push(f, e.slice(h, q + 1)
                                .join("")), h = q) : g.push(f, l)
                        } else g.push(f, l)
                    } else {
                        var u;
                        var n = l,
                            y = n.indexOf("&");
                        if (0 > y) u = n;
                        else {
                            for (--y; 0 <= (y = n.indexOf("&#", y + 1));) {
                                var x = n.indexOf(";", y);
                                if (0 <= x) {
                                    var A = n.substring(y + 3, x),
                                        C = 10;
                                    A && "x" === A.charAt(0) && (A = A.substring(
                                        1), C = 16);
                                    var D = parseInt(A, C);
                                    isNaN(D) || (n = n.substring(0,
                                            y) + String.fromCharCode(D) + n
                                        .substring(x + 1))
                                }
                            }
                            u = n.replace(F, "<")
                                .replace(v, ">")
                                .replace(N, "'")
                                .replace(r, '"')
                                .replace(L, " ")
                                .replace(K, "&")
                        }
                        c.push(u);
                        f += u.length
                    }
                }
            b = c.join("");
            a.source = b;
            a.basePos = 0;
            a.extractedTags = g;
            w(d, b)(a);
            p(a)
        } catch (E) {
            "console" in window && console.log(E && E.stack ? E.stack : E)
        }
    }
    var t = "str",
        h = "kwd",
        k = "com",
        y = "typ",
        n = "lit",
        m = "pun",
        D = "pln",
        E = "src",
        B = "nocode",
        g = function () {
            for (var a =
                "! != !== # % %= & && &&= &= ( * *= += , -= -> / /= : :: ; < << <<= <= = == === > >= >> >>= >>> >>>= ? @ [ ^ ^= ^^ ^^= { | |= || ||= ~ break case continue delete do else finally instanceof return throw try typeof"
                .split(" "),
                b = "(?:^^|[+-]", c = 0; c < a.length; ++c) b += "|" + a[c]
                .replace(/([^=<>:&a-z])/g, "\\$1");
            return b + ")\\s*"
        }(),
        C = /&/g,
        J = /</g,
        A = />/g,
        P = /\"/g,
        F = /&lt;/g,
        v = /&gt;/g,
        N = /&apos;/g,
        r = /&quot;/g,
        K = /&amp;/g,
        L = /&nbsp;/g,
        H = /[\r\n]/g,
        I = null,
        z = RegExp(
            "[^<]+|\x3c!--[\\s\\S]*?--\x3e|<!\\[CDATA\\[[\\s\\S]*?\\]\\]>|</?[a-zA-Z](?:[^>\"']|'[^']*'|\"[^\"]*\")*>|<",
            "g"),
        s = /^<\!--/,
        M = /^<!\[CDATA\[/,
        T = /^<br\b/i,
        U = /^<(\/?)([a-zA-Z][a-zA-Z0-9]*)/,
        ba = l({
            keywords: "break continue do else for if return while auto case char const default double enum extern float goto int long register short signed sizeof static struct switch typedef union unsigned void volatile catch class delete false import new operator private protected public this throw true try typeof alignof align_union asm axiom bool concept concept_map const_cast constexpr decltype dynamic_cast explicit export friend inline late_check mutable namespace nullptr reinterpret_cast static_assert static_cast template typeid typename using virtual wchar_t where break continue do else for if return while auto case char const default double enum extern float goto int long register short signed sizeof static struct switch typedef union unsigned void volatile catch class delete false import new operator private protected public this throw true try typeof abstract boolean byte extends final finally implements import instanceof null native package strictfp super synchronized throws transient as base by checked decimal delegate descending dynamic event fixed foreach from group implicit in interface internal into is lock object out override orderby params partial readonly ref sbyte sealed stackalloc string select uint ulong unchecked unsafe ushort var break continue do else for if return while auto case char const default double enum extern float goto int long register short signed sizeof static struct switch typedef union unsigned void volatile catch class delete false import new operator private protected public this throw true try typeof debugger eval export function get null set undefined var with Infinity NaN caller delete die do dump elsif eval exit foreach for goto if import last local my next no our print package redo require sub undef unless until use wantarray while BEGIN END break continue do else for if return while and as assert class def del elif except exec finally from global import in is lambda nonlocal not or pass print raise try with yield False True None break continue do else for if return while alias and begin case class def defined elsif end ensure false in module next nil not or redo rescue retry self super then true undef unless until when yield BEGIN END break continue do else for if return while case done elif esac eval fi function in local set then until ",
            hashComments: !0,
            cStyleComments: !0,
            multiLineStrings: !0,
            regexLiterals: !0
        }),
        W = {};
    q(ba, ["default-code"]);
    q(b([], [
        [D, /^[^<?]+/],
        ["dec", /^<!\w[^>]*(?:>|$)/],
        [k, /^<\!--[\s\S]*?(?:-\->|$)/],
        ["lang-", /^<\?([\s\S]+?)(?:\?>|$)/],
        ["lang-", /^<%([\s\S]+?)(?:%>|$)/],
        [m, /^(?:<[%?]|[%?]>)/],
        ["lang-", /^<xmp\b[^>]*>([\s\S]+?)<\/xmp\b[^>]*>/i],
        ["lang-js",
            /^<script\b[^>]*>([\s\S]*?)(<\/script\b[^>]*>)/i
        ],
        ["lang-css", /^<style\b[^>]*>([\s\S]*?)(<\/style\b[^>]*>)/i],
        ["lang-in.tag", /^(<\/?[a-z][^<>]*>)/i]
    ]), "default-markup htm html mxml xhtml xml xsl".split(" "));
    q(b([
        [D, /^[\s]+/, null, " \t\r\n"],
        ["atv", /^(?:\"[^\"]*\"?|\'[^\']*\'?)/, null, "\"'"]
    ], [
        ["tag", /^^<\/?[a-z](?:[\w.:-]*\w)?|\/?>$/i],
        ["atn", /^(?!style[\s=]|on)[a-z](?:[\w:-]*\w)?/i],
        ["lang-uq.val",
            /^=\s*([^>\'\"\s]*(?:[^>\'\"\s\/]|\/(?=\s)))/
        ],
        [m, /^[=<>\/]+/],
        ["lang-js", /^on\w+\s*=\s*\"([^\"]+)\"/i],
        ["lang-js", /^on\w+\s*=\s*\'([^\']+)\'/i],
        ["lang-js", /^on\w+\s*=\s*([^\"\'>\s]+)/i],
        ["lang-css", /^style\s*=\s*\"([^\"]+)\"/i],
        ["lang-css", /^style\s*=\s*\'([^\']+)\'/i],
        ["lang-css", /^style\s*=\s*([^\"\'>\s]+)/i]
    ]), ["in.tag"]);
    q(b([], [
        ["atv", /^[\s\S]+/]
    ]), ["uq.val"]);
    q(l({
        keywords: "break continue do else for if return while auto case char const default double enum extern float goto int long register short signed sizeof static struct switch typedef union unsigned void volatile catch class delete false import new operator private protected public this throw true try typeof alignof align_union asm axiom bool concept concept_map const_cast constexpr decltype dynamic_cast explicit export friend inline late_check mutable namespace nullptr reinterpret_cast static_assert static_cast template typeid typename using virtual wchar_t where ",
        hashComments: !0,
        cStyleComments: !0
    }), "c cc cpp cxx cyc m".split(" "));
    q(l({
        keywords: "null true false"
    }), ["json"]);
    q(l({
        keywords: "break continue do else for if return while auto case char const default double enum extern float goto int long register short signed sizeof static struct switch typedef union unsigned void volatile catch class delete false import new operator private protected public this throw true try typeof abstract boolean byte extends final finally implements import instanceof null native package strictfp super synchronized throws transient as base by checked decimal delegate descending dynamic event fixed foreach from group implicit in interface internal into is lock object out override orderby params partial readonly ref sbyte sealed stackalloc string select uint ulong unchecked unsafe ushort var ",
        hashComments: !0,
        cStyleComments: !0,
        verbatimStrings: !0
    }), ["cs"]);
    q(l({
        keywords: "break continue do else for if return while auto case char const default double enum extern float goto int long register short signed sizeof static struct switch typedef union unsigned void volatile catch class delete false import new operator private protected public this throw true try typeof abstract boolean byte extends final finally implements import instanceof null native package strictfp super synchronized throws transient ",
        cStyleComments: !0
    }), ["java"]);
    q(l({
        keywords: "break continue do else for if return while case done elif esac eval fi function in local set then until ",
        hashComments: !0,
        multiLineStrings: !0
    }), ["bsh", "csh", "sh"]);
    q(l({
        keywords: "break continue do else for if return while and as assert class def del elif except exec finally from global import in is lambda nonlocal not or pass print raise try with yield False True None ",
        hashComments: !0,
        multiLineStrings: !0,
        tripleQuotedStrings: !0
    }), ["cv", "py"]);
    q(l({
        keywords: "caller delete die do dump elsif eval exit foreach for goto if import last local my next no our print package redo require sub undef unless until use wantarray while BEGIN END ",
        hashComments: !0,
        multiLineStrings: !0,
        regexLiterals: !0
    }), ["perl", "pl", "pm"]);
    q(l({
        keywords: "break continue do else for if return while alias and begin case class def defined elsif end ensure false in module next nil not or redo rescue retry self super then true undef unless until when yield BEGIN END ",
        hashComments: !0,
        multiLineStrings: !0,
        regexLiterals: !0
    }), ["rb"]);
    q(l({
        keywords: "break continue do else for if return while auto case char const default double enum extern float goto int long register short signed sizeof static struct switch typedef union unsigned void volatile catch class delete false import new operator private protected public this throw true try typeof debugger eval export function get null set undefined var with Infinity NaN ",
        cStyleComments: !0,
        regexLiterals: !0
    }), ["js"]);
    q(l({
        keywords: "all and by catch class else extends false finally for if in is isnt loop new no not null of off on or return super then true try unless until when while yes ",
        hashComments: 3,
        cStyleComments: !0,
        multilineStrings: !0,
        tripleQuotedStrings: !0,
        regexLiterals: !0
    }), ["coffee"]);
    q(b([], [
        [t, /^[\s\S]+/]
    ]), ["regex"]);
    window.PR_normalizedHtml = a;
    window.prettyPrintOne = function (a, b, c) {
        a = {
            sourceCodeHtml: a,
            langExtension: b,
            numberLines: c
        };
        x(a);
        return a.prettyPrintedHtml
    };
    window.prettyPrint = function (b) {
        function c() {
            for (var d = window.PR_SHOULD_USE_CONTINUATION ? l.now() + 250 :
                Infinity; m < e.length && l.now() < d; m++) {
                var g = e[m];
                if (g.className && 0 <= g.className.indexOf("prettyprint")) {
                    var h = g.className.match(/\blang-(\w+)\b/);
                    h && (h = h[1]);
                    for (var k = !1, n = g.parentNode; n; n = n.parentNode)
                        if (("pre" === n.tagName || "code" === n.tagName ||
                                "xmp" === n.tagName) && n.className && 0 <=
                            n.className.indexOf("prettyprint")) {
                            k = !0;
                            break
                        }
                    if (!k) {
                        n = g;
                        null === I && (k = document.createElement("PRE"), k
                            .appendChild(document.createTextNode(
                                '<!DOCTYPE foo PUBLIC "foo bar">\n<foo />'
                            )),
                            I = !/</.test(k.innerHTML));
                        if (I)
                            if (k = n.innerHTML, "XMP" === n.tagName) k = f(
                                k);
                            else {
                                if ("PRE" !== n.tagName && H.test(k)) {
                                    var q = "";
                                    n.currentStyle ? q = n.currentStyle.whiteSpace :
                                        window.getComputedStyle && (q =
                                            window.getComputedStyle(n, null)
                                            .whiteSpace);
                                    n = !q || "pre" === q
                                } else n = !0;
                                n || (k = k.replace(/(<br\s*\/?>)[\r\n]+/g,
                                        "$1")
                                    .replace(/(?:[\r\n]+[ \t]*)+/g, " "))
                            } else {
                            k = [];
                            for (n = n.firstChild; n; n = n.nextSibling) a(
                                n, k);
                            k = k.join("")
                        }
                        k = k.replace(/(?:\r\n?|\n)$/, "");
                        n = g.className.match(/\blinenums\b(?::(\d+))?/);
                        p = {
                            sourceCodeHtml: k,
                            langExtension: h,
                            sourceNode: g,
                            numberLines: n ? n[1] && n[1].length ? +n[1] :
                                !0 : !1
                        };
                        x(p);
                        if (g = p.prettyPrintedHtml)
                            if (h = p.sourceNode, "XMP" === h.tagName) {
                                k = document.createElement("PRE");
                                for (n = 0; n < h.attributes.length; ++n) q =
                                    h.attributes[n], q.specified && (
                                        "class" === q.name.toLowerCase() ?
                                        k.className = q.value : k.setAttribute(
                                            q.name, q.value));
                                k.innerHTML = g;
                                h.parentNode.replaceChild(k, h)
                            } else h.innerHTML = g
                    }
                }
            }
            m < e.length ? setTimeout(c, 250) : b && b()
        }
        for (var d = [document.getElementsByTagName("pre"), document.getElementsByTagName(
                "code"),
            document.getElementsByTagName("xmp")
        ], e = [], g = 0; g < d.length; ++g)
            for (var h = 0, k = d[g].length; h < k; ++h) e.push(d[g][h]);
        var d = null,
            l = Date;
        l.now || (l = {
            now: function () {
                return (new Date)
                    .getTime()
            }
        });
        var m = 0,
            p;
        c()
    };
    window.PR = {
        combinePrefixPatterns: c,
        createSimpleLexer: b,
        registerLangHandler: q,
        sourceDecorator: l,
        PR_ATTRIB_NAME: "atn",
        PR_ATTRIB_VALUE: "atv",
        PR_COMMENT: k,
        PR_DECLARATION: "dec",
        PR_KEYWORD: h,
        PR_LITERAL: n,
        PR_NOCODE: B,
        PR_PLAIN: D,
        PR_PUNCTUATION: m,
        PR_SOURCE: E,
        PR_STRING: t,
        PR_TAG: "tag",
        PR_TYPE: y
    }
})();
define("prettyprint", function () {});
require({
    paths: {
        prettyprint: "../third-party/prettify",
        text: "../third-party/requirejs/text",
        underscore: "../third-party/underscore",
        order: "../third-party/requirejs/order"
    },
    baseUrl: "../../",
    priority: ["underscore"]
});
require(
    "dat/slides/Slides dat/dom/dom text!examples/gui/contents.html dat/gui/GUI workshop/fizzyText dat/utils/utils dat/google/webfont/loader examples/utils/utils underscore prettyprint"
    .split(" "), function (f, a, c, d, e, b, l, p) {
        l({
            google: {
                families: ["Terminal Dosis:300,500,700"]
            }
        });
        c = c.split("<article>");
        c.splice(0, 1);
        c[c.length - 1] = c[c.length - 1].replace(
            /\<\/body\>(\n|\r\n)\<\/html\>/, "");
        var q = new f({
            autoUI: !0
        });
        document.body.appendChild(q.domElement);
        var w = [],
            x = [];
        q.domElement.style.visibility = "hidden";
        var t = [, "constrain", "folders", "colors!", "saving", , "events"];
        _.each(c, function (b, f) {
            var l = {
                autoPlace: !1,
                resizable: !0,
                scrollable: !0,
                hideable: !0
            };
            5 == f && (l.load = {
                preset: "Flow",
                remembered: {
                    Default: {
                        0: {
                            message: "dat.gui",
                            speed: 0.4,
                            growthSpeed: 0.37,
                            noiseStrength: 10,
                            maxSize: 6.4
                        }
                    },
                    Flow: {
                        0: {
                            message: "Doesn't really matter.",
                            speed: 1.76,
                            growthSpeed: 0.21,
                            noiseStrength: 88,
                            maxSize: 6.4
                        }
                    },
                    Slow: {
                        0: {
                            message: "SLOW",
                            speed: 0.12,
                            growthSpeed: 0.08,
                            noiseStrength: 13,
                            maxSize: 10
                        }
                    }
                },
                closed: !1,
                folders: {}
            });
            w.push(new d(l));
            l = new e(t[f] ||
                "dat.gui", 600, 150, !0, 100);
            l.maxSize *= 0.8;
            x.push(l);
            var n = w[f],
                m = x[f],
                l = function () {
                    m.render(!0)
                };
            _.extend(n.domElement.style, {
                position: "absolute",
                width: d.DEFAULT_WIDTH + "px",
                top: "0px",
                right: "20px"
            });
            var D = document.createElement("div");
            a.addClass(D, "content");
            D.innerHTML = b;
            D.appendChild(p.makeFooter(f, c, q));
            D.insertBefore(m.domElement, D.firstChild);
            D.insertBefore(n.domElement, m.domElement);
            switch (f) {
            case 0:
                n.add(m, "message");
                n.add(m, "speed", -5, 5);
                n.add(m, "displayOutline");
                n.add(m, "explode");
                break;
            case 1:
                m.noiseStrength =
                    10;
                m.growthSpeed = 0.2;
                m.maxSize = 6;
                m.speed = 0.1;
                n.add(m, "noiseStrength")
                    .step(5);
                n.add(m, "growthSpeed", -5, 5);
                n.add(m, "maxSize")
                    .min(0)
                    .step(0.25);
                n.add(m, "message", ["constrain", "pizza", "chrome"]);
                n.add(m, "speed", {
                    Stopped: 0,
                    Slow: 0.1,
                    Fast: 5
                });
                break;
            case 2:
                m.growthSpeed = 0.2;
                m.maxSize = 10;
                m.speed = 0.4;
                var E = n.addFolder("Flow Field");
                E.add(m, "speed");
                E.add(m, "noiseStrength");
                n = n.addFolder("Letters");
                n.open();
                n.add(m, "growthSpeed");
                n.add(m, "maxSize");
                n.add(m, "message");
                break;
            case 3:
                m.color0 = "#00d3e1";
                m.color1 =
                    "#ffffff";
                m.color2 = "#fff000";
                m.color3 = "#000000";
                n.addColor(m, "color0");
                n.addColor(m, "color1");
                n.addColor(m, "color2");
                n.addColor(m, "color3");
                break;
            case 4:
                n.remember(m);
                n.add(m, "message");
                n.add(m, "speed", 0, 4);
                n.add(m, "growthSpeed", 0, 1);
                n.add(m, "noiseStrength", 0, 170);
                n.add(m, "maxSize", 0, 10);
                break;
            case 5:
                n.remember(m);
                n.add(m, "message");
                n.add(m, "speed", 0, 4);
                n.add(m, "growthSpeed", 0, 1);
                n.add(m, "noiseStrength", 0, 170);
                n.add(m, "maxSize", 0, 10);
                window.gg = n;
                break;
            case 6:
                n.add(m, "maxSize", 0, 10)
                    .onFinishChange(function (a) {
                        alert("The new value is " +
                            a)
                    });
                break;
            case 7:
                n.add(m, "message");
                n.add(m, "speed", 0, 5);
                n.domElement.style.cssText =
                    "position: absolute; -moz-transform: rotate(20deg);    -moz-transform-origin: 60% 100%;    -webkit-transform: rotate(20deg);    -webkit-transform-origin: 60% 100%;    -o-transform: rotate(20deg);     -o-transform-origin:60% 100%;    -ms-transform: rotate(20deg);    -ms-transform-origin: 60% 100%;    transform: rotate(20deg);    transform-origin: 60% 100%;";
                break;
            case 8:
                n.add(m, "noiseStrength", 0, 100)
                    .listen();
                l = _.compose(l,
                    function () {
                        m.noiseStrength = 50 * Math.cos(Date.now() / 1E3) +
                            50
                    });
                break;
            case 9:
                n.add(m, "noiseStrength", 0, 100)
                    .listen();
                l = _.compose(l, function () {
                    m.noiseStrength = 50 * Math.cos(Date.now() / 1E3) +
                        50
                });
                break;
            default:
                n.add(m, "message"), n.add(m, "speed")
            }
            m.domElement.setAttribute("id", "fizzy-" + f);
            q.add(D, l)
        });
        f = document.createElement("div");
        _.extend(f.style, {
            background: "url(/img/itgivesyouthis.gif) no-repeat",
            width: "130px",
            zIndex: -1,
            height: "95px",
            position: "absolute",
            top: "137px",
            right: "70px"
        });
        b = q.domElement.firstElementChild.firstElementChild;
        b.insertBefore(f, b.firstElementChild);
        (function (b) {
            var c = document.createElement("div");
            c.setAttribute("id", "downloads");
            a.addClass(c, "last");
            a.makeSelectable(c, !1);
            c.innerHTML =
                '<ul><li class="source"><a href="https://github.com/dataarts/dat.gui">Source</a></li><li class="min-dot-js"><a href="https://raw.github.com/dataarts/dat.gui/master/build/dat.gui.min.js">dat.gui.min.js</a></li><li class="dot-js"><a href="https://raw.github.com/dataarts/dat.gui/master/build/dat.gui.js">dat.gui.js</a></li></ul>';
            b.appendChild(c);
            b = b.getElementsByClassName("slides")[0];
            var d = a.getHeight(c);
            _.each(b.children, function (a) {
                a.getElementsByClassName("content")[0].style.paddingBottom =
                    d + "px"
            })
        })(document.body);
        p.addBackButton(q.navContainer.firstChild);
        p.addTableOfContents(document.getElementById("dat-slides-toc"), q);
        _.delay(function () {
            q.domElement.style.visibility = "visible";
            prettyPrint()
        }, 250)
    });
define("mainLib", function () {});
