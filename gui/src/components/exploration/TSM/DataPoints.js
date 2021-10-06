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

import LabeledPointsCount from "../LabeledPointsCount";

import Dataset from "../../../model/Dataset";

class DataPoints extends Component {
  render() {
    const dataset = this.props.dataset;

    var headerCells = [];

    this.props.groups.forEach((g, i) => {
      const columnNames = g.map((v) => v.name);
      headerCells.push(
        <th key={i} colSpan={g.length}>
          {columnNames.join(", ")}
        </th>,
        <th key={"sublabel-" + i}>Sublabel</th>
      );
    });

    headerCells.push(<th className="label-col">Label</th>);

    return (
      <div>
        <h3>Labeled Points</h3>

        <LabeledPointsCount points={this.props.labeledPoints} />

        <table className="table-label">
          <thead>
            <tr>{headerCells}</tr>
          </thead>

          <tbody>
            {this.props.labeledPoints.map((point, pointIdx) => {
              const row = dataset.get_selected_columns_point(point.id);

              var rowCells = [];

              this.props.groups.forEach((group, iGroup) => {
                const values = group.map((variable) =>
                  Dataset.displayValue(row[variable.realId])
                );

                rowCells.push(
                  <td colSpan={group.length} key={iGroup}>
                    {values.join(",  ")}
                  </td>,
                  <td key={"label-" + iGroup}>{point.labels[iGroup]}</td>
                );
              });

              rowCells.push(<td>{point.label}</td>);

              return (
                <tr key={pointIdx} className="variable-group">
                  {rowCells}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }
}

export default DataPoints;
