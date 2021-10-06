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

import $ from "jquery";

import DataPoints from "./DataPoints";
import GroupedPointTableHead from "./GroupedPointTableHead";
import GroupedPointTableBody from "./GroupedPointTableBody";
import ModelBehavior from "../../visualisation/ModelBehavior";
import ModelBehaviorControls from "../../visualisation/ModelBehaviorControls";
import LabelInfos from "../../visualisation/LabelInfos";
import AlgorithmName from "../../AlgorithmName";

import getGridPoints from "../../../actions/getGridPoints";
import getTSMPredictions from "../../../actions/getTSMPredictionsOverGridPoints";
import getModelPredictionsOverGridPoints from "../../../actions/getModelPredictionsOverGridPoints";

import {
  backend,
  webplatformApi,
  FACTORIZED_DUAL_SPACE_MODEL,
} from "../../../constants/constants";

import robot from "../../../resources/robot.png";

class TSMExploration extends Component {
  constructor(props) {
    super(props);

    this.state = {
      initialLabelingSession: true,

      showLabelView: true,
      showLabelHistory: false,
      showModelBehavior: false,

      pointsToLabel: this.props.pointsToLabel.map((e) => e),
      labeledPoints: [],
      allLabeledPoints: [],
      hasYes: false,
      hasNo: false,

      fakePointGrid: [],
      categories: {},
      TSMPredictionHistory: [],
      modelPredictionHistory: [],
      projectionHistory: [],
      nIteration: 0,
      iteration: 0,
    };
  }

  render() {
    var dataset = this.props.dataset;
    return (
      <div>
        {!this.state.initialLabelingSession && (
          <ul className="nav nav-tabs bg-primary">
            <li className="nav-item">
              <a
                className={
                  this.state.showLabelView ? "nav-link active" : "nav-link"
                }
                href="javascript:void(0)"
                onClick={() =>
                  this.setState({
                    showLabelView: true,
                    showLabelHistory: false,
                    showModelBehavior: false,
                  })
                }
              >
                Labeling
              </a>
            </li>

            <li className="nav-item">
              <a
                className={
                  this.state.showLabelHistory ? "nav-link active" : "nav-link"
                }
                href="javascript:void(0)"
                onClick={() =>
                  this.setState({
                    showLabelView: false,
                    showLabelHistory: true,
                    showModelBehavior: false,
                  })
                }
              >
                History
              </a>
            </li>

            <li className="nav-item">
              <a
                className={
                  this.state.showModelBehavior ? "nav-link active" : "nav-link"
                }
                href="javascript:void(0)"
                onClick={this.onModelBehaviorClick.bind(this)}
              >
                Model Behavior
              </a>
            </li>

            <li className="nav-item">
              <a
                className="nav-link"
                onClick={this.onLabelWholeDatasetClick.bind(this)}
              >
                Auto-labeling
              </a>
            </li>
          </ul>
        )}

        {this.state.showLabelView && (
          <div className="center card">
            <div className="row">
              <div className="col col-lg-8 offset-lg-2">
                {this.state.initialLabelingSession ? (
                  <div>
                    <h3>Initial sampling</h3>

                    <p className="card">
                      <span className="chatbot-talk">
                        <img src={robot} width="50" alt="robot" />
                        <q>
                          The first phase of labeling continues until we obtain
                          a positive example and a negative example.
                        </q>
                      </span>
                    </p>
                  </div>
                ) : (
                  <h3>Exploration</h3>
                )}

                <p className="card">
                  <span className="chatbot-talk">
                    <img src={robot} width="50" alt="robot" />
                    <q>
                      Grouped variable exploration. If you chose no, you will be
                      asked to label each subgroup independently.
                    </q>
                  </span>
                </p>

                <table className="group-variable">
                  <GroupedPointTableHead groups={this.props.groups} />
                  <GroupedPointTableBody
                    pointsToLabel={this.state.pointsToLabel}
                    dataset={dataset}
                    groups={this.props.groups}
                    groupWasLabeledAsYes={this.groupWasLabeledAsYes.bind(this)}
                    groupWasLabeledAsNo={this.groupWasLabeledAsNo.bind(this)}
                    groupSubLabelisationFinished={this.groupSubLabelisationFinished.bind(
                      this
                    )}
                    onSubgroupNo={this.onSubgroupNo.bind(this)}
                  />
                </table>
              </div>
            </div>
          </div>
        )}

        {this.state.showModelBehavior && (
          <div className="row">
            <div className="col col-lg-4">
              <ModelBehaviorControls
                iteration={this.getIteration()}
                nIteration={this.state.nIteration}
                onPreviousIteration={this.onPreviousIteration.bind(this)}
                onNextIteration={this.onNextIteration.bind(this)}
              />

              <LabelInfos
                iteration={this.state.iteration}
                labeledPoints={this.state.allLabeledPoints}
              />
            </div>
            <div className="col col-lg-8">
              <AlgorithmName algorithm={this.props.algorithm} />
              <ModelBehavior
                iteration={this.getIteration()}
                labeledPoints={this.state.allLabeledPoints}
                availableVariables={this.props.chosenColumns}
                fakePointGrid={this.state.fakePointGrid}
                categories={this.state.categories}
                TSMPredictionHistory={this.state.TSMPredictionHistory}
                modelPredictionHistory={this.state.modelPredictionHistory}
                projectionHistory={this.state.projectionHistory}
                realDataset={true}
                hasTSM={this.state.TSMPredictionHistory.length > 0}
                plotProjection={false}
              />
            </div>
          </div>
        )}

        {this.state.showLabelHistory && (
          <DataPoints
            availableVariables={this.props.chosenColumns}
            labeledPoints={this.state.allLabeledPoints.flat()}
            chosenColumns={this.props.chosenColumns}
            groups={this.props.groups}
            dataset={this.props.dataset}
          />
        )}
      </div>
    );
  }

