import React, { PropTypes } from "react";
import getOffset from "../offset.js";
import colors from "../colors.js";
import Firefly from "./Firefly.jsx";


const FIREFLY_RADIUS = 20;

export default React.createClass({

    displayName: "Canvas",

    propTypes: {
        debug            : PropTypes.object.isRequired,
        showSignalRadius : PropTypes.bool.isRequired,
        signalRadius     : PropTypes.number.isRequired,
        blinkStatus      : PropTypes.string.isRequired,

        fireflies: PropTypes.arrayOf(PropTypes.object).isRequired,
        onFireflyDrag  : PropTypes.func.isRequired,
        onFireflyAdd   : PropTypes.func.isRequired,
        onFireflyDelete: PropTypes.func.isRequired,
        onFireflyClick : PropTypes.func.isRequired,

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
            height: 0,
            debugFirefly: null
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

    componentDidUpdate: function(prevProps, prevState){
        // if the debug firefly has changed, alert the parent
        if (this.state.debugFirefly !== prevState.debugFirefly){
            this.props.onFireflyClick(this.state.debugFirefly);
        }
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

    handleFireflyClick: function(id){

        if (id === this.state.debugFirefly){
            this.setState({ debugFirefly: null });
        }
        else {
            this.setState({ debugFirefly: id });
        }
    },


    render: function(){

        const canvasStyles = {
            // "margin"   : FIREFLY_RADIUS, // a firefly at 0,0 will not go off the edge
            // "boxSizing" : "border-box"
        };

        const flashlightColor = "#fcf4bb";

        return (
            <svg className="canvas" style={canvasStyles} ref="canvas"
                onMouseDown={this.handleCanvasMouseDown}
                >

                <defs>
                    { // define color gradients for fireflies (see colors variable)
                    colors.map((color) => (
                        <radialGradient id={color.id} key={color.id}>
                            <stop offset="0%"   stopColor={color.hex} stopOpacity="1"/>
                            <stop offset="40%"  stopColor={color.hex} stopOpacity="0.1" />
                            <stop offset="100%" stopColor={color.hex} stopOpacity="0" />
                        </radialGradient>
                    ))}

                    <radialGradient id="flashlight-fill" key="flashlight-gradient">
                        <stop offset="0%"   stopColor={flashlightColor} stopOpacity="0.8"/>
                        <stop offset="85%"  stopColor={flashlightColor} stopOpacity="0.3" />
                        <stop offset="100%" stopColor={flashlightColor} stopOpacity="0" />
                    </radialGradient>
                </defs>

                { // show the flashlight if it's being shined or resized
                (this.props.flashlight.isShining || this.props.flashlight.isResizing)
                ? (
                    <circle
                        cx={this.props.flashlight.x}
                        cy={this.props.flashlight.y}
                        r={this.props.flashlight.radius + 15}
                        fill="url('#flashlight-fill')"
                    />
                )
                : null}

                { // show the fireflies
                this.props.fireflies.map((firefly, i) => {

                    return (
                        <Firefly
                            key              = {firefly.id}
                            firefly          = {firefly}
                            radius           = {FIREFLY_RADIUS}
                            canvas           = {this.refs.canvas}
                            signalRadius     = {this.props.signalRadius}
                            showSignalRadius = {this.props.showSignalRadius}
                            debug            = {this.props.debug}
                            blinkStatus      = {this.props.blinkStatus}
                            onClick          = {this.handleFireflyClick.bind(null, firefly.id)}
                            onDelete         = {this.props.onFireflyDelete.bind(null, firefly.id)}
                            onDrag           = {this.props.onFireflyDrag.bind(null, firefly.id)}
                        />
                    );
                })}

            </svg>
        );
    }
});
