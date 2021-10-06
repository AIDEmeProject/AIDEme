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

/**
 * Plot data histogram using d3.js library
 */
class HistogramPlotter {
  prepare_plot(svgid, data) {
    // set the dimensions and margins of the graph
    var margin = { top: 50, right: 30, bottom: 100, left: 50 };
    var width = 800 - margin.left - margin.right;
    var height = 650 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3
      .select(svgid)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // X axis: scale and draw:
    var x = d3
      .scaleLinear()
      .rangeRound([0, width])
      .domain([d3.min(data), d3.max(data)]); // can use this instead of 1000 to have the max of data: d3.max(data, function(d) { return +d.price })

    // Y axis: initialization
    var y = d3.scaleLinear().range([height, 0]);

    this.yAxis = svg.append("g");
    this.xAxis = svg.append("g");
    // .attr("transform", "translate(0," + height + ")")
    //.call(d3.axisBottom(x))

    this.svg = svg;
    this.x = x;
    this.y = y;

    this.height = height;
    this.width = width;
    this.margin = margin;
  }

  formatXAxis(barSize, height, axisObject) {
    const translation = `translate(${0}, ${height * 0.5 +
      this.margin.top +
      this.margin.bottom})`;

    this.xAxis.attr("transform", translation).call(axisObject);

    return this.xAxis;
  }

  plot_histogram(data, nBins, isCategorical) {
    if (isCategorical) {
      this.plotCategoricalHistogram(data, nBins);
    } else {
      this.plotNumericalHistogram(data, nBins);
    }
  }

  plotNumericalHistogram(data, nBins) {
    var svg = this.svg;
    var x = this.x,
      y = this.y,
      yAxis = this.yAxis;

    var height = this.height,
      width = this.width;

    var nBars = Math.min(data.length, nBins);
    var barSize = width / nBars;

    x.domain([d3.min(data) * 0.9, d3.max(data) * 1.1]);

    this.setupToolTip();

    this.formatXAxis(barSize, width, d3.axisBottom(x));

    var [min, max] = d3.extent(data);

    const thresholds = d3.range(min, max, (max - min) / nBins);

    // set the parameters for the histogram
    var histogram = d3
      .histogram()
      .value(function(d) {
        return d;
      }) // I need to give the vector of value
      .domain(x.domain()) // then the domain of the graphic
      .thresholds(thresholds); // then the numbers of bins

    // And apply this function to data to get the bins
    var bins = histogram(data);

    var maxBinValue = d3.max(bins, function(d) {
      return d.length;
    });

    y.domain([0, maxBinValue + 5]); // d3.hist has to be called before the Y axis obviously
    yAxis
      .transition()
      .duration(1000)
      .call(d3.axisLeft(y));

    // append the bar rectangles to the svg element
    var r = svg.selectAll("rect").data(bins);

    r.enter()
      .append("rect")
      .merge(r)
      .transition()
      .duration(1000)
      .attr("x", 0)
      .attr("transform", (d, i) => {
        //var xTranslate = i * barSize
        var xTranslate = x(d.x0);
        return `translate(${xTranslate}, ${y(d.length)})`;
      })
      .attr("width", function(d) {
        return x(d.x1) - x(d.x0) - 1;
      })
      .attr("height", function(d) {
        return height - y(d.length);
      })
      .style("fill", "#2574b5");

    r.exit().remove();
  }

  plotCategoricalHistogram(data, nBins, width, height, x, y) {
    var svg = this.svg;
    var x = this.x,
      y = this.y,
      yAxis = this.yAxis;

    var height = this.height,
      width = this.width;

    this.setupToolTip();

    var nBars = data.length;

    //var nBars = Math.min(data.length, nBins)
    var barSize = width / nBars;
    var total = data.reduce((a, e) => a + e[1], 0);

    x.domain([0, nBars]);

    var ticks = data.map((e) => e[0]);
    var xAxis = d3
      .axisBottom(x)
      .tickValues(d3.range(nBars))
      .tickFormat((d, i) => ticks[i]);

    this.formatXAxis(barSize, width, xAxis)
      .selectAll("text")
      .attr("transform", `translate(${barSize / 2}, 20) rotate(45)`);

    y.domain([0, total]);
    yAxis
      .transition()
      .duration(1000)
      .call(d3.axisLeft(y));

    var r = svg.selectAll("rect").data(data);

    r.enter()
      .append("rect")
      .merge(r)
      .on("mouseover", this.mouseover)
      .on("mousemove", this.mousemove)
      .on("mouseleave", this.mouseleave)
      .transition()
      .duration(1000)
      .attr("x", 1)
      .attr("transform", (d, i) => {
        var barHeight = d[1];
        var xTranslate = i * barSize,
          yTranslate = y(barHeight);

        return `translate(${xTranslate}, ${yTranslate})`;
      })
      .attr("width", function(d) {
        return barSize;
      })
      .attr("height", function(d) {
        return height - y(d[1]);
      })
      .style("fill", "#2574b5")
      .style("stroke", "white");

    r.exit().remove();
  }

  setupToolTip() {
    this.tooltip = this.svg
      .append("g")
      .attr("class", "tooltip-behavior")
      .style("opacity", 1)
      .style("position", "absolute")
      .style("background-color", "white")
      .style("border", "solid")
      .style("border-width", "1px")
      .style("border-radius", "5px")
      .style("padding", "10px");

    this.tooltip = d3
      .select("body")
      .append("div")
      .attr("id", "model-behavior-tooltip")
      .style("opacity", 0);

    this.mouseover = (d) => {
      this.tooltip.style("opacity", 1);
    };

    this.mousemove = (d) => {
      var xTooltip = d3.event.pageX + 30;
      var yTooltip = d3.event.pageY;
      this.tooltip
        .html("Category : " + d[0] + "<br />Count: " + d[1])
        .style("left", xTooltip + "px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
        .style("top", yTooltip + "px");
    };

    // A function that change this tooltip when the leaves a point: just need to set opacity to 0 again
    this.mouseleave = (d) => {
      this.tooltip.style("opacity", 0);
    };
  }
}

// var x = d3.event.pageX - document.getElementById('scatterplot').getBoundingClientRect().x + 10
//var y = d3.event.pageY - document.getElementById('scatterplot').getBoundingClientRect().y + 10

//var x = d3.mouse(this)[0] + 90
//var y = d3.mouse(this)[1] //+ document.getElementById('scatterplot').getBoundingClientRect().y

export default HistogramPlotter;
