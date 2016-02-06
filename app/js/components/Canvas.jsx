import React, { PropTypes } from "react";

import Firefly from "./Firefly.jsx";

const RADIUS = 15;

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
        showSignalRadius: PropTypes.bool.isRequired,
        signalRadius: PropTypes.number.isRequired,
        blinkStatus: PropTypes.string.isRequired,
        fireflies: PropTypes.arrayOf(PropTypes.shape({
            id      : PropTypes.number.isRequired,
            centerx : PropTypes.number.isRequired,
            centery : PropTypes.number.isRequired
        })).isRequired,
        onResize: PropTypes.func.isRequired,
        onFireflyBlink: PropTypes.func.isRequired,
        onFireflyDrag : PropTypes.func.isRequired
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

        let width = this.refs.canvas.clientWidth;
        let height = this.refs.canvas.clientHeight;

        // console.log("width", width);
        // console.log("height", height);

        // We can't use media queries, so we're grabbing the width of the app element instead
        this.setState({
            width: width,
            height: height
        });

        // pass this data to the parent
        if (this.props.onResize){
            this.props.onResize({width, height});
        }
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
                { // define color gradients for fireflies (see colors variable)
                colors.map((color) => (
                    <radialGradient id={color.id} key={color.id}>
                        <stop offset="0%"   stopColor={color.hex} stopOpacity="1"/>
                        <stop offset="100%" stopColor={color.hex} stopOpacity="0" />
                    </radialGradient>
                ))}
                </defs>

                { // generate some random fireflies
                this.props.fireflies.map((firefly, i) => (
                    <Firefly
                        key              = {firefly.id}
                        id               = {firefly.id}
                        radius           = {RADIUS}
                        centerx          = {firefly.centerx}
                        centery          = {firefly.centery}
                        interval         = {firefly.interval}
                        fill             = {`url(#${colors[0].id})`}
                        signalRadius     = {this.props.signalRadius}
                        showSignalRadius = {this.props.showSignalRadius}
                        blinkStatus      = {this.props.blinkStatus}
                        onDrag           = {this.props.onFireflyDrag.bind(null, firefly.id)}
                        onBlink          = {this.props.onFireflyBlink.bind(null, firefly)}
                    />
                ))}

            </svg>
        );
    }
});
