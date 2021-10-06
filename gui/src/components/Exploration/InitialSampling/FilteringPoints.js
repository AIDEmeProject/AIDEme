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

import PointLabelisation from "../../PointLabelisation";

import robot from "../../../resources/robot.png";

class NumericalFilter extends Component {
  constructor(props) {
    super(props);

    const valuesInColumn = this.props.dataset.get_column_name(
      this.props.filter.columnName
    );
    const [min, max] = d3.extent(valuesInColumn);

    this.state = {
      min,
      max,
      step: (max - min) / 100,
      minValue: this.props.filter.min ? this.props.filter.min : min,
      maxValue: this.props.filter.max ? this.props.filter.max : max,
    };
  }

  render() {
    return (
      <div className="card filter inline-block">
        <p>
          {this.props.filter.columnName} <br />
          range: [{this.state.minValue}, {this.state.maxValue}]
        </p>
        <label>
          Min
          <input
            value={this.state.minValue}
            onChange={this.minChanged.bind(this)}
            type="range"
            min={this.state.min}
            max={this.state.max}
            step={this.state.step}
          />
        </label>

        <br />

        <label>
          Max
          <input
            value={this.state.maxValue}
            onChange={this.maxChanged.bind(this)}
            type="range"
            min={this.state.min}
            max={this.state.max}
            step={this.state.step}
          />
        </label>
      </div>
    );
  }

  minChanged(e) {
    var newValue = parseFloat(e.target.value);
    if (newValue >= this.state.maxValue) {
      newValue = this.state.maxValue;
    }

    this.setState({
      minValue: newValue,
    });

    this.props.onFilterChanged(this.props.iFilter, { min: newValue });
  }

  maxChanged(e) {
    var newValue = parseFloat(e.target.value);
    if (newValue <= this.state.minValue) {
      newValue = this.state.minValue;
    }

    this.setState({ maxValue: newValue });

    this.props.onFilterChanged(this.props.iFilter, { max: newValue });
  }
}

class CategoricalFilter extends Component {
  constructor(props) {
    super(props);

    var uniqueValues = Object.entries(
      this.props.dataset.uniqueValues(this.props.filter.columnName)
    ).map((e) => e[0]);

    this.state = {
      uniqueValues,
      filterValues: this.props.filter.filterValues
        ? this.props.filter.filterValues
        : [],
    };
  }

  render() {
    return (
      <div className="card filter categorical-filter inline-block">
        <p>{this.props.filter.columnName}</p>
        {this.state.uniqueValues.map((value, i) => {
          return (
            <div>
              <label htmlFor={"cat-filter-" + i}>{value}</label>
              <input
                type="checkbox"
                data-value={value}
                onChange={this.categoryWasClicked.bind(this)}
              />
            </div>
          );
        })}
      </div>
    );
  }

  categoryWasClicked(e) {
    var value = e.target.dataset.value;

    var parsedValue = parseFloat(value);
    if (!isNaN(parsedValue)) value = parsedValue;

    const newFilterValues = e.target.checked
      ? [...this.state.filterValues, value]
      : this.state.filterValues.filter((e) => e !== value);

    this.setState(
      {
        filterValues: newFilterValues,
      },
      () => {
        this.props.onFilterChanged(this.props.iFilter, {
          filterValues: newFilterValues,
        });
      }
    );
  }
}

class FilteringPoints extends Component {
  render() {
    return (
      <div>
        <p className="card">
          <span className="chatbot-talk">
            <img src={robot} width="50" alt="robot" />
            <q>Filter positive points and click on Get points.</q>
          </span>
        </p>

        {this.props.filters.map((filter, i) => {
          const Filter =
            filter.type === "numerical" ? NumericalFilter : CategoricalFilter;
          return (
            <Filter
              iFilter={i}
              key={i}
              filter={filter}
              dataset={this.props.dataset}
              onFilterChanged={this.props.onFilterChanged}
            />
          );
        })}

        <p>
          <button
            className="btn btn-primary btn-raised"
            onClick={this.props.getFilteredPoints}
          >
            Get Points
          </button>
        </p>

        {this.props.pointsToLabel.length > 0 && (
          <div>
            <PointLabelisation
              chosenColumns={this.props.chosenColumns}
              dataset={this.props.dataset}
              pointsToLabel={this.props.pointsToLabel}
              onPositiveLabel={this.props.onPositiveLabel}
              onNegativeLabel={this.props.onNegativeLabel}
            />
          </div>
        )}
      </div>
    );
  }
}

export default FilteringPoints;
