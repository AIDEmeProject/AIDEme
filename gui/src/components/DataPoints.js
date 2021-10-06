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

import Dataset from "../model/Dataset";
import LabeledPointsCount from "./exploration/LabeledPointsCount";

class DataPoints extends Component {
  constructor(props) {
    super(props);
    this.state = {
      labelId: null,
    };
  }

  render() {
    if (!this.props.show) {
      return <div></div>;
    }

    const dataset = this.props.dataset;

    return (
      <div className="row">
        <div className="col col-lg-12">
          <hr />
          <h3>Labeled points</h3>

          <LabeledPointsCount points={this.props.points} />

          <table className={this.props.normal ? "table" : "table-label"}>
            <thead>
              <tr>
                <th>Row id</th>

                {this.props.chosenColumns.map((column, key) => {
                  return <th key={key}>{column.name}</th>;
                })}

                <th>Label</th>
              </tr>
            </thead>

            <tbody>
              {this.props.points.map((point, key) => {
                const data = dataset.get_selected_columns_point(point.id);

                return (
                  <tr key={key}>
                    <td>{point.id}</td>

                    {data.map((value, valueKey) => {
                      return (
                        <td
                          key={valueKey}
                          data-toggle="tooltip"
                          data-placement="top"
                          title={value}
                        >
                          {Dataset.displayValue(value)}
                        </td>
                      );
                    })}

                    <td>{point.label}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

export default DataPoints;
