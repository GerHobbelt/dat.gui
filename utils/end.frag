    var dat = {
        utils: {
            css: dat_utils_css,
            common: dat_utils_common,
            requestAnimationFrame: dat_utils_requestAnimationFrame,
        },
        controller: {
            Controller: dat_controllers_Controller,
            OptionController: dat_controllers_OptionController,
            NumberController: dat_controllers_NumberController,
            NumberControllerBox: dat_controllers_NumberControllerBox,
            NumberControllerSlider: dat_controllers_NumberControllerSlider,
            StringController: dat_controllers_StringController,
            FunctionController: dat_controllers_FunctionController,
            BooleanController: dat_controllers_BooleanController,
            ImageController: dat_controllers_ImageController,
            ColorController: dat_controllers_ColorController,
            factory: dat_controllers_factory,
        },
        dom: {
            dom: dat_dom_dom,
            CenteredDiv: dat_dom_CenteredDiv,
        },
        color: {
            toString: dat_color_toString,
            interpret: dat_color_interpret,
            math: dat_color_math,
            Color: dat_color_Color,
        },
        gui: {
            GUI: dat_gui_GUI
        }
    };

    return dat;
}));

