import React from "react";

import Canvas   from "./Canvas.jsx";
import Controls from "./Controls.jsx";

export default React.createClass({

    displayName: "App",

    propTypes: {

    },

    getInitialState: function(){
        return {
            showSignalRadius: false,
            signalRadius: 200
        };
    },

    handleSignalRadiusCheckboxChange: function(bool){
        this.setState({ showSignalRadius: bool });
    },

    handleSignalRadiusChange: function(radius){
        this.setState({ signalRadius: radius });
    },

    render: function(){

        return (
            <div className="fireflys-app" ref="app">

                <Controls
                    showSignalRadius             = {this.state.showSignalRadius}
                    onSignalRadiusCheckboxChange = {this.handleSignalRadiusCheckboxChange}
                    signalRadius                 = {this.state.signalRadius}
                    onSignalRadiusChange         = {this.handleSignalRadiusChange}
                />

                <Canvas
                    showSignalRadius = {this.state.showSignalRadius}
                    signalRadius     = {this.state.signalRadius}
                />

            </div>
        );
    }

});
