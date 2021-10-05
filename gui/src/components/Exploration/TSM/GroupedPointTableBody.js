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
