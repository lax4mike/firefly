import React, { PropTypes } from "react";
import getOffset from "../offset.js";

const equilibrium = 1000;
const offOpacity = 0.1;

export default React.createClass({

    displayName: "Firefly",

    propTypes: {
        radius       : PropTypes.number.isRequired,
        canvas       : PropTypes.object.isRequired, // ref to <svg> element

        firefly      : PropTypes.shape({
            id        : PropTypes.number.isRequired,
            x         : PropTypes.number.isRequired,
            y         : PropTypes.number.isRequired,
            phi       : PropTypes.number.isRequired,
            neighbors : PropTypes.arrayOf(PropTypes.shape({
                id       : PropTypes.number.isRequired,
                distance : PropTypes.number.isRequired
            })),
            isInTheLight : PropTypes.bool.isRequired
        }),

        onBlink      : PropTypes.func.isRequired,
        blinkStatus  : PropTypes.oneOf(["on", "off"]).isRequired,

        debug            : PropTypes.bool.isRequired,
        signalRadius     : PropTypes.number.isRequired,
        showSignalRadius : PropTypes.bool.isRequired,

        onDrag   : PropTypes.func.isRequired,
        onDelete : PropTypes.func.isRequired
    },

    contextTypes: {
        store: PropTypes.object
    },

    getInitialState: function(){
        return {
            fill: "url('#yellow')",
            isHovering: false // for this individual firefly
        };
    },

    handleMouseEnter: function(){
        // show signal radius on hover
        this.setState({ isHovering: true });
    },

    handleMouseLeave: function(){
        // hide signal radius
        this.setState({ isHovering: false });
    },

    // attach drag and mouseup events to the window
    handleMouseDown: function(e){

        // if the user is holding shift, delete this firefly
        if (e.shiftKey){
            // prevent add firefly from happening on the same click
            e.stopPropagation();
            this.props.onDelete();
        }

        // otherwise, start drag
        else {
            e.stopPropagation(); // prevent flashlight
            window.addEventListener("mousemove", this.handleWindowMouseMove);
            window.addEventListener("mouseup", this.handleWindowMouseUp, true);
        }

    },

    // when the user lifts the mouse, remove the listeners
    handleWindowMouseUp: function(e){
        window.removeEventListener("mousemove", this.handleWindowMouseMove);
        window.removeEventListener("mouseup", this.handleWindowMouseUp, true);
    },

    // while dragging, send the offset info up
    handleWindowMouseMove: function(e){
        // offset in relation to the canvas
        let offset = getOffset(this.props.canvas, e);
        this.props.onDrag(offset.x, offset.y);
    },

    // startBlink: function(){
    //     this.setState({
    //         isBlinking: true
    //     });
    //     this.blink();
    // },
    //
    // stopBlink: function(status){
    //     clearTimeout(this.startBlinkTimeoutId);
    //     this.setState({
    //         isBlinking: false,
    //         // fill: "url('#yellow')"
    //         fill: this.state.fill,
    //         fillOpacity: (status === "off") ? offOpacity : 1
    //     });
    // },
    //
    // blink: function(){
    //
    //     // something is messed up with the timeouts if this happens...
    //     if (this.state.isBlinking === false){
    //         console.log("UH OH!", this);
    //         clearTimeout(this.startBlinkTimeoutId);
    //         return;
    //     }
    //
    //     // make sure the firefly is still there...
    //     if (!this.isMounted()){
    //         console.log("UH OH!!", this);
    //         return;
    //     }
    //
    //     // process this blink to get a new fill and new interval
    //     let { fill, newInterval } = this.processBlink();
    //
    //
    //     // show the firely and update the interval
    //     this.setState({
    //         fill: fill,
    //         fillOpacity: 1,
    //         interval: newInterval
    //     });
    //
    //
    //     // blink off in some time
    //     setTimeout(() => {
    //         if (this.isMounted() && this.state.isBlinking){
    //             this.setState({
    //                 fillOpacity: offOpacity
    //             });
    //         }
    //     }, 350);
    //
    //     // blink next time
    //     setTimeout(() => {
    //         if (this.state.isBlinking){
    //             this.blink();
    //         }
    //     }, newInterval);
    //
    //     // record this blink to the blink log
    //     this.props.onBlink();
    // },
    //
    // processBlink: function(){
    //
    //     let blinkLog = this.context.store.getState().blinkLog;
    //
    //     // check the blink log for a blink that happened in the last 500ms
    //     // blink log is an array of { id, timestamp } objects
    //     let allNeighborBlinks = blinkLog
    //         // add deviation to the blinks
    //         .map((b) => {
    //             // add time deviation from this blink
    //             let deviation = Date.now() - b.timestamp;
    //             // positive is BEFORE this blink, negative is AFTER
    //             return Object.assign({}, b, { deviation });
    //         })
    //         // keep only the neighbors that didn't blink in the first 100ms
    //         // when the firefly is blind
    //         .filter((b) => {
    //             let isNeighbor = this.props.neighbors.find((n) => n.id === b.id);
    //             let isSelf = (this.props.id === b.id);
    //             // the firefly is blind in the first 100ms
    //             let isInLastInterval = (b.deviation) < (this.state.interval - 100);
    //             return isNeighbor && !isSelf && isInLastInterval;
    //         })
    //         // convert blinks in the first half to be negative
    //         .map((b) => {
    //             // eg. convert 900 (before) to -100 (after)
    //             let deviationAfter = (b.deviation - this.state.interval);
    //
    //             if (deviationAfter > (this.state.interval/-4)){
    //                 b.deviation = deviationAfter;
    //             }
    //             return b;
    //         });
    //
    //
    //     let closeBlinks = allNeighborBlinks.filter((b) => {
    //         // if this blink is detected in the 2nd half
    //         let isIn2ndHalf = b.deviation > 0
    //                        && b.deviation < (this.state.interval/2);
    //         // let isInLastQuarter = b.deviation < (this.state.interval/4);
    //
    //         // and is less eg. 250ms (won't include the first 100ms)
    //         let isInFirstQuarter = b.deviation < 0
    //                             && b.deviation > (-1*(this.state.interval/4));
    //
    //         return isIn2ndHalf || isInFirstQuarter;
    //     });
    //
    //
    //     // blue (default) if they can't see anything
    //     let fill = "url('#blue')";
    //     let newInterval = equilibrium;
    //
    //     // green if they see some
    //     if (allNeighborBlinks.length > 0) {
    //         fill = "url('#green')";
    //     }
    //
    //
    //     // red if they see some close
    //     if (closeBlinks.length > 0) {
    //         // find the closest deviation
    //         const closest = closeBlinks
    //             // .map((b) => b.deviation)
    //             .reduce((closest, blink) => {
    //                 let b = Math.abs(blink.deviation);
    //                 let s = Math.abs(closest.deviation);
    //
    //                 return (b < s) ? blink : closest;
    //             });
    //
    //         newInterval = equilibrium - Math.ceil((closest.deviation / 2));
    //         // newInterval = equilibrium;
    //
    //         // if it's not near the equilibrium, make it red
    //         if (Math.abs(equilibrium - newInterval) > 2){
    //             fill = "url('#red')";
    //         }
    //         else {
    //             fill = "url('#blue')";
    //         }
    //         // newInterval = Math.max(975, newIterval);
    //
    //     }
    //
    //     // if (closeBlinks.length > 0){
    //     //     newInterval = equilibrium - 25;
    //     //     fill = "url('#red')";
    //     // }
    //
    //     return { fill, newInterval };
    // },

    render: function(){

        const { firefly, signalRadius, radius, blinkStatus } = this.props;

        const fillOpacity = (blinkStatus === "off" || firefly.isInTheLight)
            ? offOpacity : 1;

        return (
            <g className="firefly">

                { // only show the signal radius cirle on hover
                  // and if this firefly is not in the light
                (!firefly.isInTheLight && (this.props.showSignalRadius || this.state.isHovering))
                    ? (
                        <circle
                            className="firefly__signal-radius"
                            cx     = {firefly.x}
                            cy     = {firefly.y}
                            r      = {signalRadius}
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
                    cx    = {firefly.x}
                    cy    = {firefly.y}
                    r     = {radius}
                    fill  = {this.state.fill}
                    fillOpacity = {fillOpacity}
                />


                { // only show the text in debug mode,
                  // and this firefly isn't in the light
                ((this.props.debug && !firefly.isInTheLight) || this.state.isHovering)
                    ? (
                        <text
                            x = {firefly.x - 8}
                            y = {firefly.y + 30}
                        >
                            {firefly.phi}
                        </text>
                    )
                    : null
                }

            </g>
        );
    }

});
