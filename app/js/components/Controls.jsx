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
        onBlinkStatusChange  : PropTypes.func.isRequired
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

    handleSignalRadiusVisibilityChange: function(e){
        // if we send a value up, store it here first
        this.setState({
            showSignalRadius: e.target.checked
        });
        this.props.onSignalRadiusVisibilityChange(e.target.checked);
    },

    handleMouseDown: function(){
        // store the value of this so we can revert it on mouse up
        this.setState({
            showSignalRadius: this.props.showSignalRadius
        });
        this.props.onSignalRadiusVisibilityChange(true);
    },

    handleMouseUp: function(){
        // restore the original value
        this.props.onSignalRadiusVisibilityChange(this.state.showSignalRadius);
    },

    render: function(){

        return (
            <div className="controls">

                <div className="control">
                    <label className="checkbox-control">
                        <span className="label">Show Signal Radius </span>
                        <input type="checkbox"
                            checked={this.state.showSignalRadius}
                            onChange={this.handleSignalRadiusVisibilityChange} />
                    </label>
                </div>

                <div className="control">
                    <label>
                        <div><span className="label">Signal Radius</span>: <span className="number">{this.props.signalRadius}</span></div>
                        <input type="range" min={50} max={500}
                            value={this.props.signalRadius}
                            onMouseDown={this.handleMouseDown}
                            onMouseUp={this.handleMouseUp}
                            onChange={this.handleSignalRadiusChange} />
                    </label>
                </div>

                <div className="control">
                    <label>
                        <div className="label">Blink status</div>

                        <select
                            onChange={this.handleBlinkStatusChange}
                            value={this.props.blinkStatus}>
                            {blinks.map((b) => (
                                <option
                                    key={b}
                                    value={b}>
                                    {b}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>

            </div>
        );
    }

});
