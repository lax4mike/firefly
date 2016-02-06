import { connect } from "react-redux";

import Controls from "./Controls.jsx";

import { updateRadius, toggleVisbility } from "../redux/modules/signalRadius.js";
import { setFireflyBlink } from "../redux/modules/fireflies-blink-status.js";

function mapStateToProps(state) {
    return {
        signalRadius     : state.signalRadius.radius,
        showSignalRadius : state.signalRadius.isVisible,
        blinkStatus      : state.blinkStatus
    };
}

function mapDispatchToProps(dispatch, ownProps) {
    return {
        onSignalRadiusChange: function(radius){
            dispatch(updateRadius(radius));
        },
        onSignalRadiusVisibilityChange: function(bool){
            dispatch(toggleVisbility(bool));
        },
        onBlinkStatusChange: function(status){
            dispatch(setFireflyBlink(status));
        }
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Controls);
