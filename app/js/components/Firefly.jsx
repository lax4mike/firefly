import React, { PropTypes } from "react";


export default React.createClass({

    displayName: "Firefly",

    propTypes: {
        radius       : PropTypes.number.isRequired,
        centerx      : PropTypes.number.isRequired,
        centery      : PropTypes.number.isRequired,
        fill         : PropTypes.string.isRequired,
        interval     : PropTypes.number.isRequired,
        signalRadius : PropTypes.number.isRequired,
        showSignalRadius: PropTypes.bool.isRequired
    },

    getInitialState: function(){
        return {
            interval: 2000,
            fill: "transparent", // start off
            // fill: this.props.fill, // start on
            blinkId: null,
            showSignalRadius: false // for this individual firefly
        };
    },

    componentDidMount: function(){
        // start blinking 0-1s from now
        setTimeout(this.startBlink, Math.random() * 2000);
    },

    componentWillUnmount: function(){
        this.stopBlink();
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
        this.setState({ blinkId: setInterval(this.blink, this.props.interval) });
    },

    stopBlink: function(){
        clearInterval(this.state.blinkId);
        this.setState({
            blinkId: null,
            fill: "transparent" // always end "off"
        });
    },

    blink: function(){

        this.setState({
            fill: this.props.fill
        });

        setTimeout(() => {
            if (this.isMounted()){
                this.setState({ fill: "transparent" });
            }
        }, 350);
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
