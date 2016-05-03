import React, { PropTypes } from "react";
import shallowCompare from "react-addons-shallow-compare";
import d3 from "d3";

import { jumpNextPhi, tickNextPhi, PHI_THRESHOLD } from "../utils/phi.js";

import Axis from "./Axis.jsx";

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
        return shallowCompare(this, nextProps, nextState);
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

        const svgHeight = (svgWidth*1);

        const margin = {top: 10, right: 10, bottom: 40, left: 30};
        const plotWidth  = svgWidth - margin.left - margin.right;
        const plotHeight = svgHeight - margin.top - margin.bottom;

        // generate the data for the jump and tick
        let jumpData = [];
        let tickData = [];
        let baseData = [];
        for(let i = 0; i <= PHI_THRESHOLD; i += 10){
            jumpData.push({
                time: i,
                phi: jumpNextPhi(i, alpha, beta)
            });
            tickData.push({
                time: i,
                phi: tickNextPhi(i)
            });
            baseData.push({
                time: i,
                phi: i
            })
        }

        // was using this for yScale domain max, now using PHI_THRESHOLD
        // const yMaxes = [jumpData, tickData]
        //     .map(data => d3.max(data, d => d.phi));

        const xScale = d3.scale.linear()
            .domain([0, PHI_THRESHOLD])
            .range([0, plotWidth]);

        const xAxis = d3.svg.axis()
            .orient("bottom")
            .scale(xScale)
            .ticks(2)
            .innerTickSize(0)
            .outerTickSize(4)
            .tickFormat((d) => d/1000);

        const yScale = d3.scale.linear()
            .domain([0, PHI_THRESHOLD])
            .range([plotHeight, 0]);


        const yAxis = d3.svg.axis()
            .orient("left")
            .scale(yScale)
            .ticks(2)
            .innerTickSize(0)
            .outerTickSize(4)
            .tickFormat((d) => d/1000);

        var line = d3.svg.line()
            .x(d => xScale(d.time))
            .y(d => yScale(d.phi));

        return {
            margin, svgWidth, svgHeight, plotWidth, plotHeight,
            xScale, xAxis, yScale, yAxis, line,
            jumpData, tickData, baseData
        };

    },

    render: function(){

        const { margin, svgWidth, svgHeight, plotWidth, plotHeight,
            xScale, xAxis, yScale, yAxis, line,
            jumpData, tickData, baseData } = this.state.plot;

        const axisTextStyles = {
            fontSize: 10
        };

        return (
            <div ref="chart-container">

                { // only render the svg if we have the width
                (svgWidth) && (
                    <svg width={svgWidth} height={svgHeight}>
                        <g className="plot"
                        transform={`translate(${margin.left}, ${margin.top})`}
                        width={plotWidth} height={plotHeight}
                        >
                            <Axis
                                axis={xAxis}
                                offset={plotHeight}
                                tickTextStyles={axisTextStyles}
                            />

                            {/* threshold line*/}

                            <line x1={0} y1={0} x2={plotWidth} y2={0}
                                stroke="#999" strokeDasharray="2, 4" />

                            <Axis
                                axis={yAxis}
                                tickTextStyles={axisTextStyles}
                            />


                            <path d={line(baseData)} style={{
                                fill: "none",
                                stroke: "#666",
                                strokeWidth: 1,
                                strokeLinecap: "round"
                            }} />

                            <path d={line(tickData)} style={{
                                fill: "none",
                                stroke: "#00a",
                                strokeWidth: 1,
                                strokeLinecap: "round"
                            }} />

                            <path d={line(jumpData)} style={{
                                fill: "none",
                                stroke: "#a00",
                                strokeWidth: 1,
                                strokeLinecap: "round"
                            }} />

                        </g>
                    </svg>
                )}

            </div>
        );
    }
});
