import { connect } from "react-redux";

import Controls from "./Controls.jsx";

import { updateRadius, toggleHidden } from "../redux/modules/signalRadius.js";

function mapStateToProps(state) {
    return {
        signalRadius : state.signalRadius.radius,
        showSignalRadius : state.signalRadius.isHidden
    };
}

function mapDispatchToProps(dispatch, ownProps) {
    return {
        onSignalRadiusChange: function(radius){
            dispatch(updateRadius(radius));
        },
        onSignalRadiusCheckboxChange: function(bool){
            dispatch(toggleHidden(!bool));
        }
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Controls);
