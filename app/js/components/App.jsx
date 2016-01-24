import React from "react";

import Canvas from "./Canvas.jsx";

export default React.createClass({

    displayName: "App",

    propTypes: {

    },

    getInitialState: function(){

        return {
            width: 0,
            height: 0
        };
    },

    componentDidMount: function(){
        window.addEventListener("resize", this.onResize);

        // trigger onResize() after it mounts so we can initialize the width of the app
        this.onResize();
    },

    componentWillUnmount: function(){
        window.removeEventListener("resize", this.onResize);
    },

    onResize: function(){
        // We can't use media queries, so we're grabbing the width of the app element instead
        this.setState({
            width: this.refs.app.clientWidth,
            height: this.refs.app.clientHeight
        });
    },


    render: function(){

        let appStyles = {
            "position" : "fixed",
            "top"      : "0",
            "right"    : "0",
            "bottom"   : "0",
            "left"     : "0",
            "padding"  : "0", // needs to be 0 to properly fit the canvas ( becuase of clientWidth)
            "margin"   : "20px"
        };

        return (
            <div className="fireflys" ref="app" style={appStyles}>

                <Canvas
                    width  = {this.state.width}
                    height = {this.state.height}
                />

            </div>
        );
    }

});
