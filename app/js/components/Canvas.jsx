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
        height : PropTypes.number.isRequired,
        width  : PropTypes.number.isRequired
    },

    getInitialState: function(){
        return {};
    },

    render: function(){

        let canvasStyles = {
            "position"  : "relative",
            "width"     : this.props.width,
            "height"    : this.props.height,
            "padding"   : RADIUS, // a firefly at 0,0 will not go off the edge
            "boxSizing" : "border-box",
            "border"    : "1px solid #aaa"
        };

        return (
            <svg className="canvas" style={canvasStyles}>

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
                Array(50).fill().map((zero, i) => (
                    <Firefly
                        key={i}
                        r={RADIUS}
                        cx={Math.random() * this.props.width}
                        cy={Math.random() * this.props.height}
                        fill={`url(#${colors[Math.floor(Math.random() * colors.length)].id})`}/>
                ))}

            </svg>
        );
    }
});
