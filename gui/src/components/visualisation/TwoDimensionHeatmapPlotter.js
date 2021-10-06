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

import * as d3 from "d3";

import * as hexbin from "d3-hexbin";

class TwoDimensionHeatmapPlotter {
  prepare_plot(svgid, data) {
    // set the dimensions and margins of the graph
    var margin = { top: 30, right: 30, bottom: 150, left: 150 };
    var width = 700 - margin.left - margin.right;
    var height = 600 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3
      .select(svgid)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    var g = svg
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x = d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => d[0]))
      .range([0, width]);

    var y = d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => d[1]))
      .range([height, 0]);

    this.xAxis = g
      .append("g")
      .attr("id", "x-axis")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

    g.append("defs")
      .append("clipPath")
      .attr("id", "clip")
      .append("rect")
      .attr("width", width)
      .attr("height", height);

    this.yAxis = svg
      .append("g")
      .attr("id", "y-axis")
      .attr("transform", `translate(${margin.left}, ${margin.top})`)
      .call(d3.axisLeft(y));

    this.gBins = g
      .append("g")
      .attr("clip-path", "url(#clip)")
      .attr("id", "bins")
      .attr("stroke", "#000")
      .attr("stroke-opacity", 0.1);

    this.xLabel = svg
      .append("text")
      .attr(
        "transform",
        `translate(${width / 2 + margin.left}, ${height + 100})`
      )
      .style("text-anchor", "middle")
      .style("fill", "black")
      .attr("dy", "1em");

    // text label for the y axis
    this.yLabel = svg
      .append("text")

      .attr("transform", "rotate(-90)")
      .attr("y", margin.left / 2)
      .attr("x", -height / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("fill", "black");

    this.svg = svg;
    this.margin = margin;
    this.x = x;
    this.y = y;
    this.height = height;
    this.width = width;
    this.g = g;
  }

  configureAxisBuilder(axisBuilder, labelValues) {
    if (labelValues.length < 50) {
      axisBuilder
        .tickValues(d3.range(labelValues.length))
        .tickFormat((d, i) => labelValues[i]);
    }
  }

  plot(data, axisNames, rawData) {
    var margin = this.margin,
      height = this.height,
      width = this.width,
      x = this.x,
      y = this.y,
      radius = 20;

    x.domain(d3.extent(data, (d) => d[0]));
    y.domain(d3.extent(data, (d) => d[1]));

    var xLabel = axisNames[0];
    var yLabel = axisNames[1];
    this.xLabel.transition().text(xLabel);
    this.yLabel.transition().text(yLabel);

    const xLabels = d3
      .set(rawData[0])
      .values()
      .sort((a, b) => a - b);
    const yLabels = d3
      .set(rawData[1])
      .values()
      .sort((a, b) => a - b);

    var xAxisBuilder = d3.axisBottom(x);
    var yAxisBuilder = d3.axisLeft(y);

    this.configureAxisBuilder(yAxisBuilder, yLabels);
    this.configureAxisBuilder(xAxisBuilder, xLabels);

    this.xAxis
      .transition()
      .duration(1000)
      .call(xAxisBuilder)
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-65)");

    this.yAxis
      .transition()
      .duration(1000)
      .call(yAxisBuilder);

    // var yAxis = g => g
    //         .attr("transform", `translate(${margin.left},0)`)
    //         .call(d3.axisLeft(y).ticks(null, ".1s"))
    //         .call(g => g.select(".domain").remove())
    //         .call(g => g.append("text")
    //             .attr("x", 4)
    //             .attr("y", margin.top)
    //             .attr("dy", ".71em")
    //             .attr("fill", "currentColor")
    //             .attr("font-weight", "bold")
    //             .attr("text-anchor", "start")
    //             .text(data.y))

    // var xAxis = g => g
    //         .attr("transform", `translate(0,${height - margin.bottom})`)
    //         .call(d3.axisBottom(x).ticks(width / 80, ""))
    //         .call(g => g.select(".domain").remove())
    //         .call(g => g.append("text")
    //             .attr("x", width - margin.right)
    //             .attr("y", -4)
    //             .attr("fill", "currentColor")
    //             .attr("font-weight", "bold")
    //             .attr("text-anchor", "end")
    //             .text(data.x))

    var binner = hexbin
      .hexbin()
      .x((d) => x(d[0]))
      .y((d) => y(d[1]))
      .radius((radius * width) / 954)
      .extent([
        [margin.left, margin.top],
        [width - margin.right, height - margin.bottom],
      ]);

    var bins = binner(data);

    var color = d3
      .scaleSequential(d3.interpolateBuPu)
      .domain([0, d3.max(bins, (d) => d.length) / 2]);

    var update = this.gBins.selectAll("path").data(bins);

    update.exit().remove();

    update
      .enter()
      .append("path")
      .merge(update)
      .transition()
      .delay(1000)
      .attr("d", binner.hexagon())
      .attr("transform", (d) => `translate(${d.x},${d.y})`)
      .attr("fill", (d) => color(d.length));
  }
}

export default TwoDimensionHeatmapPlotter;
