/*
 *  Copyright 2019 École Polytechnique
 *
 * Authorship
 *   Luciano Di Palma <luciano.di-palma@polytechnique.edu>
 *   Enhui Huang <enhui.huang@polytechnique.edu>
 *   Le Ha Vy Nguyen <nguyenlehavy@gmail.com>
 *   Laurent Cetinsoy <laurent.cetinsoy@gmail.com>
 *
 * Disclaimer
 *   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
 *   TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT. IN NO EVENT SHALL
 *   THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
 *   CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 *   IN THE SOFTWARE.
 */

import * as d3 from "d3"

class OneDimensionHeatmapPlotter{
    
    prepare_plot(svgid){

        
        const domSVG = document.getElementById(svgid)
        
        // set the dimensions and margins of the graph
        var margin = {top: 20, bottom: 20, left: 20, right: 20,}
        var width = 600 - margin.left - margin.right
        var height = 400 - margin.top - margin.bottom

        // append the svg object to the body of the page
        var svg = d3.select(svgid)
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform",
                    "translate(" + margin.left + "," + margin.top + ")");

        // X axis: scale and draw:
        var x = d3.scaleLinear()
                  .domain([0, 100000])     // can use this instead of 1000 to have the max of data: d3.max(data, function(d) { return +d.price })
                  .range([0, width]);

        svg.append("g")
           .attr("transform", "translate(0," + height + ")")
           .call(d3.axisBottom(x));

        this.svg = svg
        this.x = x
        this.height = height
        this.width = width  
        this.margin = margin      
    }
 

    compute_groups(data, nBins){

        
        var q = d3.scaleQuantile().domain(data).range(d3.range(nBins))
        
        var groups = d3.nest()
            .key( function(d){                    
                return q(d)
            })
            .rollup(function(v) { return v.length; })
            .entries(data)
        
        return groups    
    }

    plot(rawData, nBins){

        var groups = this.compute_groups(rawData, nBins)
        
        var svg = this.svg
        var x = this.x
        var height = this.height,
            width = this.width
        var heat_color = d3.scaleLinear().domain([0, 100]).range(["red", "yellow"]);

        const binWidth = x.invert(this.width / nBins)
        
        var one_d_heatmap_height = height 
                                   
        var r = svg.selectAll("rect")
                   .data(groups)

        
        r.enter()
         .append("rect")
         .merge(r)
         .transition()
         .duration(1000)
                
            .attr("class", "rectangles")
            .attr("x", function(d, i) {                
                return x(i * binWidth)
            })
            .attr("y",(d, i)  => {
                return 0;
            })
            .attr("width", function(d, i) {                
                return x(binWidth);
            })
            .attr("height", function(d, i) {                
                return one_d_heatmap_height;
            })
            .attr("fill", function(d, i) {
                                
                if( ! d.value){
                    //aggregation value is not defined, plot as white
                    return "White";
                }
                    
                //aggregation value is not null, plot as heat color
                return heat_color(d.value);
                    
            })
            .attr("stroke", "#fff")
            .attr("stroke-width", 1)
            .attr("cell", function(d, i) {
                    return "r1" + "c" + i;
            })

        r.exit().remove()        
    }
}




export default OneDimensionHeatmapPlotter