import React, { PropTypes } from "react";

import blinks from "../blink-status.js";

export default React.createClass({

    displayName: "Controls",

    propTypes: {
        signalRadius         : PropTypes.number.isRequired,
        showSignalRadius     : PropTypes.bool.isRequired,
        blinkStatus          : PropTypes.string.isRequired,
        onSignalRadiusChange : PropTypes.func.isRequired,
        onSignalRadiusVisibilityChange: PropTypes.func.isRequired,
        onBlinkStatusChange  : PropTypes.func.isRequired,
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
            showSignalRadius: this.props.showSignalRadius
        };
    },

    handleBlinkStatusChange: function(e){
        this.props.onBlinkStatusChange(e.target.value);
    },

    handleSignalRadiusChange: function(e){
        this.props.onSignalRadiusChange(Number(e.target.value));
    },

    handleDebugChange: function(e){
        this.props.onDebugChange(e.target.checked);
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

    handleFlashlightMouseDown: function(){
        this.props.onFlashlightChange({ isResizing: true });
    },

    handleFlashlightChange: function(e){
        this.props.onFlashlightChange({ radius: Number(e.target.value) });
    },

    handleFlashlightMouseUp: function(){
        this.props.onFlashlightChange({ isResizing: false });
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

                <div className="control">
                    <label>
                        <div className="label">Blink status</div>

                        {blinks.map((b) => (
                            <label className="radio" key={b}>
                                <input
                                    type="radio"
                                    name="blink-status"
                                    checked={b === this.props.blinkStatus}
                                    value={b}
                                    onChange={this.handleBlinkStatusChange} />
                                &nbsp; {b}
                            </label>
                        ))}
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

            </div>
        );
    }

});
