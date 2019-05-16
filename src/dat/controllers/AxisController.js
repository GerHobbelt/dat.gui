import Controller from './Controller';
import dom from '../dom/dom';

/**
 * @class Represents a given property of an object that is a 2D Vector,
 * contains a minimum and maximum, and provides a 2D axis slider elment
 * with which to manipulate it.
 *
 * @extends dat.controllers.Controller
 *
 * @param {Object} object The object to be manipulated
 * @param {string} property The name of the projerty to be manipulated
 * @param {Number|Number[]} minValues The minimum allowed values, either a number
 * in which the values for X and Y will be the same, or [minX, minY] 
 * @param {Number|Number[]} maxValues The maximum allowed values, either a number
 * in which the values for X and Y will be the same, or [maxX, maxY] 
 * @param {Number|Number[]} stepValues The increment by which to changet the values,
 * either a number in which the values for X and Y will be the same, or [stepX, stepY]
 *
 * @member dat.controllers 
 */
class AxisController extends Controller {
  constructor(object, property, min, map, step) {
    super(object, property, { min, max, step });
    const _this = this;

    this.domElement = document.createElement('div');

    
  }
}

export default AxisController;
