import React, { PropTypes } from "react";

import blinks from "../blink-status.js";

export default React.createClass({

    displayName: "Controls",

    propTypes: {
        signalRadius         : PropTypes.number,
        blinkStatus          : PropTypes.string,
        onSignalRadiusChange : PropTypes.func.isRequired,
        onSignalRadiusVisibilityChange: PropTypes.func.isRequired,
        onBlinkStatusChange  : PropTypes.func.isRequired
    },

    handleBlinKStatusChange: function(e){
        this.props.onBlinkStatusChange(e.target.value);
    },

    handleSignalRadiusChange: function(e){
        this.props.onSignalRadiusChange(Number(e.target.value));
    },

    handleShowFirefliesChange: function(e){
        this.props.onBlinkStatusChange(e.target.value);
    },

    handleMouseDown: function(){
        if (this.props.onSignalRadiusVisibilityChange){
            this.props.onSignalRadiusVisibilityChange(true);
        }
    },

    handleMouseUp: function(){
        if (this.props.onSignalRadiusVisibilityChange){
            this.props.onSignalRadiusVisibilityChange(false);
        }
    },

    render: function(){

        return (
            <div className="controls">
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
                            onChange={this.handleShowFirefliesChange}
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
