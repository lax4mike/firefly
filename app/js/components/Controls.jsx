import React, { PropTypes } from "react";

import blinks from "../blink-status.js";

export default React.createClass({

    displayName: "Controls",

    propTypes: {
        signalRadius         : PropTypes.number.isRequired,
        onSignalRadiusChange : PropTypes.func.isRequired,
        showSignalRadius     : PropTypes.bool.isRequired,
        onSignalRadiusVisibilityChange: PropTypes.func.isRequired,

        blinkStatus          : PropTypes.string.isRequired,
        onBlinkStatusChange  : PropTypes.func.isRequired,

        dissipationFactor    : PropTypes.number.isRequired,
        onDissipationFactorChange: PropTypes.func.isRequired,
        amplitudeIncrement   : PropTypes.number.isRequired,
        onAmplitudeIncrementChange: PropTypes.func.isRequired,
        alpha                : PropTypes.number.isRequired,
        beta                : PropTypes.number.isRequired,

        onDebugChange        : PropTypes.func.isRequired,

        flashlight: PropTypes.shape({
            radius: PropTypes.number.isRequired
        }).isRequired,
        onFlashlightChange   : PropTypes.func.isRequired
    },

    getInitialState: function(){

        let onOffStatus = (this.props.blinkStatus !== "blink") ? this.props.blinkStatus : "on";

        return {
            // remember what this value is from redux
            // use this to revert the status after dragging the range slider
            showSignalRadius: this.props.showSignalRadius,

            // remember the on/off preference.  the user can start/stop the blink
            // this is the value of when they stop the blink
            onOffStatus: onOffStatus
        };
    },

    handleBlinkStatusChange: function(e){

        let value = e.target.value;

        // if the value is on or off, save it for next time
        if (value !== "blink"){
            this.setState({ onOffStatus: value });
        }

        this.props.onBlinkStatusChange(value);
    },

    handleStartStopClick: function(e){

        if (this.props.blinkStatus === "blink"){
            this.props.onBlinkStatusChange(this.state.onOffStatus);
        }
        else {
            this.props.onBlinkStatusChange("blink");
        }
    },

    handleDebugChange: function(e){
        this.props.onDebugChange(e.target.checked);
    },

    // signalRadius handlers
    handleSignalRadiusChange: function(e){
        this.props.onSignalRadiusChange(Number(e.target.value));
    },

    handleSignalRadiusVisibilityChange: function(e){
        // if we send a value up, store it here first
        this.setState({
            showSignalRadius: e.target.checked
        });
        this.props.onSignalRadiusVisibilityChange(e.target.checked);
    },

    handleSignalRadiusMouseDown: function(){
        // store the value of this so we can revert it on mouse up
        this.setState({
            showSignalRadius: this.props.showSignalRadius
        });
        this.props.onSignalRadiusVisibilityChange(true);
    },

    handleSignalRadiusMouseUp: function(){
        // restore the original value
        this.props.onSignalRadiusVisibilityChange(this.state.showSignalRadius);
    },

    // flashlight handlers
    handleFlashlightMouseDown: function(){
        this.props.onFlashlightChange({ isResizing: true });
    },

    handleFlashlightChange: function(e){
        this.props.onFlashlightChange({ radius: Number(e.target.value) });
    },

    handleFlashlightMouseUp: function(){
        this.props.onFlashlightChange({ isResizing: false });
    },

    // phase parameters
    handleDissipationFactorChange: function(e){
        this.props.onDissipationFactorChange(Number(e.target.value));
    },

    handleAmplitudeIncrementChange: function(e){
        this.props.onAmplitudeIncrementChange(Number(e.target.value));
    },


    render: function(){

        return (
            <div className="controls">

                <div className="control">
                    <label>
                        <div>
                            <span className="label">Signal Radius</span>
                            {/* : <span className="number">{this.props.signalRadius}</span> */}
                        </div>
                        <input type="range" min={50} max={500}
                            value={this.props.signalRadius}
                            onMouseDown={this.handleSignalRadiusMouseDown}
                            onMouseUp={this.handleSignalRadiusMouseUp}
                            onChange={this.handleSignalRadiusChange} />
                    </label>
                </div>

                <div className="control">
                    <label className="checkbox-control">
                        <input type="checkbox"
                            checked={this.state.showSignalRadius}
                            onChange={this.handleSignalRadiusVisibilityChange} />
                        <span className="label">Show Signal Radius </span>
                    </label>
                </div>

                <div className="control">
                    <label className="checkbox-control">
                        <input type="checkbox"
                            checked={this.state.debug}
                            onChange={this.handleDebugChange} />
                        <span className="label">Show Debug info </span>
                    </label>
                </div>

                <div className="control control--blink-status">

                    <div className="label">Blink status</div>


                    <button type="button" onClick={this.handleStartStopClick}>
                        {(this.props.blinkStatus === "blink") ? "Stop": "Start"}
                    </button>

                    { // show "on" and "off" radios if it's not blinking
                    (this.props.blinkStatus !== "blink")
                    ? (
                        blinks
                            .filter((b) => (b !== "blink"))
                            .map((b) => (
                                <label className="radio" key={b}>
                                    <input
                                    type="radio"
                                    name="blink-status"
                                    checked={b === this.props.blinkStatus}
                                    value={b}
                                    onChange={this.handleBlinkStatusChange} />
                                    {b}
                                </label>
                            ))
                    )
                    : null
                    }
                </div>

                <div className="control">
                    <label>
                        <div>
                            <span className="label">Flashlight Radius</span>
                            {/* <div className="number"> {this.props.flashlight.radius}</div> */}
                        </div>
                        <input type="range" min={50} max={250}
                            value={this.props.flashlight.radius}
                            onMouseDown={this.handleFlashlightMouseDown}
                            onMouseUp={this.handleFlashlightMouseUp}
                            onChange={this.handleFlashlightChange} />
                    </label>
                </div>

                <div className="control">
                    <label className="label label--brackets">
                        Shift click to add <br/>
                        or delete a firefly
                    </label>
                </div>


                <hr />

                <div className="control">
                    <label>
                        <div className="label">Dissipation Factor </div>
                        <div className="number">{this.props.dissipationFactor.toFixed(2)}</div>
                        <input type="range" min={0.01} max={1} step={0.01}
                            value={this.props.dissipationFactor}
                            onChange={this.handleDissipationFactorChange} />
                    </label>
                </div>

                <div className="control">
                    <label>
                        <div className="label">Amplitude Increment </div>
                        <div className="number">{this.props.amplitudeIncrement.toFixed(2)}</div>
                        <input type="range" min={0.01} max={1} step={0.01}
                            value={this.props.amplitudeIncrement}
                            onChange={this.handleAmplitudeIncrementChange} />
                    </label>
                </div>

                <div className="control">
                    <label>
                        <div className="label">Alpha </div>
                        <div className="number">{this.props.alpha.toFixed(4)}</div>
                    </label>
                </div>

                <div className="control">
                    <label>
                        <div className="label">Beta </div>
                        <div className="number">{this.props.beta.toFixed(4)}</div>
                    </label>
                </div>

                <div className="control">
                    <label>
                        <div className="label">Jump from 500 </div>
                        <div className="number">{(this.props.alpha * 500 + this.props.beta).toFixed(4)}</div>
                    </label>
                </div>


            </div>
        );
    }
});
