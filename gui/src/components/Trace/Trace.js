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
import $ from "jquery";
import * as d3 from "d3";

import TSMTraceDataset from "../../model/TSMTraceDataset";
import TraceDataset from "../../model/TraceDataset";
import Dataset from "../../model/Dataset";

import LearnerOptions from "../options/LearnerOptions";
import DataPoints from "../DataPoints";
import LabelInfos from "../visualisation/LabelInfos";
import ModelBehavior from "../visualisation/ModelBehavior";
import ModelBehaviorControls from "../visualisation/ModelBehaviorControls";
import AlgorithmName from "../AlgorithmName";
import PredictionStatistics from "../exploration/TSM/PredictionStatitics";
import TSMPredictionStatistics from "../exploration/TSM/TSMPredictionStatistics";

import { modelPredictionMap, TSMPredictionMap } from "../exploration/labelMaps";
import buildMode from "../../lib/buildMode";
import loadFileFromInputFile from "../../lib/data_utils";

import initializeBackend from "../../actions/trace/initializeBackend";
import sendPointBatch from "../../actions/trace/sendPointBatch";

import carDatasetMetadata from "./carColumns";
import jobDatasetMetadata from "./jobColumns";

import {
  allLearners,
  allLearnerConfigurations,
  subsampling,
  SIMPLE_MARGIN,
  FACTORIZED_DUAL_SPACE_MODEL,
  FACTORIZED_VERSION_SPACE,
} from "../../constants/constants";

const ENCODED_DATASET_NAME = "cars_encoded.csv";

