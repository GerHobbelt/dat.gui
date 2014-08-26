/**
 * Created by pery on 16/08/14.
 */

define([
    'dat/controllers/Controller',
    'dat/dom/dom',
    'dat/utils/css',
    'dat/utils/common',
    'text!dat/controllers/ImageController.css'
], function(Controller, dom, css, common, styleSheet) {

    /**
     * @class Provides a image/file input to alter the  url property on an object
     *
     * @extends dat.controllers.Controller
     *
     * @param {Object} object The object to be manipulated
     * @param {string} property The name of the property to be manipulated
     *
     * @member dat.controllers
     */
    function ImageController(Object, property){

        ImageController.superclass.call(this, Object, property);

        var _this = this;

        this.__input = document.createElement('input');
        this.__input.setAttribute('type', 'file');
        this.__input.style.display = 'none';

        this.__label = document.createElement('label');
        this.__label.innerText = this.getValue();
        this.__label.appendChild(this.__input);

        this.__previewImage = document.createElement('img');

        dom.addClass(this.__previewImage, 'GUI-preview-image');
        dom.addClass(this.__label, 'GUI-label-image');

        dom.bind(this.__input, 'change', onChange);
        //todo: bind onDragRelease

        function onChange() {
            var file = _this.__input.files[0];
            var url = URL.createObjectURL(file);
            _this.__previewImage.src = url;
            _this.setValue( url );


            if (_this.__onFinishChange) {
                _this.__onFinishChange.call(_this, _this.getValue());
            }
        }
        this.updateDisplay();
        this.domElement.appendChild(this.__previewImage);
        this.domElement.appendChild(this.__label);
    }

    ImageController.superclass = Controller;

    /**
     * Injects default stylesheet for slider elements.
     */
    ImageController.useDefaultStyles = function() {
        css.inject(styleSheet);
    };

    common.extend(
        ImageController.prototype,
        Controller.prototype,

        {
            updateDisplay: function() {
                this.__previewImage.src = this.getValue();
                return ImageController.superclass.prototype.updateDisplay.call(this);
            }
        }
    )


    return ImageController;
});