  onModelBehaviorClick(e) {
    const hasBehaviorData = this.state.modelPredictionHistory.length > 0;

    if (hasBehaviorData) {
      this.setState({
        showModelVisualisation: false,
        showLabelView: false,
        showHeatmap: false,
        showLabelHistory: false,
        showModelBehavior: true,
      });
    } else {
      alert("Please wait for computation to finish.");
    }
  }

  newPointsToLabel(points) {
    var newPoints = points.map((id) => ({ id }));

    this.setState({
      pointsToLabel: [...this.state.pointsToLabel, ...newPoints],
      labeledPoints: [],
    });
  }

  groupWasLabeledAsYes(e) {
    var pointId = e.target.dataset.point;
    var labeledPoint = this.state.pointsToLabel[pointId];
    labeledPoint.labels = this.props.groups.map((g) => 1);
    labeledPoint.label = 1;

    var pointsToLabel = this.state.pointsToLabel.map((e) => e);
    pointsToLabel.splice(pointId, 1);

    if (this.state.initialLabelingSession) {
      this.pointWasLabeledDuringInitialSession(labeledPoint, pointsToLabel);
    } else {
      this.pointWasLabeledAfterInitialSession(labeledPoint, pointsToLabel);
    }
  }

  groupWasLabeledAsNo(e) {
    var pointId = e.target.dataset.point;

    var pointsToLabel = this.state.pointsToLabel.map((e) => e);

    var point = pointsToLabel[pointId];
    point.labels = this.props.groups.map((e) => 1);
    point.label = 0;

    this.setState({
      pointsToLabel: pointsToLabel,
    });
  }

  groupSubLabelisationFinished(e) {
    var pointId = e.target.dataset.point;
    var pointsToLabel = this.state.pointsToLabel.map((e) => e);
    var labeledPoint = pointsToLabel[pointId];

    if (
      labeledPoint.labels.reduce((acc, v) => acc + v) ===
      labeledPoint.labels.length
    ) {
      alert("Please label at least one subgroup.");
      return;
    }

    pointsToLabel.splice(pointId, 1);
    var labeledPoints = this.state.labeledPoints.map((e) => e);
    labeledPoints.push(labeledPoint);

    if (this.state.initialLabelingSession) {
      this.pointWasLabeledDuringInitialSession(labeledPoint, pointsToLabel);
    } else {
      this.pointWasLabeledAfterInitialSession(labeledPoint, pointsToLabel);
    }
  }

  pointWasLabeledDuringInitialSession(labeledPoint, pointsToLabel) {
    var labeledPoints = this.state.labeledPoints.map((e) => e);
    labeledPoints.push(labeledPoint);

    const isYes = labeledPoint.label === 1;
    var hasYesAndNo =
      (isYes && this.state.hasNo) || (!isYes && this.state.hasYes);

    if (hasYesAndNo) {
      this.setState(
        {
          pointsToLabel: [],
          allLabeledPoints: [this.state.allLabeledPoints.concat(labeledPoints)],
          initialLabelingSession: false,
        },
        () => {
          sendLabels(labeledPoints, (points) => {
            this.newPointsToLabel(points);
            this.getGridPoints();
            this.getModelBoundaries();
          });
        }
      );
    } else if (pointsToLabel.length === 0) {
      this.setState(
        {
          pointsToLabel: [],
          allLabeledPoints: this.state.allLabeledPoints.concat(labeledPoints),
          hasYes: isYes,
          hasNo: !isYes,
        },
        () => {
          sendLabels(labeledPoints, this.newPointsToLabel.bind(this));
        }
      );
    } else {
      this.setState({
        pointsToLabel: pointsToLabel,
        labeledPoints: labeledPoints,
        hasYes: isYes,
        hasNo: !isYes,
      });
    }
  }

