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

class PointLabelisation extends Component {
  render() {
    return (
      <div className="">
        <div className="row">
          <div className="col col-lg-8 offset-lg-2">
            <p>Please label the following examples.</p>

            <table className="table-label">
              <thead>
                <tr>
                  {this.props.chosenColumns.map((column, key) => {
                    return <th key={key}>{column.name}</th>;
                  })}
                </tr>
              </thead>

              <tbody>
                {this.props.pointsToLabel.map((point, key) => {
                  const pointData = this.props.dataset.get_selected_columns_point(
                    point.id
                  );
                  return (
                    <tr key={key}>
                      {pointData.map((value, valueKey) => {
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
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <table className="table-control">
              <thead>
                <tr>
                  <th>Label</th>
                </tr>
              </thead>
              <tbody>
                {this.props.pointsToLabel.map((point, key) => {
                  return (
                    <tr key={key}>
                      <td className="button-td">
                        <button
                          className="btn btn-raised btn-primary"
                          data-key={key}
                          onClick={(e) => this.props.onPositiveLabel(e)}
                        >
                          Yes
                        </button>
                        <button
                          className="btn btn-raised btn-primary"
                          data-key={key}
                          onClick={(e) => this.props.onNegativeLabel(e)}
                        >
                          No
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
}

export default PointLabelisation;
