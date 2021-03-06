import { connect } from "react-redux";

import { getFireflies }        from "../redux/modules/fireflies/firefliesSelectors.js";
import { setCanvasDimensions } from "../redux/modules/canvas.js";
import { updateFlashlight  }   from "../redux/modules/flashlight.js";
import { setDebugFirefly  }    from "../redux/modules/debug.js";
import {
    addFirefly,
    deleteFirefly,
    setFireflyPosition,
    addBoxOfFireflies,
    addTrianglePatternOfFireflies } from "../redux/modules/fireflies/firefliesActions.js";

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
                addTrianglePatternOfFireflies({width, height})
                // addBoxOfFireflies({width, height})
            );
        },
        onFlashlightUpdate: function(flashlight){
            dispatch(
                updateFlashlight(flashlight)
            );
        },
        onFireflyDrag: function(fireflyId, x, y){
            dispatch(
                setFireflyPosition({
                    fireflyId, x, y
                })
            );
        },
        onFireflyAdd: function(firefly){
            dispatch(
                addFirefly(firefly)
            );
        },
        onFireflyClick: function(fireflyId){
            dispatch(
                setDebugFirefly(fireflyId)
            );
        },
        onFireflyDelete: function(id){
            dispatch(
                deleteFirefly(id)
            );
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Canvas);
