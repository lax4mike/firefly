import { connect } from "react-redux";
import { generateFireflies, setFireflyPosition } from "../redux/modules/fireflies.js";
import { getFireflies } from "../redux/modules/fireflies-selectors.js";
import { logBlink } from "../redux/modules/blink-log.js";

import Canvas from "./Canvas.jsx";




function mapStateToProps(state){
    return {
        fireflies: getFireflies(state),
        signalRadius: state.signalRadius.radius,
        showSignalRadius: state.signalRadius.isVisible,
        blinkStatus: state.blinkStatus
    };
}

function mapDispatchToProps(dispatch, ownProps){
    return {
        onResize: function({width, height}){
            dispatch(
                generateFireflies({width, height})
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
