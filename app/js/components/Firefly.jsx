import React, { PropTypes } from "react";


export default React.createClass({

    displayName: "Firefly",

    propTypes: {
        id           : PropTypes.number.isRequired,
        radius       : PropTypes.number.isRequired,
        centerx      : PropTypes.number.isRequired,
        centery      : PropTypes.number.isRequired,
        neighbors    : PropTypes.arrayOf(PropTypes.shape({
            id       : PropTypes.number.isRequired,
            distance : PropTypes.number.isRequired
        })),
        fill         : PropTypes.string.isRequired,

        onBlink      : PropTypes.func.isRequired,
        blinkStatus  : PropTypes.oneOf(["blink", "on", "off"]).isRequired,

        signalRadius : PropTypes.number.isRequired,
        showSignalRadius: PropTypes.bool.isRequired,

        onDrag       : PropTypes.func.isRequired
    },

    contextTypes: {
        store: PropTypes.object
    },

    getInitialState: function(){
        return {
            isBlinking: (this.props.blinkStatus === "blink"),
            fill: "transparent", // start off
            interval: 1000,
            // fill: this.props.fill, // start on
            showSignalRadius: false // for this individual firefly
        };
    },

    componentDidMount: function(){
        this.handleBlinKStatusChange(this.props.blinkStatus);
    },

    componentWillUnmount: function(){
        this.stopBlink();
    },

    componentWillReceiveProps: function(nextProps){

        // if the blink status has changed
        if (nextProps.blinkStatus !== this.props.blinkStatus){
            this.stopBlink();
            this.handleBlinKStatusChange(nextProps.blinkStatus);
        }
        // start blinking 0-1s from now
    },

    handleBlinKStatusChange: function(status){
        if (status === "blink"){
            this.startBlinkTimeoutId = setTimeout(this.startBlink, Math.random() * 3000);
        }
        else {
            this.stopBlink(status);
        }
    },

    handleMouseEnter: function(){
        // show signal radius on hover
        this.setState({ showSignalRadius: true });
    },

    handleMouseLeave: function(){
        // hide signal radius
        this.setState({ showSignalRadius: false });
    },

    // attach drag and mouseup events to the window
    handleMouseDown: function(){
        window.addEventListener("mousemove", this.handleWindowMouseMove);
        window.addEventListener("mouseup", this.handleWindowMouseUp, true);
    },

    // when the user lifts the mouse, remove the listeners
    handleWindowMouseUp: function(e){
        window.removeEventListener("mousemove", this.handleWindowMouseMove);
        window.removeEventListener("mouseup", this.handleWindowMouseUp, true);
    },

    // while dragging, send the offset info up
    handleWindowMouseMove: function(e){
        this.props.onDrag(e.offsetX, e.offsetY);
    },

    startBlink: function(){
        this.setState({
            isBlinking: true
        });
        this.blink();
    },

    stopBlink: function(status){
        clearTimeout(this.startBlinkTimeoutId);
        this.setState({
            isBlinking: false,
            fill: (status === "off") ? "transparent" : this.props.fill
        });
    },

    blink: function(){

        let blinkLog = this.context.store.getState().blinkLog;

        // check the blink log for a blink that happened in the last 500ms
        let closeBlinks = blinkLog.filter((b) => {
            let diff = Date.now() - b.timestamp;
            let isNeighbor = this.props.neighbors.find((n) => n.id === b.id);
            // if this blink is detected in the 2nd half
            return isNeighbor && (diff < (this.state.interval/2));
        });

        // determine the interval
        let newInterval = (closeBlinks.length > 0) ? 975 : 1000;

        // show the firely and update the interval for display purposes
        if (this.isMounted()){
            this.setState({
                fill: this.props.fill,
                interval: newInterval
            });
        }

        // blink off
        setTimeout(() => {
            if (this.isMounted() && this.state.isBlinking){
                this.setState({
                    fill: "transparent",
                    interval: newInterval
                });
            }
        }, 350);

        // blink next time
        setTimeout(() => {
            if (this.state.isBlinking){
                this.blink();
            }
        }, newInterval);


        // console.log("firefly #", this.props.id);
        // closeBlinks.forEach((b) => {
        //     console.log(b.id, Date.now() - b.timestamp);
        // });
        // console.log("new interval", newInterval)

        // record this blink to the blink log
        this.props.onBlink();
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
                    onMouseDown  = {this.handleMouseDown}
                    cx    = {this.props.centerx}
                    cy    = {this.props.centery}
                    r     = {this.props.radius}
                    fill  = {this.state.fill} />

                { // only show the text
                (this.props.showSignalRadius || this.state.showSignalRadius)
                    ? (
                        <text
                            x = {this.props.centerx - 8}
                            y = {this.props.centery + 30}
                        >
                            {this.props.id + ": " + this.state.interval}
                        </text>
                    )
                    : null
                }

            </g>
        );
    }

});
