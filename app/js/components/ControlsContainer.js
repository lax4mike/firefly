import { connect } from "react-redux";

import Controls from "./Controls.jsx";

import { updateRadius, toggleVisbility } from "../redux/modules/signalRadius.js";
import { setFireflyBlink }               from "../redux/modules/fireflies-blink-status.js";
import { updateFlashlight }              from "../redux/modules/flashlight.js";
import { toggleDebug }                   from "../redux/modules/debug.js";

function mapStateToProps(state) {
    return {
        signalRadius     : state.signalRadius.radius,
        showSignalRadius : state.signalRadius.isVisible,
        blinkStatus      : state.blinkStatus,
        debug            : state.debug,
        flashlight       : state.flashlight
    };
}

function mapDispatchToProps(dispatch, ownProps) {
    return {
        onSignalRadiusChange: function(radius){
            dispatch( updateRadius(radius) );
        },
        onSignalRadiusVisibilityChange: function(bool){
            dispatch( toggleVisbility(bool) );
        },
        onBlinkStatusChange: function(status){
            dispatch( setFireflyBlink(status) );
        },
        onDebugChange: function(bool){
            dispatch( toggleDebug(bool) );
        },
        onFlashlightChange: function(flashlight){
            dispatch( updateFlashlight(flashlight) );
        }
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Controls);
