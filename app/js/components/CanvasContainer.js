import { connect } from "react-redux";
import { generateFireflies } from "../redux/modules/fireflies.js";
import { getFireflies } from "../redux/modules/fireflies-selectors.js";

import Canvas from "./Canvas.jsx";




function mapStateToProps(state){
    return {
        fireflies: getFireflies(state),
        signalRadius: state.signalRadius.radius,
        showSignalRadius: !state.signalRadius.isHidden
    };
}

function mapDispatchToProps(dispatch, ownProps){
    return {
        onResize: function({width, height}){
            dispatch(
                generateFireflies({width, height})
            );
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Canvas);
