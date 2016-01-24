import React, { PropTypes } from "react";


export default React.createClass({

    displayName: "Firefly",

    propTypes: {
        r  : PropTypes.number,
        cx : PropTypes.number,
        cy : PropTypes.number,
        fill: PropTypes.string
    },

    getDefaultProps: function(){
        return {
            r: 10,
            cx: 0,
            cy: 0,
            fill: "#f1c40f"
        };
    },

    getInitialState: function(){
        return {
            interval: 1000 + 200 * Math.random(),
            fill: this.props.fill,
            blinkId: null
        };
    },

    componentDidMount: function(){
        // start blinking 0-1s from now
        setTimeout(this.startBlink, Math.random() * 1000);
    },

    startBlink: function(){
        this.setState({ blinkId: setInterval(this.tick, this.state.interval) });
    },

    stopBlink: function(){
        clearInterval(this.state.blinkId);
        this.setState({
            blinkId: null,
            fill: "transparent" // always end "off"
        });
    },

    tick: function(){

        this.setState({ fill: this.props.fill });

        setTimeout(() => {
            this.setState({ fill: "transparent" });
        }, 500);
    },

    render: function(){

        let circleStyles = {
            "transition": "all 150ms"
        };

        return (
            <circle
                style={circleStyles}
                cx={this.props.cx}
                cy={this.props.cy}
                r={this.props.r}
                fill={this.state.fill}>

            </circle>
        );
    }

});
