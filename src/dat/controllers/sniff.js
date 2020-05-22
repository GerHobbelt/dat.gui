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

//
// OBSOLETE STUFF?
//
// old v0.4 code which needs to be integrated or otherwise thrown away
//

// var common = require('../utils/common');

// module.exports = function(object, property, args) {
//     var initialValue = object[property];

//     if (args[0]) {
//         // if we're given a controller, return it
//          return args[0];
//     }

//     if (common.isUndefined(initialValue)) {
//         return 'undefined';
//     }

//     if (common.isNull(initialValue)) {
//         return 'null';
//     }

//     if (common.isArray(args[0]) || common.isObject(args[0])) {
//         return 'option'
//     }

//     if (common.isNumber(initialValue)) {
//         if (common.isNumber(args[0]) && common.isNumber(args[1])) {
//             return 'numberSlider';
// 		} else {
// 			return 'numberBox';
// 		}
// 	}
//     if (common.isString(initialValue)) {
//         return 'string';
//     }

//     if (common.isFunction(initialValue)) {
//         return 'function';
//     }

//     if (common.isBoolean(initialValue)) {
//         return 'boolean';
//     }
// }
