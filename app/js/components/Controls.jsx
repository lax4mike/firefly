import React, { PropTypes } from "react";


export default React.createClass({

    displayName: "Controls",

    propTypes: {
        signalRadius: PropTypes.number,
        showSignalRadius: PropTypes.bool,
        onSignalRadiusCheckboxChange: PropTypes.func
    },

    getDefaultProps: function(){
        return {

        };
    },

    getInitialState: function(){
        return {

        };
    },

    componentDidMount: function(){
        // start blinking 0-1s from now
        // setTimeout(this.startBlink, Math.random() * 1000);
    },

    handleSignalRadiusCheckboxChange: function(e){
        if (this.props.onSignalRadiusCheckboxChange){
            this.props.onSignalRadiusCheckboxChange(e.target.checked);
        }
    },

    render: function(){

        return (
            <div className="controls">
                <div className="control">
                    <label>
                        show signal radius
                        <input type="checkbox"
                            onChange={this.handleSignalRadiusCheckboxChange}/>
                    </label>
                </div>
            </div>
        );
    }

});
