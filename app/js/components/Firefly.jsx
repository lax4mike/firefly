import React, { PropTypes } from "react";


export default React.createClass({

    displayName: "Firefly",

    propTypes: {
        radius       : PropTypes.number,
        centerx      : PropTypes.number,
        centery      : PropTypes.number,
        fill         : PropTypes.string,
        signalRadius : PropTypes.number,
        showSignalRadius: PropTypes.bool
    },

    getDefaultProps: function(){
        return {
            radius: 10,
            centerx: 0,
            centery: 0,
            fill: "#f1c40f",
            signalRadius: 200
        };
    },

    getInitialState: function(){
        return {
            interval: 2000,
            fill: "transparent", // start off
            // fill: this.props.fill, // start on
            blinkId: null
        };
    },

    componentDidMount: function(){
        // start blinking 0-1s from now
        setTimeout(this.startBlink, Math.random() * 2000);
    },

    handleMouseEnter: function(){
        // show signal radius on hover
        this.setState({ showSignalRadius: true });
    },

    handleMouseLeave: function(){
        // hide signal radius
        this.setState({ showSignalRadius: false });
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

        this.setState({
            fill: this.props.fill
        });

        setTimeout(() => {
            this.setState({ fill: "transparent" });
        }, 500);
    },

    render: function(){

        return (
            <g className="firefly">

                { // only show the signal radius cirle on hover
                (this.props.showSignalRadius || this.state.showSignalRadius)
                    ? (
                        <circle
                            className="firefly__signal-radius"
                            cx     = {this.props.centerx}
                            cy     = {this.props.centery}
                            r      = {this.props.signalRadius}
                            fill   = "transparent"
                            stroke = {"#ccc"} />
                    )
                    : null
                }

                <circle
                    className="firefly__light"
                    onMouseEnter = {this.handleMouseEnter}
                    onMouseLeave = {this.handleMouseLeave}
                    cx    = {this.props.centerx}
                    cy    = {this.props.centery}
                    r     = {this.props.radius}
                    fill  = {this.state.fill} />


            </g>
        );
    }

});
