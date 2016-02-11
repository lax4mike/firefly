import React, { PropTypes } from "react";
import getOffset from "../offset.js";
import colors from "../colors.js";
import Firefly from "./Firefly.jsx";


const RADIUS = 15;

export default React.createClass({

    displayName: "Canvas",

    propTypes: {
        debug            : PropTypes.bool.isRequired,
        showSignalRadius : PropTypes.bool.isRequired,
        signalRadius     : PropTypes.number.isRequired,
        blinkStatus      : PropTypes.string.isRequired,

        fireflies: PropTypes.arrayOf(PropTypes.object).isRequired,
        onFireflyBlink : PropTypes.func.isRequired,
        onFireflyDrag  : PropTypes.func.isRequired,
        onFireflyAdd   : PropTypes.func.isRequired,
        onFireflyDelete: PropTypes.func.isRequired,

        flashlight : PropTypes.shape({
            isResizing: PropTypes.bool.isRequired,
            isShining : PropTypes.bool.isRequired,
            radius: PropTypes.number.isRequired,
            x: PropTypes.number.isRequired,
            y: PropTypes.number.isRequired
        }),
        onFlashlightUpdate : PropTypes.func.isRequired,

        onResize : PropTypes.func.isRequired,
        onInit   : PropTypes.func.isRequired
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

        // init some fireflies with this width/height
        let width = this.refs.canvas.clientWidth;
        let height = this.refs.canvas.clientHeight;
        this.props.onInit({width, height});
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

    handleCanvasMouseDown: function(e){
        let offset = getOffset(this.refs["canvas"], e);

        // when the user holds shift and clicks,
        // add a firefly to that spot
        if (e.shiftKey) {
            this.props.onFireflyAdd({
                x: offset.x,
                y: offset.y
            });
        }

        // otherwise, show the flashlight where they click
        else {
            this.props.onFlashlightUpdate({
                isShining: true,
                x: offset.x,
                y: offset.y
            });

            window.addEventListener("mousemove", this.handleWindowMouseMove);
            window.addEventListener("mouseup", this.handleWindowMouseUp, true);
        }
    },

    handleWindowMouseMove: function(e){

        let offset = getOffset(this.refs["canvas"], e);

        this.props.onFlashlightUpdate({
            x: offset.x,
            y: offset.y
        });
    },

    handleWindowMouseUp: function(){
        this.props.onFlashlightUpdate({ isShining: false });

        window.removeEventListener("mousemove", this.handleWindowMouseMove);
        window.removeEventListener("mouseup", this.handleWindowMouseUp, true);
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
            <svg className="canvas" style={canvasStyles} ref="canvas"
                onMouseDown={this.handleCanvasMouseDown}
                >

                <defs>
                { // define color gradients for fireflies (see colors variable)
                colors.map((color) => (
                    <radialGradient id={color.id} key={color.id}>
                        <stop offset="0%"   stopColor={color.hex} stopOpacity="1"/>
                        <stop offset="100%" stopColor={color.hex} stopOpacity="0" />
                    </radialGradient>
                ))}
                </defs>

                { // show the flashlight if it's being shined or resized
                (this.props.flashlight.isShining || this.props.flashlight.isResizing)
                ? (
                    <circle
                        cx={this.props.flashlight.x}
                        cy={this.props.flashlight.y}
                        r={this.props.flashlight.radius}
                        fill="rgba(241, 196, 15, 0.1)"
                    />
                )
                : null}

                { // generate some random fireflies
                this.props.fireflies.map((firefly, i) => (
                    <Firefly
                        key              = {firefly.id}
                        id               = {firefly.id}
                        x                = {firefly.x}
                        y                = {firefly.y}
                        neighbors        = {firefly.neighbors}
                        interval         = {firefly.interval}
                        isInTheLight     = {firefly.isInTheLight}
                        radius           = {RADIUS}
                        canvas           = {this.refs.canvas}
                        signalRadius     = {this.props.signalRadius}
                        showSignalRadius = {this.props.showSignalRadius}
                        debug            = {this.props.debug}
                        blinkStatus      = {this.props.blinkStatus}
                        onDelete         = {this.props.onFireflyDelete.bind(null, firefly.id)}
                        onDrag           = {this.props.onFireflyDrag.bind(null, firefly.id)}
                        onBlink          = {this.props.onFireflyBlink.bind(null, firefly)}
                    />
                ))}

            </svg>
        );
    }
});
