import React, { PropTypes } from "react";


export default React.createClass({

    displayName: "Controls",

    propTypes: {
        signalRadius                 : PropTypes.number,
        onSignalRadiusChange         : PropTypes.func,
        signalRadiusIsHidden         : PropTypes.bool,
        onSignalRadiusCheckboxChange : PropTypes.func
    },

    handleSignalRadiusCheckboxChange: function(e){
        if (this.props.onSignalRadiusCheckboxChange){
            this.props.onSignalRadiusCheckboxChange(e.target.checked);
        }
    },

    handleSignalRadiusChange: function(e){
        if (this.props.onSignalRadiusChange){
            this.props.onSignalRadiusChange(Number(e.target.value));
        }
    },

    handleMouseDown: function(){
        if (this.props.onSignalRadiusCheckboxChange){
            this.props.onSignalRadiusCheckboxChange(true);
        }
    },

    handleMouseUp: function(){
        if (this.props.onSignalRadiusCheckboxChange){
            this.props.onSignalRadiusCheckboxChange(false);
        }
    },

    render: function(){

        return (
            <div className="controls">
                <div className="control">
                    <label>
                        <div><span className="label">signal radius</span>: <span className="number">{this.props.signalRadius}</span></div>
                        <input type="range" min={50} max={500}
                            value={this.props.signalRadius}
                            onMouseDown={this.handleMouseDown}
                            onMouseUp={this.handleMouseUp}
                            onChange={this.handleSignalRadiusChange} />
                    </label>
                </div>

                {/*
                <div className="control">
                    <label>
                        <span className="label">show signal radius</span>
                        <input type="checkbox"
                            defaulChecked={!this.props.signalRadiusIsHidden}
                            onChange={this.handleSignalRadiusCheckboxChange}/>
                    </label>
                </div>

                */}

            </div>
        );
    }

});
