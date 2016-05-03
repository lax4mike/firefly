import React, { PropTypes } from "react";
import { connect } from "react-redux";

import CanvasContainer   from "./CanvasContainer.js";
import ControlsContainer from "./ControlsContainer.js";
import DebugTimeline     from "./DebugTimeline.jsx";

const App = React.createClass({

    displayName: "App",

    propTypes: {
        debug: PropTypes.shape({
            enabled: PropTypes.bool.isRequired,
            debugFirefly: PropTypes.string.isRequired
        }).isRequired
    },

    render: function(){

        const { debug } = this.props;

        return (
            <div className="fireflies-app" ref="app">
                <div className="fireflies-app__side">
                    <ControlsContainer />
                </div>
                <div className="fireflies-app__main">
                    <CanvasContainer />
                    {// show the timeline if we're debugging
                    (false && debug.enabled && debug.debugFirefly) && (
                        <DebugTimeline />
                    )}
                </div>
            </div>
        );
    }

});

function mapStateToProps(state){
    return {
        debug: state.debug
    };
}

export default connect(mapStateToProps)(App);
