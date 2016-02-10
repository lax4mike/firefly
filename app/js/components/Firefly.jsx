import React, { PropTypes } from "react";

let equilibrum = 1000;

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

        onBlink      : PropTypes.func.isRequired,
        blinkStatus  : PropTypes.oneOf(["blink", "on", "off"]).isRequired,

        debug            : PropTypes.bool.isRequired,
        signalRadius     : PropTypes.number.isRequired,
        showSignalRadius : PropTypes.bool.isRequired,

        onDrag       : PropTypes.func.isRequired
    },

    contextTypes: {
        store: PropTypes.object
    },

    getInitialState: function(){
        return {
            isBlinking: (this.props.blinkStatus === "blink"),
            fill: "transparent", // start off
            interval: equilibrum,
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
            this.setState({
                fill: "transparent"
            });
            this.startBlinkTimeoutId = setTimeout(this.startBlink, Math.round(Math.random() * equilibrum));
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
            fill: (status === "off") ? "transparent" : "url('#yellow')"
        });
    },

    blink: function(){

        let blinkLog = this.context.store.getState().blinkLog;

        // check the blink log for a blink that happened in the last 500ms
        let allNeighborBlinks = blinkLog
            .map((b) => {
                // add time deviation from this blink
                let deviation = Date.now() - b.timestamp;
                return Object.assign({}, b, { deviation });
            })
            .filter((b) => {
                let isNeighbor = this.props.neighbors.find((n) => n.id === b.id);
                let isSelf = (this.props.id === b.id);
                let isTooClose = (b.deviation < 25); // close enough...
                let isInLastInterval = (b.deviation) < (this.state.interval - 100);
                return isNeighbor && !isSelf && isInLastInterval && !isTooClose;
            });

        let closeBlinks = allNeighborBlinks.filter((b) => {
            // if this blink is detected in the 2nd half
            let isIn2ndHalf = b.deviation < (this.state.interval/2);
            return isIn2ndHalf;
        });


        // blue if they can't see anything
        let fill = "url('#blue')";
        let newInterval = equilibrum;

        // green if they see some
        if (allNeighborBlinks.length > 0) {
            fill = "url('#green')";
        }

        // red if they see some close
        // if (closeBlinks.length > 0) {
        //     // find the shortest deviation
        //     const shortest = closeBlinks
        //         .map((b) => b.deviation)
        //         .reduce((a, b) => Math.min(a, b));
        //
        //     newInterval = equilibrum - Math.ceil((shortest / 2));
        //
        //     fill = "url('#red')";
        //     // newInterval = Math.max(975, newIterval);
        //
        // }

        if (closeBlinks.length > 0){
            newInterval = equilibrum - 25;
            fill = "url('#red')";
        }



        // console.log("MAX", newInterval, closeBlinks);

        // show the firely and update the interval for display purposes
        if (this.isMounted()){
            this.setState({
                fill: fill,
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
                (this.props.debug)
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
