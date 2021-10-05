/*
 * Copyright (c) 2019 École Polytechnique
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file, you can obtain one at http://mozilla.org/MPL/2.0
 *
 * Authors:
 *       Luciano Di Palma <luciano.di-palma@polytechnique.edu>
 *       Enhui Huang <enhui.huang@polytechnique.edu>
 *       Laurent Cetinsoy <laurent.cetinsoy@gmail.com>
 *
 * Description:
 * AIDEme is a large-scale interactive data exploration system that is cast in a principled active learning (AL) framework: in this context,
 * we consider the data content as a large set of records in a data source, and the user is interested in some of them but not all.
 * In the data exploration process, the system allows the user to label a record as “interesting” or “not interesting” in each iteration,
 * so that it can construct an increasingly-more-accurate model of the user interest. Active learning techniques are employed to select
 * a new record from the unlabeled data source in each iteration for the user to label next in order to improve the model accuracy.
 * Upon convergence, the model is run through the entire data source to retrieve all relevant records.
 */

import React, { Component } from "react";

import * as d3 from "d3";

class VectorStatistics extends Component {
  render() {
    const data = this.props.data;
    const min = d3.min(data),
      max = d3.max(data),
      std = d3.deviation(data),
      mean = d3.mean(data),
      median = d3.median(data);
    //uniqueValues = d3.set(data).values().length

    return (
      <div>
        <h3>Descriptive statistics</h3>

        <table className="table">
          <thead>
            <tr>
              <th>Min</th>
              <th>Max</th>
              <th>Mean</th>
              <th>Median</th>
              <th>Standard deviation</th>
              <th>Unique values</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{min}</td>
              <td>{max}</td>
              <td>{mean}</td>
              <td>{median}</td>
              <td>{std}</td>
              <td>{this.props.uniqueValues.length}</td>
            </tr>
          </tbody>
        </table>

        {false && (
          <div>
            <h4>Unique value counts</h4>
            <table className="table">
              <thead>
                <tr>
                  <th>Value</th>
                  <th>Count</th>
                </tr>
              </thead>

              <tbody>
                {this.props.uniqueValues.map((d, i) => {
                  return (
                    <tr key={i}>
                      <td>{d[0]}</td>
                      <td>{d[1]}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }
}

export default VectorStatistics;
