import { connect } from "react-redux";

import Controls from "./Controls.jsx";

import { updateRadius,
         toggleVisbility }      from "../redux/modules/signalRadius.js";
import { setBlinkStatus }       from "../redux/modules/blinkStatus.js";
import { updateFlashlight }     from "../redux/modules/flashlight.js";
import { toggleDebug }          from "../redux/modules/debug.js";
import { resetTime }            from "../redux/modules/time.js";
import { setAmplitudeIncrement,
         setDissipationFator }  from "../redux/modules/phaseParameters.js";
import { getPhaseParameters }   from "../redux/modules/phaseSelectors.js";

function mapStateToProps(state) {

    const phaseParameters = getPhaseParameters(state.phaseParameters);

    return {
        signalRadius       : state.signalRadius.radius,
        showSignalRadius   : state.signalRadius.isVisible,
        blinkStatus        : state.blinkStatus,
        debug              : state.debug,
        time               : state.time,
        flashlight         : state.flashlight,
        dissipationFactor  : phaseParameters.dissipationFactor,
        amplitudeIncrement : phaseParameters.amplitudeIncrement,
        alpha              : phaseParameters.alpha,
        beta               : phaseParameters.beta
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
            dispatch( setBlinkStatus(status) );
        },
        onTimeReset: function(status){
            dispatch( resetTime(status) );
        },
        onDebugChange: function(bool){
            dispatch( toggleDebug(bool) );
        },
        onFlashlightChange: function(flashlight){
            dispatch( updateFlashlight(flashlight) );
        },
        onDissipationFactorChange: function(dissipationFactor){
            dispatch( setDissipationFator(dissipationFactor) );
        },
        onAmplitudeIncrementChange: function(amplitudeIncrement){
            dispatch( setAmplitudeIncrement(amplitudeIncrement) );
        }
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Controls);
