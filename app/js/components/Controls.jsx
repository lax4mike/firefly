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

    render: function(){

        return (
            <div className="controls">
                <div className="control">
                    <label>
                        show signal radius
                        <input type="checkbox"
                            defaulChecked={!this.props.signalRadiusIsHidden}
                            onChange={this.handleSignalRadiusCheckboxChange}/>
                    </label>
                </div>

                <div className="control">
                    <label>
                        <div>signal radius {this.props.signalRadius}</div>
                        <input type="range" min={25} max={300}
                            onChange={this.handleSignalRadiusChange} />
                    </label>
                </div>
            </div>
        );
    }

});
