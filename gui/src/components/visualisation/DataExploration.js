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

import React, { Component } from "react";

import * as d3 from "d3";

import HistogramPlotter from "./HistogramPlotter";
import TwoDimensionHeatmapPlotter from "./TwoDimensionHeatmapPlotter";
import VectorStatistics from "./VectorStatistics";

class DataExploration extends Component {
  constructor(props) {
    super(props);
    this.state = {
      histogramVariable: 0,
      firstVariable: props.firstVariable || 0,
      secondVariable: props.secondVariable || 1,
      nBins: 10,
      min: 0,
      max: 10,
    };
  }

  render() {
    const iFirstVariable = this.state.firstVariable;
    const iSecondVariable = this.state.secondVariable;

    const histogramVariable = this.state.histogramVariable;

    const dataset = this.props.dataset;

    const variables = dataset.get_column_names();

    const firstVariable = dataset.get_column_id(histogramVariable);

    const uniqueValues = this.computeUniqueValues(histogramVariable);
    const isVarCategorical = this.isVariableCategorical(histogramVariable);

    return (
      <div id="data-exploration">
        <select
          className="form-control"
          onChange={this.onHistogramVariableChange.bind(this)}
        >
          {this.props.dataset.get_column_names().map((name, i) => {
            return (
              <option key={i} value={i}>
                {name}
              </option>
            );
          })}
        </select>

        <h3>{variables[histogramVariable]}</h3>

        {!isVarCategorical && (
          <VectorStatistics data={firstVariable} uniqueValues={uniqueValues} />
        )}

        <div className="one-dimensional-plot">
          {!isVarCategorical && (
            <div>
              <label htmlFor="bin-number">
                Bin number{" "}
                <input
                  className="form-input"
                  id="bin-number"
                  type="number"
                  value={this.state.nBins}
                  onChange={(e) => {
                    this.setState({ nBins: e.target.value });
                  }}
                />
              </label>
            </div>
          )}
          <div>
            <svg id="histogram"></svg>
          </div>
          <div>
            <svg id="one-dimension-heatmap"></svg>
          </div>
        </div>

        <hr />

        <div>
          <h3>
            2D visualisation of {variables[iFirstVariable]} vs{" "}
            {variables[iSecondVariable]}
          </h3>

          <div className="variable-picker">
            <select
              value={this.state.firstVariable}
              onChange={this.onFirstVariableChange.bind(this)}
              className="form-control"
            >
              {variables.map((variable, i) => {
                return (
                  <option key={i} value={i}>
                    {variable}
                  </option>
                );
              })}
            </select>

            <select
              value={this.state.secondVariable}
              onChange={this.onSecondVariableChange.bind(this)}
              className="form-control"
            >
              {variables.map((variable, i) => {
                return (
                  <option value={i} key={i}>
                    {variable}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <svg id="two-dimension-heatmap"></svg>
          </div>
        </div>
      </div>
    );
  }

  onHistogramVariableChange(e) {
    this.setState({ histogramVariable: e.target.value });
  }

  computeUniqueValues(iVariable) {
    const dataset = this.props.dataset;

    const rawColumn = dataset.get_raw_column_by_id(iVariable);
    const parsedFirstVariable = dataset.get_parsed_column_by_id(iVariable);

    var uniqueValues = Object.entries(
      this.uniqueValuesAsObject(parsedFirstVariable)
    );
    const rawUniqueValues = Object.entries(
      this.uniqueValuesAsObject(rawColumn)
    );

    uniqueValues = d3
      .zip(rawUniqueValues, uniqueValues)
      .map((e) => {
        return [e[0][0], e[1][1]];
      })
      .sort((a, b) => b[1] - a[1]);

    return uniqueValues;
  }

  uniqueValuesAsObject(arr) {
    var counts = {};
    for (var i = 0; i < arr.length; i++) {
      counts[arr[i]] = 1 + (counts[arr[i]] || 0);
    }

    return counts;
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      firstVariable: nextProps.firstVariable,
    });
  }

  onFirstVariableChange(e) {
    this.setState({
      firstVariable: e.target.value,
    });
  }

  onSecondVariableChange(e) {
    this.setState({
      secondVariable: e.target.value,
    });
  }

  isVariableCategorical(iVar) {
    return this.props.chosenColumns[iVar].type === "categorical";
  }

  getVariable(iVariable) {
    const data = this.props.dataset.get_column_id(iVariable);
    return data;
  }

  getParsedVariable(iVariable) {
    return this.props.dataset.get_parsed_column_by_id(iVariable);
  }

  componentDidMount() {
    const data = this.getVariable(this.state.histogramVariable);
    const dataset = this.props.dataset;

    this.histogramPlotter = new HistogramPlotter();
    this.histogramPlotter.prepare_plot("#histogram", data);

    const heatmapData = dataset.get_parsed_columns_by_id([0, 1]);
    this.twoDimensionHeatmapPlotter = new TwoDimensionHeatmapPlotter();
    this.twoDimensionHeatmapPlotter.prepare_plot(
      "#two-dimension-heatmap",
      heatmapData
    );

    this.plotAll();
  }

  plotAll() {
    const iFirstVariable = this.state.firstVariable;
    const iSecondVariable = this.state.secondVariable;

    const histogramVariable = this.state.histogramVariable;

    const dataset = this.props.dataset;

    if (this.isVariableCategorical(histogramVariable)) {
      const histData = this.computeUniqueValues(histogramVariable);

      this.histogramPlotter.plot_histogram(histData, this.state.nBins, true);
    } else {
      const histData = this.getVariable(histogramVariable);
      this.histogramPlotter.plot_histogram(histData, this.state.nBins, false);
    }

    const heatmapData = dataset.get_parsed_columns_by_id([
      iFirstVariable,
      iSecondVariable,
    ]);
    var axisNames = this.getColumnNames();
    axisNames = [axisNames[iFirstVariable], axisNames[iSecondVariable]];

    const rawData = [
      dataset.get_raw_column_by_id(iFirstVariable),
      dataset.get_raw_column_by_id(iSecondVariable),
    ];

    this.twoDimensionHeatmapPlotter.plot(heatmapData, axisNames, rawData);
  }

  getColumnNames() {
    return this.props.chosenColumns.map((e) => e.name);
  }

  componentDidUpdate() {
    this.plotAll();
  }
}

export default DataExploration;
