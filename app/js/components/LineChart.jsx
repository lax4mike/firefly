import React, { PropTypes } from "react";
import d3 from "d3";

import { jumpNextPhi, tickNextPhi, PHI_THRESHOLD } from "../utils/phi.js";

export default React.createClass({

    displayName: "LineChart",

    propTypes: {
        alpha: PropTypes.number.isRequired,
        beta : PropTypes.number.isRequired
    },

    getInitialState: function(){
        return {
            // cache the expensive d3 calculations here
            plot: {},
            width: 0
        };
    },

    componentDidMount: function(){
        // attach resize handler to measure the container div
        window.addEventListener("resize", this.handleResize);

        // initialize width
        this.handleResize();
    },

    // clean up event handlers
    componentWillUnmount: function(){
        window.removeEventListener("resize", this.handleResize);
    },

    componentWillReceiveProps: function(nextProps){

        // only update the plot if alpha has changed
        if (this.props.alpha !== nextProps.alpha
         || this.props.beta  !== nextProps.beta
        ){
            this.setState({
                plot: this.getExpensiveD3Calculations(this.state.width, nextProps)
            });
        }
    },

    shouldComponentUpdate: function(nextProps, nextState){
        return (this.props.alpha !== nextProps.alpha
            || this.props.beta !== nextProps.beta);
    },

    handleResize: function(){

        // set the width based on the container width
        const width = this.refs["chart-container"].clientWidth;
        this.setState({
            width,
            plot: this.getExpensiveD3Calculations(width, this.props)
        });
    },

    getExpensiveD3Calculations: function(svgWidth, {alpha, beta}){

        const svgHeight = (svgWidth*0.6);

        const margin = {top: 10, right: 10, bottom: 10, left: 10};
        const plotWidth  = svgWidth - margin.left - margin.right;
        const plotHeight = svgHeight - margin.top - margin.bottom;

        // generate the data for the jump and tick
        let jumpData = [];
        let tickData = [];
        for(let i = 0; i <= PHI_THRESHOLD; i += 10){
            jumpData.push({
                time: i,
                phi: jumpNextPhi(i, alpha, beta)
            });
            tickData.push({
                time: i,
                phi: i
            });
        }

        const yMaxes = [jumpData, tickData]
            .map(data => d3.max(data, d => d.phi));

        const xScale = d3.scale.linear()
            .domain([0, PHI_THRESHOLD])
            .range([0, plotWidth]);

        const yScale = d3.scale.linear()
            .domain([0, d3.max(yMaxes)])
            .range([plotHeight, 0]);

        var line = d3.svg.line()
            .x(d => xScale(d.time))
            .y(d => yScale(d.phi));

        return {
            margin, svgWidth, svgHeight, plotWidth, plotHeight,
            xScale, yScale, line, jumpData, tickData
        };

    },

    render: function(){

        const { margin, svgWidth, svgHeight, plotWidth, plotHeight,
            xScale, yScale, line, jumpData, tickData } = this.state.plot;

        return (
            <div ref="chart-container">

                { // only render the svg if we have the width
                (svgWidth) && (
                    <svg width={svgWidth} height={svgHeight}>
                        <g className="plot"
                        transform={`translate(${margin.left}, ${margin.top})`}
                        width={plotWidth} height={plotHeight}
                        >
                            <path d={line(jumpData)} style={{
                                fill: "none",
                                stroke: "#a00",
                                strokeWidth: 1,
                                strokeLinecap: "round"
                            }}/>

                            <path d={line(tickData)} style={{
                                fill: "none",
                                stroke: "#666",
                                strokeWidth: 1,
                                strokeLinecap: "round"
                            }}/>

                        </g>
                    </svg>
                )}

            </div>
        );
    }
});
