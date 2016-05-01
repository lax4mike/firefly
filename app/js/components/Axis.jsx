import React, { PropTypes } from "react";

// This component is a React version of the d3 axis.
// It is probably incomplete, as only the required features for
// this project was implemented
// See API here: https://github.com/mbostock/d3/wiki/SVG-Axes
export default React.createClass({

    displayName: "Axis",

    propTypes: {
        // "scale", "orient", "ticks", "tickValues", "tickFormat", "tickSize",
        // "innerTickSize", "outerTickSize", "tickPadding", "tickSubdivide"
        axis: PropTypes.func.isRequired, // d3.svg.axis()
        offset: PropTypes.number, // offset x or y, depeneding on the orientation

        // optional
        tickStyles: PropTypes.object,
        tickTextStyles: PropTypes.object,
        axisStyles: PropTypes.object
    },

    getDefaultProps: function(){
        return {
            offset: 0,
            tickStyles: {
                stroke: "#999",
                strokeWidth: 1
            },
            axisStyles: {
                stroke: "#999",
                strokeWidth: 1,
                strokeLinecap: "square"
            },
            tickTextStyles: {}
        };
    },

    // returns x1 y1 x2 y2 props
    getAxisPositions: function(axis, offset){

        const orient = axis.orient();
        const scale = axis.scale();

        // x-axis
        if (orient === "top" || orient === "bottom") {
            return {
                x1: scale.range()[0],
                x2: scale.range()[1],
                y1: offset,
                y2: offset
            };
        }
        // y-axis
        else {
            return {
                x1: offset,
                x2: offset,
                y1: scale.range()[0],
                y2: scale.range()[1]
            };
        }
    },

    renderTicks: function(axis, offset){

        // console.log(axis.ticks()); // TODO why is axis.ticks() an array??

        // use the axis.tickvalues, or default to the number of generated ticks from the scale
        const ticks      = axis.tickValues() || axis.scale().ticks(axis.ticks()[0]);
        const tickFormat = axis.tickFormat() || axis.scale().tickFormat();

        const orient = axis.orient();
        const scale  = axis.scale();

        // x-axis
        if (orient === "top" || orient === "bottom") {

            // offsets are backwards if it's a top axis
            const flip = (orient === "top") ? -1 : 1;

            return ticks.map((t, i) => {
                const tickProps =  {
                    x1: scale(t),
                    x2: scale(t),
                    y1: offset - (axis.innerTickSize() * flip),
                    y2: offset + (axis.outerTickSize() * flip),
                    style: this.props.tickStyles
                };

                const textProps = {
                    x: scale(t),
                    y: offset + (axis.outerTickSize() * flip),
                    textAnchor: "middle",
                    transform: `translate(0 ${16*flip})`,
                    style: this.props.tickTextStyles
                };

                return (
                    <g className="tick" key={t}>
                        <line {...tickProps} />
                        <text {...textProps}>
                            {tickFormat(t, i, ticks.length)}
                        </text>
                    </g>
                );
            });
        }
        // y-axis
        else {

            return ticks.map((t, i) => {
                const tickProps =  {
                    x1: offset + axis.innerTickSize(),
                    x2: offset - axis.outerTickSize(),
                    y1: scale(t),
                    y2: scale(t),
                    style: this.props.tickStyles
                };

                const textProps = {
                    x: offset - axis.outerTickSize(),
                    y: scale(t),
                    textAnchor: "end",
                    transform: "translate(-8, 4)",
                    style: this.props.tickTextStyles
                };

                return (
                    <g className="tick" key={t}>
                        <line {...tickProps} />
                        <text {...textProps}>
                            {tickFormat(t, i, ticks.length)}
                        </text>
                    </g>
                );
            });
        }

    },

    render: function(){

        const axisPositions = this.getAxisPositions(this.props.axis, this.props.offset);

        return (
            <g className="axis">
                {/* axis line */}
                <line {...axisPositions} style={this.props.axisStyles}></line>

                {this.renderTicks(this.props.axis, this.props.offset)}
            </g>
        );
    }
});