  pointWasLabeledAfterInitialSession(labeledPoint) {
    var labeledPoints = this.state.labeledPoints;
    labeledPoints.push(labeledPoint);

    this.setState(
      {
        allLabeledPoints: [...this.state.allLabeledPoints, labeledPoints],
        pointsToLabel: [],
        labeledPoints: labeledPoints,
      },
      () => {
        sendLabels(labeledPoints, (response) => {
          this.newPointsToLabel(response);
          this.getModelBoundaries();
        });
      }
    );
  }

  getModelBoundaries() {
    this.setState(
      {
        isFetchingModelPrediction: true,
        isFetchingTSMPrediction: true,
        isFetchingProjection: true,
        nIteration: this.state.nIteration + 1,
      },
      this._getModelBoundaries.bind(this)
    );
  }

  _getModelBoundaries() {
    if (
      this.props.configuration.activeLearner.name ===
      FACTORIZED_DUAL_SPACE_MODEL
    ) {
      getTSMPredictions((predictedLabels) => {
        this.setState({
          TSMPredictionHistory: [
            ...this.state.TSMPredictionHistory,
            predictedLabels,
          ],
          isFetchingTSMPrediction: false,
        });
      });
    }

    getModelPredictionsOverGridPoints((predictions) => {
      this.setState({
        modelPredictionHistory: [
          ...this.state.modelPredictionHistory,
          predictions,
        ],
        isFetchingModelPrediction: false,
      });
    });
  }

  getNumberOfIterations() {
    return this.state.nIteration;
  }

  getIteration() {
    return this.state.iteration;
  }

  onPreviousIteration() {
    var iteration = this.getIteration() - 1;
    this.setState({
      iteration: Math.max(iteration, 0),
    });
  }

  onNextIteration() {
    const nIteration = this.getNumberOfIterations();
    var iteration = this.getIteration() + 1;

    this.setState({
      iteration: Math.min(iteration, nIteration - 1),
    });
  }

  getGridPoints() {
    if (this.props.useRealData) {
      const usedColumnNames = this.props.chosenColumns.map((e) => e["name"]);
      const grid = this.props.dataset.get_parsed_columns_by_names(
        usedColumnNames
      );
      const categories = this.props.dataset.getParsedCategoriesByNames(
        usedColumnNames
      );
      this.setState({
        fakePointGrid: grid,
        categories,
      });
    } else {
      if (this.state.fakePointGrid.length === 0) {
        getGridPoints((points) => {
          this.setState({
            fakePointGrid: points,
          });
        });
      }
    }
  }

  onSubgroupNo(e) {
    var data = e.target.dataset;
    var pointId = data.point;
    var subgroupId = data.subgroup;

    var pointsToLabel = this.state.pointsToLabel.map((e) => e);
    pointsToLabel[pointId].labels[subgroupId] =
      1 - pointsToLabel[pointId].labels[subgroupId];

    this.setState({
      pointsToLabel: pointsToLabel,
    });
  }

  onLabelWholeDatasetClick(e) {
    e.preventDefault();

    getWholedatasetLabeled();

    notifyLabelWholeDataset(this.props.tokens);
  }
}

function getWholedatasetLabeled() {
  $.ajax({
    type: "GET",
    url: backend + "/get-labeled-dataset",
    xhrFields: {
      withCredentials: true,
    },
    success: (response) => {
      var blob = new Blob([response]);
      var link = document.createElement("a");

      link.href = window.URL.createObjectURL(blob);
      document.body.appendChild(link);
      link.download = "labeled_dataset.csv";
      link.click();
    },
  });
}

function notifyLabelWholeDataset(tokens) {
  var wasAskedToLabelDatasetUrl =
    webplatformApi + "/session/" + tokens.sessionToken + "/label-whole-dataset";

  $.ajax({
    type: "PUT",
    dataType: "JSON",
    url: wasAskedToLabelDatasetUrl,
    headers: {
      Authorization: "Token " + tokens.authorizationToken,
    },
    data: {
      clicked_on_label_dataset: true,
    },
  });
}

function sendLabels(labeledPoints, onSuccess) {
  const formattedLabeledPoints = labeledPoints.map((e) => {
    return {
      id: e.id,
      labels: e.labels,
    };
  });

  $.ajax({
    type: "POST",
    dataType: "JSON",
    url: backend + "/data-point-were-labeled", // /tsm-data-point-were-labeled
    xhrFields: {
      withCredentials: true,
    },
    data: {
      labeledPoints: JSON.stringify(formattedLabeledPoints),
    },

    success: onSuccess,
  });
}

TSMExploration.defaultProps = {
  useRealData: true,
};

export default TSMExploration;
