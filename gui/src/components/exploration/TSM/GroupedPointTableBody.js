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

import Dataset from "../../../model/Dataset";

class GroupedPointTableBody extends Component {
  render() {
    return (
      <tbody>
        {this.props.pointsToLabel.map((point, pointIdx) => {
          const row = this.props.dataset.get_selected_columns_point(point.id);
          const isSubgroupLabeling = point.labels;

          return (
            <tr key={pointIdx} className="constiable-group">
              {this.props.groups.map((group, groupIdx) => {
                const values = group.map((variable) =>
                  Dataset.displayValue(row[variable.realId])
                );

                const SubgroupNoButton = () => (
                  <button
                    data-point={pointIdx}
                    data-subgroup={groupIdx}
                    className={
                      point.labels && point.labels[groupIdx] === 0
                        ? "btn btn-info btn-raised"
                        : "btn btn-outline-info"
                    }
                    onClick={this.props.onSubgroupNo.bind(this)}
                  >
                    No
                  </button>
                );

                return (
                  <td colSpan={group.length} key={groupIdx}>
                    {values.join(",  ")}{" "}
                    {isSubgroupLabeling && <SubgroupNoButton />}
                  </td>
                );
              })}

              <td className="label-col">
                {isSubgroupLabeling ? (
                  <button
                    className="btn btn-primary btn-raised"
                    data-point={pointIdx}
                    onClick={this.props.groupSubLabelisationFinished.bind(this)}
                  >
                    Validate subgroup labels
                  </button>
                ) : (
                  <div>
                    <button
                      className="btn btn-primary btn-raised"
                      data-point={pointIdx}
                      onClick={this.props.groupWasLabeledAsYes.bind(this)}
                    >
                      Yes
                    </button>

                    <button
                      className="btn btn-primary btn-raised"
                      data-point={pointIdx}
                      onClick={this.props.groupWasLabeledAsNo.bind(this)}
                    >
                      No
                    </button>
                  </div>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    );
  }
}

export default GroupedPointTableBody;
