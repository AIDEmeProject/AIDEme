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

import Welcome from "./components/Welcome";
import NewSession from "./components/options/NewSession";
import SessionOptions from "./components/options/SessionOptions";
import InitialSampling from "./components/exploration/InitialSampling/InitialSampling";
import Exploration from "./components/exploration/Exploration";
import TSMExploration from "./components/exploration/TSM/TSMExploration";
import BreadCrumb from "./components/BreadCrumb";
import Trace from "./components/trace/Trace";

import MicroModal from "micromodal";

import "./App.css";
import logo from "./resources/logo.png";

import * as d3 from "d3";
import Dataset from "./model/Dataset";

const NEW_SESSION = "NewSession";
const SESSION_OPTIONS = "SessionOptions";
const INITIAL_SAMPLING = "InitialSampling";
const EXPLORATION = "Exploration";
const TSM_EXPLORATION = "TSMExploration";
const TRACE = "Trace";
const WELCOME = "Welcome";

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      step: WELCOME,
      bread: this.getBreadCrum(NEW_SESSION),

      datasetInfos: {},
      dataset: null,

      chosenColumns: [],
      groups: null,
      configuration: null,

      finalVariables: [],
      pointsToLabel: [],

      allLabeledPoints: [],
    };
  }

  getBreadCrum(step) {
    var group = step === TSM_EXPLORATION ? EXPLORATION : step;

    var names = {
      [NEW_SESSION]: "New session",
      [SESSION_OPTIONS]: "Session options",
      // [INITIAL_SAMPLING]: "Initial sampling",
      [EXPLORATION]: "Interactive labeling",
    };
    var order = [NEW_SESSION, SESSION_OPTIONS, EXPLORATION];

    return order.map((id) => ({ name: names[id], active: id === group }));
  }

  getCurrentView(step) {
    if (step === NEW_SESSION) {
      return (
        <NewSession
          fileUploaded={this.fileUploaded.bind(this)}
          datasetLoaded={this.datasetLoaded.bind(this)}
        />
      );
    }

    if (step === SESSION_OPTIONS) {
      return (
        <SessionOptions
          datasetInfos={this.state.datasetInfos}
          dataset={this.state.dataset}
          sessionWasStarted={this.sessionWasStarted.bind(this)}
          sessionOptionsWereChosen={this.sessionOptionsWereChosen.bind(this)}
        />
      );
    }

    if (step === INITIAL_SAMPLING) {
      return (
        <InitialSampling
          dataset={this.state.dataset}
          chosenColumns={this.state.chosenColumns}
          pointsToLabel={this.state.pointsToLabel}
          hasPositiveAndNegativeLabels={this.hasPositiveAndNegativeLabels.bind(
            this
          )}
          tokens={{
            authorizationToken: this.state.authorizationToken,
            sessionToken: this.state.sessionToken,
          }}
        />
      );
    }

    if (step === EXPLORATION) {
      return (
        <Exploration
          algorithm={this.state.configuration.activeLearner.name}
          dataset={this.state.dataset}
          chosenColumns={this.state.chosenColumns}
          finalVariables={this.state.finalVariables}
          pointsToLabel={this.state.pointsToLabel}
          allLabeledPoints={this.state.allLabeledPoints}
          tokens={{
            authorizationToken: this.state.authorizationToken,
            sessionToken: this.state.sessionToken,
          }}
        />
      );
    }

    if (step === TSM_EXPLORATION) {
      return (
        <TSMExploration
          algorithm={this.state.configuration.activeLearner.name}
          dataset={this.state.dataset}
          chosenColumns={this.state.chosenColumns}
          groups={this.state.groups}
          configuration={this.state.configuration}
          pointsToLabel={this.state.pointsToLabel}
          tokens={{
            authorizationToken: this.state.authorizationToken,
            sessionToken: this.state.sessionToken,
          }}
        />
      );
    }

    if (step === TRACE) {
      return <Trace />;
    }

    return (
      <Welcome
        onInteractiveSessionClick={this.onInteractiveSessionClick.bind(this)}
        onTraceClick={this.onTraceClick.bind(this)}
      />
    );
  }

  render() {
    return (
      <div>
        <ul className="navbar navbar-dark box-shadow">
          <li className="nav-item">
            <a className="navbar-brand" href="/">
              <img src={logo} height="50" alt="logo" /> AIDEme
            </a>
          </li>

          <li className="nav-item">
            <BreadCrumb items={this.state.bread} />
          </li>
        </ul>

        <div className="App container-fluid">
          <div className="row">
            <div className="col col-lg-12">
              {this.getCurrentView(this.state.step)}
            </div>
          </div>

          <div className="row">
            <div className="col col-lg-10 offset-lg-1"></div>
          </div>

          <div id="pandas-profiling"></div>
        </div>
      </div>
    );
  }

  onTraceClick(e) {
    this.setState({ step: TRACE });
  }

  onInteractiveSessionClick() {
    this.setState({ step: NEW_SESSION });
  }

  datasetLoaded(dsv, separator) {
    const sep = (separator !== ",") & (separator !== ";") ? "\t" : separator;
    const parsed_rows = d3.dsvFormat(sep).parse(dsv);

    this.setState({
      dataset: new Dataset(parsed_rows),
    });
  }

  fileUploaded(response) {
    if (response.error) {
      alert(response.error);
      return;
    }

    this.setState({
      step: SESSION_OPTIONS,
      bread: this.getBreadCrum(SESSION_OPTIONS),
      datasetInfos: response,
    });
  }

  sessionOptionsWereChosen(chosenColumns, groups, configuration) {
    this.state.dataset.set_column_names_selected_by_user(chosenColumns);

    this.setState({ chosenColumns, groups, configuration });
  }

  sessionWasStarted(response) {
    const pointsToLabel = response.map((id) => ({ id }));

    if (this.state.groups) {
      this.setState({
        step: TSM_EXPLORATION,
        bread: this.getBreadCrum(TSM_EXPLORATION),
        pointsToLabel: pointsToLabel,
      });
    } else {
      this.setState({
        step: INITIAL_SAMPLING,
        bread: this.getBreadCrum(EXPLORATION),
        pointsToLabel: pointsToLabel,
      });
    }
  }

  hasPositiveAndNegativeLabels(allLabeledInitialPoints, pointsToLabel) {
    this.setState({
      step: EXPLORATION,
      bread: this.getBreadCrum(EXPLORATION),
      allLabeledPoints: [allLabeledInitialPoints],
      pointsToLabel,
    });
  }

  componentDidMount() {
    MicroModal.init();
  }
}

export default App;
