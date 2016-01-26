import React from "react";

import Canvas   from "./Canvas.jsx";
import Controls from "./Controls.jsx";

export default React.createClass({

    displayName: "App",

    propTypes: {

    },

    getInitialState: function(){
        return {
            showSignalRadius: false
        };
    },

    handleSignalRadiusCheckboxChange: function(bool){
        this.setState({
            showSignalRadius: bool
        });
    },

    render: function(){

        return (
            <div className="fireflys-app" ref="app">

                <Controls
                    onSignalRadiusCheckboxChange = {this.handleSignalRadiusCheckboxChange}/>

                <Canvas
                    showSignalRadius = {this.state.showSignalRadius}/>

            </div>
        );
    }

});
