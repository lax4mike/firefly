import { connect } from "react-redux";

import { getFireflies }        from "../redux/modules/fireflies-selectors.js";
import { logBlink }            from "../redux/modules/blink-log.js";
import { setCanvasDimensions } from "../redux/modules/canvas.js";
import { updateFlashlight  }   from "../redux/modules/flashlight.js";
import {
    setFireflyPosition,
    addBoxOfFireflies } from "../redux/modules/fireflies.js";

import Canvas from "./Canvas.jsx";

function mapStateToProps(state){
    return {
        fireflies       : getFireflies(state),
        signalRadius    : state.signalRadius.radius,
        showSignalRadius: state.signalRadius.isVisible,
        blinkStatus     : state.blinkStatus,
        debug           : state.debug,
        flashlight      : state.flashlight
    };
}

function mapDispatchToProps(dispatch, ownProps){
    return {
        onResize: function({width, height}){
            dispatch(
                setCanvasDimensions({width, height})
            );
        },
        onInit: function({width, height}){
            dispatch(
                addBoxOfFireflies({width, height})
            );
        },
        onFlashlightUpdate: function(flashlight){
            dispatch(
                updateFlashlight(flashlight)
            );
        },
        onFireflyBlink: function(firefly){
            dispatch(
                logBlink(firefly)
            );
        },
        onFireflyDrag: function(fireflyId, x, y){
            dispatch(
                setFireflyPosition({
                    fireflyId, x, y
                })
            );
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Canvas);