class QueryTrace extends Component {
  render() {
    const iteration = this.state.iteration;

    return (
      <div className="row">
        <div className="col col-lg-12">
          {this.state.showLoading && (
            <div className="row">
              <div className="col col-lg-6 offset-3 card">
                <h1>Trace module</h1>

                <div className="form-group ">
                  <p>
                    <label htmlFor="dataset">
                      1. Choose the dataset to be labeled
                    </label>
                    <input
                      required
                      className="form-control-file"
                      id="dataset"
                      name="dataset"
                      type="file"
                    />
                  </p>

                  <p>
                    <label htmlFor="trace">2. Choose the trace</label>
                    <input
                      className="form-control-file"
                      id="trace"
                      name="trace"
                      type="file"
                    ></input>
                  </p>

                  <p>
                    <label htmlFor="trace-columns">
                      3. Choose the trace columns
                    </label>
                    <input
                      className="form-control-file"
                      id="trace-columns"
                      name="trace-columns"
                      type="file"
                    ></input>
                  </p>

                  <p>
                    <label htmlFor="f1-score">4. Load f1 score</label>
                    <input
                      className="form-control-file"
                      id="f1-score"
                      name="f1-score"
                      type="file"
                    ></input>
                  </p>

                  <LearnerOptions
                    learners={allLearners}
                    selected={this.state.algorithm}
                    learnerChanged={this.learnerChanged.bind(this)}
                  />

                  <button
                    className="btn btn-raised btn-primary"
                    onClick={this.onValidateTrace.bind(this)}
                  >
                    Validate
                  </button>
                </div>
              </div>
            </div>
          )}

          {!this.state.showLoading && (
            <div className="row">
              <div className="col col-lg-12">
                <div className="row">
                  <div className="col col-lg-6 offset-lg-3">
                    <AlgorithmName algorithm={this.state.algorithm} />
                    <div className="center">
                      {!this.state.loadMode && (
                        <button
                          className="btn btn-primary btn-raised"
                          onClick={this.sendLabelDataForComputation.bind(this)}
                          disabled={this.state.isComputing}
                        >
                          Compute next iteration
                        </button>
                      )}
                      <button
                        className="btn btn-primary btn-raised"
                        onClick={(e) =>
                          this.setState({
                            showModelBehavior: false,
                            showDataPoints: true,
                          })
                        }
                      >
                        Show labeled points
                      </button>

                      <button
                        className="btn btn-primary btn-raised"
                        onClick={(e) =>
                          this.setState({
                            showModelBehavior: true,
                            showDataPoints: false,
                          })
                        }
                      >
                        Show Model Behavior
                      </button>
                    </div>

                    {this.state.isComputing && (
                      <p>Backend is computing please wait</p>
                    )}
                  </div>
                </div>

                {this.state.showModelBehavior && (
                  <div className="row">
                    <div className="col col-lg-4">
                      <ModelBehaviorControls
                        iteration={iteration}
                        nIteration={this.state.nIteration}
                        onPreviousIteration={this.onPreviousIteration.bind(
                          this
                        )}
                        onNextIteration={this.onNextIteration.bind(this)}
                      />

                      <LabelInfos
                        iteration={this.state.iteration}
                        labeledPoints={this.state.allLabeledPoints}
                      />

                      <div>
                        <PredictionStatistics
                          stats={this.getClassifierStats()}
                        />

                        {this.state.useTSM && (
                          <div>
                            <TSMPredictionStatistics
                              stats={this.getTSMStats()}
                            />
                          </div>
                        )}
                      </div>

                      <div id="f1-score-img">
                        <img
                          width="450"
                          src={this.state.f1ScoreImg}
                          alt="f1 score"
                        />
                      </div>
                    </div>

                    <div className="col col-lg-8">
                      <ModelBehavior
                        availableVariables={this.state.availableVariables}
                        labeledPoints={this.state.allLabeledPoints}
                        fakePointGrid={this.state.fakePointGrid}
                        categories={this.state.categories}
                        // projectionHistory={this.state.projectionHistory}
                        modelPredictionHistory={
                          this.state.modelPredictionHistory
                        }
                        TSMPredictionHistory={this.state.TSMPredictionHistory}
                        iteration={iteration}
                        hasTSM={this.state.useTSM}
                        plotLabels={false}
                        realDataset={true}
                        plotProjection={false}
                      />
                    </div>
                  </div>
                )}

                {this.state.showDataPoints && (
                  <DataPoints
                    points={this.state.allLabeledPoints.flat()}
                    chosenColumns={this.state.availableVariables}
                    show={true}
                    dataset={this.state.dataset}
                    normal={true}
                  />
                )}
              </div>
            </div>
          )}
          <div className="row">
            <div className="col col-lg-6 offset-lg-3 card">
              <p>
                <a
                  onClick={this.saveTrace.bind(this)}
                  id="download-trace"
                  download="trace.json"
                  type="application/json"
                  className="btn btn-raised"
                >
                  Save trace
                </a>
              </p>
              <p>
                <label htmlFor="load-trace">Select Trace file (json)</label>
                <input id="load-trace" name="load-trace" type="file" />

                <button
                  className="btn btn-raised"
                  onClick={this.loadTrace.bind(this)}
                >
                  Load
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  constructor(props) {
    super(props);

    this.state = {
      showDataPoints: true,
      showModelBehavior: false,

      showLoading: true,
      isComputing: false,
      loadMode: false,

      nIteration: 0,
      iteration: 0,
      lastIndice: 0,

      dataset: null,
      isCarDataset: null,

      columnNames: [],
      availableVariables: [],
      traceColumns: [],

      traceDataset: null,

      TSMStatsHistory: [],
      classifierStatsHistory: [],

      fakePointGrid: [],
      categories: {},
      TSMPredictionHistory: [],
      modelPredictionHistory: [],
      // projectionHistory: [],

      allLabeledPoints: [],

      algorithm: SIMPLE_MARGIN,
      useTSM: false,
      useFactorizedInformation: false,
    };
  }

  getTSMStats() {
    const iteration = this.state.iteration;
    var stat = this.state.TSMStatsHistory[iteration];
    return stat;
  }

  getClassifierStats() {
    const iteration = this.state.iteration;
    var stat = this.state.classifierStatsHistory[iteration];
    return stat;
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

  learnerChanged(algorithm) {
    this.setState({
      useTSM: algorithm === FACTORIZED_DUAL_SPACE_MODEL,
      useFactorizedInformation:
        algorithm === FACTORIZED_DUAL_SPACE_MODEL ||
        algorithm === FACTORIZED_VERSION_SPACE,
      algorithm,
    });
  }

  onValidateTrace() {
    this.validateInputs(() => {
      this.loadDataset();
      this.loadF1Score();
    });
  }

  validateInputs(onInputsValid) {
    const inputIds = ["dataset", "trace", "trace-columns", "f1-score"];
    const inputNames = ["dataset", "trace", "trace columns", "f1 score"];

    var missingInputs = [];
    inputIds.forEach((inputId, idx) => {
      if (document.getElementById(inputId).files.length === 0)
        missingInputs.push(inputNames[idx]);
    });

    if (missingInputs.length !== 0) {
      alert(
        `Please select the following ${
          missingInputs.length === 1 ? "file" : "files"
        }: ${missingInputs.join(", ")}.`
      );
      return;
    }

    onInputsValid();
  }

  loadF1Score() {
    var file = document.querySelector("#f1-score").files[0];

    var reader = new FileReader();

    reader.onloadend = () => {
      this.setState({
        f1ScoreImg: reader.result,
      });
    };

    reader.readAsDataURL(file);
  }

  loadDataset() {
    loadFileFromInputFile("dataset", (event) => {
      const dataset = Dataset.buildFromLoadedInput(event.target.result);

      const filename = $("#dataset").val();
      const isCarDataset = filename.toLowerCase().indexOf("car") !== -1;

      this.setState(
        {
          dataset,
          isCarDataset,
        },
        this.loadTraceScenario
      );
    });
  }

  loadTraceScenario() {
    loadFileFromInputFile("trace-columns", (event) => {
      const traceColumns = JSON.parse(event.target.result);
      var dataset = this.state.dataset;

      var columnNames = dataset.get_column_names_from_ids(
        traceColumns.rawDataset
      );

      dataset.set_column_names_selected_by_user(columnNames);

      var availableVariables = columnNames.map((name, i) => ({
        name,
        realId: i,
      }));

      this.setState(
        {
          traceColumns,
          columnNames,
          availableVariables,
          dataset,
        },
        this.loadTraceFile
      );
    });
  }

  loadTraceFile() {
    loadFileFromInputFile("trace", (event) => {
      var fileContent = event.target.result;

      const isCsv = getFileExtension("trace") === "csv";

      var trace;
      if (this.state.useFactorizedInformation) {
        trace = TSMTraceDataset.buildFromLoadedInput(fileContent, isCsv);
      } else {
        trace = TraceDataset.buildFromLoadedInput(fileContent, isCsv);
      }

      this.setState(
        {
          traceDataset: trace,
        },
        this.initializeBackend
      );
    });
  }

  initializeBackend() {
    var options = {
      columnIds: this.state.traceColumns.encodedDataset,
      encodedDatasetName: ENCODED_DATASET_NAME,
      configuration: this.buildConfiguration(),
    };

    this.setState(
      {
        isComputing: true,
        showLoading: false,
      },
      () => {
        initializeBackend(options, this.traceBackendWasInitialized.bind(this));
      }
    );
  }

  buildConfiguration() {
    const activeLearner = allLearnerConfigurations[this.state.algorithm];
    const configuration = { activeLearner, subsampling };

    if (this.state.useFactorizedInformation) {
      const partition = this.state.traceColumns.factorizationGroups;

      const datasetMetadata = this.getDatasetMetadata();
      const mode = buildMode(partition, datasetMetadata.types);

      return { ...configuration, factorization: { partition, mode } };
    }

    return configuration;
  }

  getDatasetMetadata() {
    if (this.state.isCarDataset) {
      return carDatasetMetadata;
    } else {
      return jobDatasetMetadata;
    }
  }

  traceBackendWasInitialized() {
    const grid = this.state.dataset.get_parsed_columns_by_names(
      this.state.columnNames
    );
    const categories = this.state.dataset.getParsedCategoriesByNames(
      this.state.columnNames
    );
    this.setState(
      {
        fakePointGrid: grid,
        categories,
      },
      this.sendLabelDataForComputation.bind(this)
    );
  }

  sendLabelDataForComputation() {
    var nPointToSend = this.state.lastIndice === 0 ? 2 : 1;
    var lastIndice = this.state.lastIndice;
    var pointsToSend = d3.range(nPointToSend).map((e, i) => {
      return this.state.traceDataset.get_point(i + lastIndice);
    });

    this.setState(
      {
        isComputing: true,
        lastIndice: lastIndice + nPointToSend,
      },
      () => {
        sendPointBatch(pointsToSend, (response) => {
          this.dataReceived(response, pointsToSend);
        });
      }
    );
  }

  /* Process and data received from the backend and put it in the component state */
  dataReceived(response, sentPoints) {
    const newAllLabeledPoints = [
      ...this.state.allLabeledPoints,
      sentPoints.map(this.getDataPointFromId.bind(this)),
    ];

    // const newProjectionHistory = [
    //   ...this.state.projectionHistory,
    //   JSON.parse(response.projectionPredictions),
    // ];

    const modelPredictions = response.labeledPointsOverGrid.map((point) => ({
      id: point.id,
      label: modelPredictionMap[point.label],
    }));

    var newState = {
      allLabeledPoints: newAllLabeledPoints,
      modelPredictionHistory: [
        ...this.state.modelPredictionHistory,
        modelPredictions,
      ],
      // projectionHistory: newProjectionHistory,
      classifierStatsHistory: [
        ...this.state.classifierStatsHistory,
        this.computeClassifierStats(modelPredictions),
      ],
      nIteration: this.state.nIteration + 1,
      showLoading: false,
      isComputing: false,
    };

    if (this.state.useTSM) {
      const TSMPredictions = response.TSMPredictionsOverGrid.map((point) => ({
        id: point.id,
        label: TSMPredictionMap[point.label],
      }));

      newState["TSMPredictionHistory"] = [
        ...this.state.TSMPredictionHistory,
        TSMPredictions,
      ];

      newState["TSMStatsHistory"] = [
        ...this.state.TSMStatsHistory,
        this.computeTSMStats(TSMPredictions),
      ];
    }

    this.setState(newState);
  }

  getDataPointFromId(sentPoint) {
    const id = sentPoint.id;

    var data = {
      id: id,
      label: this.getLabelFromPoint(sentPoint),
      data: this.state.dataset
        .get_selected_columns_point(id)
        .map((e) => parseFloat(e)),
    };

    return data;
  }

  getLabelFromPoint(point) {
    if (this.state.useFactorizedInformation) {
      return point.labels.every((e) => e === 1) ? 1 : 0;
    }
    return point.label;
  }

  computeClassifierStats(modelPredictions) {
    return {
      positive: modelPredictions.filter((e) => e.label === 1).length,
      negative: modelPredictions.filter((e) => e.label !== 1).length,
    };
  }

  computeTSMStats(TSMPredictions) {
    return {
      positive: TSMPredictions.filter((e) => e.label === 1).length,
      negative: TSMPredictions.filter((e) => e.label === -1).length,
      unknown: TSMPredictions.filter((e) => e.label === 0).length,
    };
  }

  saveTrace() {
    var state = this.state;
    state.loadMode = true;
    const jsonState = JSON.stringify(state);

    var data = new Blob([jsonState]);
    var a = document.getElementById("download-trace");
    a.href = URL.createObjectURL(data);
  }

  loadTrace() {
    if (document.getElementById("load-trace").files.length === 0) {
      alert("Please select a trace file.");
      return;
    }

    loadFileFromInputFile("load-trace", (event) => {
      var state = JSON.parse(event.target.result);
      var dataset = state.dataset;
      Object.setPrototypeOf(dataset, Dataset.prototype); //prototype is not saved in state so we need to reaffect it

      state.dataset = dataset;
      this.setState(state);
    });
  }
}

function getFileExtension(id) {
  var filePath = $("#" + id).val();
  const ext = filePath.substr(filePath.lastIndexOf(".") + 1, filePath.length);
  return ext;
}

export default QueryTrace;
