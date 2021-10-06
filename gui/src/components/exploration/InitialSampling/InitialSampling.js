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

import FilteringPoints from "./FilteringPoints";
import PointLabelisation from "../../PointLabelisation";

import explorationSendLabeledPoint from "../../../actions/explorationSendLabeledPoint";
import fetchFilteredPoints from "../../../actions/fetchFilteredPoints";

import robot from "../../../resources/robot.png";

const RANDOM = "random";
const FILTERED = "filtered";

class InitialSampling extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showRandomSampling: false,
      showFilterBasedSampling: false,

      randomPointsToLabel: [...this.props.pointsToLabel],
      filteredPointsToLabel: [],
      labeledPoints: [],
      allLabeledInitialPoints: [],

      filters: this.props.chosenColumns.map((e) => ({
        columnName: e.name,
        type: e.type,
      })),

      hasYes: false,
      hasNo: false,
    };
  }

  render() {
    return (
      <div className="card">
        <div>
          <div className="row">
            <div className="col col-lg-8 offset-lg-2">
              <h3>Initial sampling</h3>

              <p className="card">
                <span className="chatbot-talk">
                  <img src={robot} width="50" alt="robot" />
                  <q>
                    The first phase of labeling continues until we obtain a
                    positive example and a negative example. <br />
                    To get the initial samples, would you like to go through
                    random sampling or attribute filtering?
                  </q>
                </span>
              </p>

              <ul className="nav nav-tabs bg-light">
                <li className="nav-item">
                  <a
                    className={
                      this.state.showRandomSampling
                        ? "nav-link active"
                        : "nav-link"
                    }
                    href="javascript:void(0)"
                    onClick={this.onRandomSamplingClicked.bind(this)}
                  >
                    Random sampling
                  </a>
                </li>

                <li className="nav-item">
                  <a
                    className={
                      this.state.showFilterBasedSampling
                        ? "nav-link active"
                        : "nav-link"
                    }
                    href="javascript:void(0)"
                    onClick={() =>
                      this.setState({
                        showRandomSampling: false,
                        showFilterBasedSampling: true,
                      })
                    }
                  >
                    Faceted search
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {this.state.showRandomSampling && (
            <div>
              <PointLabelisation
                pointsToLabel={this.state.randomPointsToLabel}
                chosenColumns={this.props.chosenColumns}
                dataset={this.props.dataset}
                onPositiveLabel={this.onPositiveRandomPoint.bind(this)}
                onNegativeLabel={this.onNegativeRandomPoint.bind(this)}
              />
            </div>
          )}

          {this.state.showFilterBasedSampling && (
            <div className="row">
              <div className="col col-lg-8 offset-lg-2">
                <FilteringPoints
                  pointsToLabel={this.state.filteredPointsToLabel}
                  chosenColumns={this.props.chosenColumns}
                  dataset={this.props.dataset}
                  filters={this.state.filters}
                  onPositiveLabel={this.onPositiveFilteredPoint.bind(this)}
                  onNegativeLabel={this.onNegativeFilteredPoint.bind(this)}
                  getFilteredPoints={this.getFilteredPoints.bind(this)}
                  onFilterChanged={this.onFilterChanged.bind(this)}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  onRandomSamplingClicked() {
    this.setState({
      showRandomSampling: true,
      showFilterBasedSampling: false,
    });

    if (this.state.randomPointsToLabel.length === 0) this.getRandomPoints();
  }

  onPositiveRandomPoint(e) {
    this.onPositiveLabel(e, RANDOM);
  }

  onNegativeRandomPoint(e) {
    this.onNegativeLabel(e, RANDOM);
  }

  onPositiveFilteredPoint(e) {
    this.onPositiveLabel(e, FILTERED);
  }

  onNegativeFilteredPoint(e) {
    this.onNegativeLabel(e, FILTERED);
  }

  onPositiveLabel(e, pointType) {
    var dataIndex = parseInt(e.target.dataset.key);
    this.dataWasLabeled(dataIndex, 1, pointType);
  }

  onNegativeLabel(e, pointType) {
    var dataIndex = parseInt(e.target.dataset.key);
    this.dataWasLabeled(dataIndex, 0, pointType);
  }

  dataWasLabeled(dataIndex, label, pointType) {
    var newLabeledPoint;
    if (pointType === RANDOM) {
      newLabeledPoint = {
        ...this.state.randomPointsToLabel[dataIndex],
        label,
      };
    } else {
      newLabeledPoint = {
        ...this.state.filteredPointsToLabel[dataIndex],
        label,
      };
    }

    const newLabeledPoints = [...this.state.labeledPoints, newLabeledPoint];

    const newRandomPointsToLabel = this.removeLabeledPoint(
      newLabeledPoint,
      this.state.randomPointsToLabel
    );
    const newFilteredPointsToLabel = this.removeLabeledPoint(
      newLabeledPoint,
      this.state.filteredPointsToLabel
    );

    const isYes = label === 1;

    this.setState(
      {
        allLabeledInitialPoints: [
          ...this.state.allLabeledInitialPoints,
          newLabeledPoint,
        ],
        labeledPoints: newLabeledPoints,

        randomPointsToLabel: newRandomPointsToLabel,
        filteredPointsToLabel: newFilteredPointsToLabel,

        hasYes: this.state.hasYes || isYes,
        hasNo: this.state.hasNo || !isYes,
      },
      () => {
        this.getNextPointsToLabel(pointType);
      }
    );
  }

  removeLabeledPoint(labeledPoint, pointsToLabel) {
    const labeledPointIdx = pointsToLabel.findIndex(
      (point) => point.id === labeledPoint.id
    );
    var newPointsToLabel = [...pointsToLabel];
    if (labeledPointIdx !== -1) newPointsToLabel.splice(labeledPointIdx, 1);
    return newPointsToLabel;
  }

  getNextPointsToLabel(pointType) {
    if (this.state.hasYes && this.state.hasNo) {
      explorationSendLabeledPoint(
        {
          labeledPoints: this.state.labeledPoints,
        },
        this.props.tokens,
        (response) => {
          this.props.hasPositiveAndNegativeLabels(
            this.state.allLabeledInitialPoints,
            this.parseReceivedPoints(response)
          );
        }
      );

      return;
    }

    if (pointType === RANDOM && this.state.randomPointsToLabel.length === 0) {
      this.getRandomPoints();
    }
  }

  getRandomPoints() {
    explorationSendLabeledPoint(
      {
        labeledPoints: this.state.labeledPoints,
      },
      this.props.tokens,
      (response) => {
        this.setState({
          labeledPoints: [],
          randomPointsToLabel: [
            ...this.state.randomPointsToLabel,
            ...this.parseReceivedPoints(response),
          ],
        });
      }
    );
  }

  getFilteredPoints() {
    fetchFilteredPoints(
      this.state.labeledPoints,
      this.state.filters.map((f) => {
        const { type, ...others } = f;
        return others;
      }),
      this.onFilteredPointsReceived.bind(this)
    );
  }

  onFilteredPointsReceived(points) {
    if (points.length === 0) alert("No points satisfy the criteria.");

    this.setState({
      labeledPoints: [],
      filteredPointsToLabel: this.parseReceivedPoints(points),
    });
  }

  parseReceivedPoints(points) {
    return points.map((id) => ({ id }));
  }

  onFilterChanged(iFilter, change) {
    var newFilters = [...this.state.filters];
    Object.assign(newFilters[iFilter], change);
    this.setState({ filters: newFilters });
  }
}

export default InitialSampling;
