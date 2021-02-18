/*
 * Copyright (c) 2019 École Polytechnique
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file, you can obtain one at http://mozilla.org/MPL/2.0
 *
 * Authors:
 *       Luciano Di Palma <luciano.di-palma@polytechnique.edu>
 *       Enhui Huang <enhui.huang@polytechnique.edu>
 *       Laurent Cetinsoy <laurent.cetinsoy@gmail.com>
 *
 * Description:
 * AIDEme is a large-scale interactive data exploration system that is cast in a principled active learning (AL) framework: in this context,
 * we consider the data content as a large set of records in a data source, and the user is interested in some of them but not all.
 * In the data exploration process, the system allows the user to label a record as “interesting” or “not interesting” in each iteration,
 * so that it can construct an increasingly-more-accurate model of the user interest. Active learning techniques are employed to select
 * a new record from the unlabeled data source in each iteration for the user to label next in order to improve the model accuracy.
 * Upon convergence, the model is run through the entire data source to retrieve all relevant records.
 */

import * as  d3 from "d3"

class ModelBehaviorPlotter{

    constructor(columnNames){
        
        this.columnNames = columnNames
        this.plotLabels = true
    }

    setPlotLabels(plotLabels){
        this.plotLabels = plotLabels
    }

    createPlot(svgId, scale){

        // set the dimensions and margins of the graph
        var margin = {top: 40, right: 20, bottom: 50, left: 80},
        width = 600 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

        // append the svg object to the body of the page
        var svg = d3.select(svgId)                    
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform",
                        "translate(" + margin.left + "," + margin.top + ")")

        svg.append("defs").append("clipPath")
                        .attr("id", "clip")
                      .append("rect")
                        .attr("width", width)
                        .attr("height", height)
        //                .attr('x', margin.left)
          //              .attr('y', margin.top)
                        ;

        this.svg = svg
        this.width = width
        this.height = height

        var {xMin: xMin, xMax: xMax, yMin: yMin, yMax: yMax} = scale 

        var x = d3.scaleLinear()
                  .domain([xMin, xMax])
                  .range([0, width]);
        this.x = x

            // Add Y axis
        var y = d3.scaleLinear()
                .domain([yMin, yMax])
                .range([height, 0]);

        this.y = y

        this.xAxis = svg.append("g")
            .attr("transform", "translate(0," + height  + ")")
            .call(d3.axisBottom(x));


        this.xLabel = d3.select(svgId).append("text")             
            .attr("transform",
                  "translate(" + (width/2) + " ," + 
                                 (height + margin.top + 30) + ")")
            .style("text-anchor", "middle")
            .style('fill', 'black')
            .text("Variable 1");

          // text label for the y axis
        this.yLabel = svg.append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 0 - margin.left + 10)
                .attr("x",0 - (height / 2))
                .attr("dy", "1em")
                .style("text-anchor", "middle")
                .style('fill', 'black')
                .text("Variable 2"); 
        

        this.yAxis = svg.append("g")
            //.attr("transform", "translate(" + width / 2 + ", 0)")
            .call(d3.axisLeft(y));
        
        // Add dots
        var gLabels = svg.append('g')
            .attr('class', 'labels')
        
        this.gLabels = gLabels

        this.gPredictions = svg.append('g')
            .attr('class', 'predictions')
            .attr("clip-path", "url(#clip)")
            
        this.tooltip = this.svg
            .append("g")
                .attr('class', 'tooltip-behavior')
            
                .style("opacity", 1)                
                .style("position", 'absolute')  
                .style("background-color", "white")
                .style("border", "solid")
                .style("border-width", "1px")
                .style("border-radius", "5px")
                .style("padding", "10px")

        this.tooltip = d3.select("body").append("div")
                .attr("id", "model-behavior-tooltip")
                .style("opacity", 0);

        return svg
    }

    plotData(scale, humanLabeledPoints, chosenVariables, scatterPoints, colors){
        
        const svg = this.svg        
        const x = this.x
        const y = this.y
                             
        this.updateAxis(x, y, scale, chosenVariables)
        // Add a tooltip div. Here I define the general feature of the tooltip: stuff that do not depend on the data point.
        // Its opacity is set to 0: we don't see it by default.
        
        // A function that change this tooltip when the user hover a point.
        // Its opacity is set to 1: we can now see it. Plus it set the text and position of tooltip depending on the datapoint (d)
        var mouseover = (d) => {
            this.tooltip.style("opacity", 1)
        }
        
        var mousemove = (d) => {

           // var x = d3.event.pageX - document.getElementById('scatterplot').getBoundingClientRect().x + 10
            //var y = d3.event.pageY - document.getElementById('scatterplot').getBoundingClientRect().y + 10

            //var x = d3.mouse(this)[0] + 90
            //var y = d3.mouse(this)[1] //+ document.getElementById('scatterplot').getBoundingClientRect().y
            
            var xTooltip = d3.event.pageX + 30
            var yTooltip = d3.event.pageY 
            this.tooltip
                .html( "Data : " + d + "<br />Model prediction: " + d.label)
                .style("left", (xTooltip) + "px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
                .style("top", (yTooltip)  + "px")
        }

        // A function that change this tooltip when the leaves a point: just need to set opacity to 0 again
        var mouseleave = (d) => {
            this.tooltip
                .transition()
                .duration(200)
                .style("opacity", 0)
        }
                                
        // Add dots
        var updatePrediction = this.gPredictions            
            .selectAll("circle")
            .data(scatterPoints)     
                
        updatePrediction.exit().remove()
        
        updatePrediction
            .enter()
            .append("circle")
            .merge(updatePrediction)
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave)              
              
            .attr("cx", function (d) { return x(d[0]); } )
            .attr("cy", function (d) { return y(d[1]); } )
            .attr("r", 4)
            .style("fill", function(d){ return colors[d[2]] })
            .style("opacity", 0.4)
            .style("stroke", "white") 


        if (this.plotLabels){
            
            var updateHumanLabels = this.gLabels
                .selectAll("circle")
                .data(humanLabeledPoints)
                    
            const var1 = chosenVariables[0],
                var2 = chosenVariables[1]
            
            updateHumanLabels
                .enter()
                .append("circle")
                .merge(updateHumanLabels)
                
                .attr("cx", function(d) { return x(d[var1]) } )
                .attr("cy", function(d) { return y(d[var2]) } )
                .attr("r", 7)
                .style("fill", function(d){ return d[2] == 1 ? "green" : 'red'})           
                .style("stroke", function(d){
                        return d[2] == 1 ? "green" : 'red'
                })
                        
            updateHumanLabels.exit().remove()
        }
    }

    updateAxis(x, y, scale, chosenColumns){

        const xLabel = this.columnNames[chosenColumns[0]]
        const yLabel = this.columnNames[chosenColumns[1]]

        this.xLabel
            .text(xLabel)

        this.yLabel
            .text(yLabel)

        const transitionLength = 200
        x.domain([scale.xMin, scale.xMax])
        this.xAxis.transition().duration(transitionLength).call(d3.axisBottom(x))

        y.domain([scale.yMin, scale.yMax])
        this.yAxis.transition().duration(transitionLength).call(d3.axisLeft(y))
    }
}

export default ModelBehaviorPlotter