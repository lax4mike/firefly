import React, { PropTypes } from "react";

import Firefly from "./Firefly.jsx";

const RADIUS = 10;

let colors = [
    {
        id: "yellow",
        hex: "#f1c40f"
    },
    {
        id: "orange",
        hex: "#f39c12"
    },
    {
        id: "red",
        hex: "#e74c3c"
    }
];


export default React.createClass({

    displayName: "Canvas",

    propTypes: {
        signalRadius: PropTypes.number,
        showSignalRadius: PropTypes.bool
    },

    getDefaultProps: function(){

    },

    getInitialState: function(){

        return {
            width: 0,
            height: 0,
            fireflys: [] // holds the firefly data
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

    generateNewFireflys: function({width, height}){

        return Array(20).fill().map((zero, i) => {
            // return {
            //     centerx: Math.random() * width,
            //     centery: Math.random() * height
            // };

            let columns = 4;
            let rows = 5;
            return {
                centerx: (width/(columns+1) * ((i % columns) + 1)),
                centery: (height/(rows+1) * ((i % rows) + 1))
            };
        });
    },

    onResize: function(){

        let width = this.refs.canvas.clientWidth;
        let height = this.refs.canvas.clientHeight;

        // console.log("width", width);
        // console.log("height", height);

        // We can't use media queries, so we're grabbing the width of the app element instead
        this.setState({
            width: width,
            height: height,
            fireflys: this.generateNewFireflys({width, height})
        });
    },

    render: function(){

        let canvasStyles = {
            "position"  : "relative",
            // "width"     : this.state.width,
            // "height"    : this.state.height,
            "margin"   : RADIUS, // a firefly at 0,0 will not go off the edge
            "boxSizing" : "border-box",
            "border"    : "1px solid #aaa"
        };

        return (
            <svg className="canvas" style={canvasStyles} ref="canvas">

                <defs>
                { // define color gradients for fireflys (see colors variable)
                colors.map((color) => (
                    <radialGradient id={color.id} key={color.id}>
                        <stop offset="0%"   stopColor={color.hex} stopOpacity="1"/>
                        <stop offset="100%" stopColor={color.hex} stopOpacity="0" />
                    </radialGradient>
                ))}
                </defs>

                { // generate some random fireflys
                this.state.fireflys.map((firefly, i) => (
                    <Firefly
                        key              = {i}
                        radius           = {RADIUS}
                        centerx          = {firefly.centerx}
                        centery          = {firefly.centery}
                        fill             = {`url(#${colors[Math.floor(Math.random() * colors.length)].id})`}
                        signalRadius     = {this.props.signalRadius}
                        showSignalRadius = {this.props.showSignalRadius}
                    />
                ))}

            </svg>
        );
    }
});
