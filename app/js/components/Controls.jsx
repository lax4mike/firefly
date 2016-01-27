import React, { PropTypes } from "react";


export default React.createClass({

    displayName: "Controls",

    propTypes: {
        signalRadius                 : PropTypes.number,
        onSignalRadiusChange         : PropTypes.func,
        showSignalRadius             : PropTypes.bool,
        onSignalRadiusCheckboxChange : PropTypes.func
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
                            checked={this.props.showSignalRadius}
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
