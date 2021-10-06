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
