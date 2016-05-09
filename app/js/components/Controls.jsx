import React, { PropTypes } from "react";
import LineChart from "./LineChart.jsx";

import blinks from "../blinkStatus.js";

export default React.createClass({

    displayName: "Controls",

    propTypes: {
        signalRadius         : PropTypes.number.isRequired,
        onSignalRadiusChange : PropTypes.func.isRequired,
        showSignalRadius     : PropTypes.bool.isRequired,
        onSignalRadiusVisibilityChange: PropTypes.func.isRequired,

        blinkStatus          : PropTypes.string.isRequired,
        onBlinkStatusChange  : PropTypes.func.isRequired,
        onTimeReset          : PropTypes.func.isRequired,

        dissipationFactor    : PropTypes.number.isRequired,
        onDissipationFactorChange: PropTypes.func.isRequired,
        amplitudeIncrement   : PropTypes.number.isRequired,
        onAmplitudeIncrementChange: PropTypes.func.isRequired,
        alpha                : PropTypes.number.isRequired,
        beta                 : PropTypes.number.isRequired,

        time                 : PropTypes.number.isRequired,
        onDebugChange        : PropTypes.func.isRequired,

        flashlight: PropTypes.shape({
            radius: PropTypes.number.isRequired
        }).isRequired,
        onFlashlightChange   : PropTypes.func.isRequired
    },

    getInitialState: function(){

        return {
            // remember what this value is from redux
            // use this to revert the status after dragging the range slider
            showSignalRadius: this.props.showSignalRadius,

            // remember the on/off preference.  the user can start/stop the blink
            // this is the value of when they stop the blink, can be "paused" or "on"
            pausedStatus: "paused"
        };
    },

    handleOnCheckboxChange: function(e){

        const checked = e.target.checked;

        // if the value is on or paused, save it for next time
        const pausedStatus = (checked) ? "on" : "paused";

        this.setState({ pausedStatus });

        this.props.onBlinkStatusChange(pausedStatus);
    },

    handleStartPauseClick: function(e){

        if (this.props.blinkStatus === "blink"){
            this.props.onBlinkStatusChange(this.state.pausedStatus);
        }
        else {
            this.props.onBlinkStatusChange("blink");
        }
    },

    handleResetClick: function(e){
        this.props.onTimeReset();
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


                <div className="control control--blink-status">

                    <div style={{display: "flex"}}>
                        <button type="button" onClick={this.handleStartPauseClick} style={{marginRight: "auto"}}>
                            {(this.props.blinkStatus === "blink") ? "Pause": "Start"}
                        </button>

                        <span className="number" style={{textAlign: "right"}}>
                            {(this.props.time/1000).toFixed(3)}
                        </span>

                    </div>

                    <div style={{display: "flex"}}>

                        {/* only show this checkbox if we're paused */}
                        <label className="radio" style={{
                            visibility: (this.props.blinkStatus !== "blink") ? "visible" : "hidden",
                            flexGrow: 1
                        }}>
                            <input
                                type="checkbox"
                                checked={this.props.blinkStatus === "on"}
                                value="on"
                                onChange={this.handleOnCheckboxChange}
                            />
                            All on
                        </label>

                        { /* only show reset if we're paused */ }
                        <button type="button" onClick={this.handleResetClick} style={{
                            visibility: (this.props.time !== 0)
                                ? "visible" : "hidden"
                        }}>
                            Reset
                        </button>

                    </div>
                </div>


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
                        <input type="range" min={0.01} max={2} step={0.01}
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

                <div className="control" ref="chart-container">
                    <LineChart
                        alpha={this.props.alpha}
                        beta={this.props.beta}
                    />
                </div>


            </div>
        );
    }
});
