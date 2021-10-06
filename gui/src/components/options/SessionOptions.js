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

import {
  SIMPLE_MARGIN,
  simpleMarginConfiguration,
  versionSpaceConfiguration,
  factorizedDualSpaceConfiguration,
  factorizedVersionSpaceConfiguration,
  subsampling,
} from "../../constants/constants";

import sendConfiguration from "../../actions/sendConfiguration";

import AttributeSelection from "./AttributeSelection";
import GroupVariables from "./GroupVariables";
import AdvancedOptions from "./AdvancedOptions";

class SessionOptions extends Component {
  constructor(props) {
    super(props);

    var datasetInfos = this.props.datasetInfos;

    var chosenColumns = datasetInfos.columns.map((name, idx) => ({
      name,
      idx,
      isUsed: false,
      type: datasetInfos.types[idx],
    }));

    this.state = {
      showColumns: true,
      showVariableGroups: false,
      showAdvancedOptions: false,

      firstVariable: 0,
      secondVariable: 1,
      columnTypes: datasetInfos.types,

      checkboxes: datasetInfos.columns.map((c) => false),
      chosenColumns: chosenColumns,

      groups: [[]],

      learner: SIMPLE_MARGIN,
    };
  }

  render() {
    return (
      <div>
        <ul className="nav nav-tabs bg-primary">
          <li className="nav-item">
            <a
              className={
                this.state.showColumns ? "nav-link active" : "nav-link"
              }
              href="javascript:void(0)"
              onClick={this.onBasicOptionClick.bind(this)}
            >
              Attribute selection
            </a>
          </li>

          <li className="nav-item">
            <a
              className={
                this.state.showVariableGroups ? "nav-link active" : "nav-link"
              }
              href="javascript:void(0)"
              onClick={this.onVariableGrouping.bind(this)}
            >
              Factorization structure
            </a>
          </li>

          <li className="nav-item">
            <a
              className={
                this.state.showAdvancedOptions ? "nav-link active" : "nav-link"
              }
              href="javascript:void(0)"
              onClick={this.onAdvancedOptionClick.bind(this)}
            >
              Algorithm selection
            </a>
          </li>

          <li>
            <a
              className="nav-link"
              onClick={this.onSessionStartClick.bind(this)}
            >
              Start session
            </a>
          </li>
        </ul>

        <form id="choose-columns" className="card">
          {this.state.showColumns && (
            <AttributeSelection
              columns={this.props.datasetInfos.columns}
              checkboxes={this.state.checkboxes}
              dataset={this.props.dataset}
              firstVariable={this.state.firstVariable}
              secondVariable={this.state.secondVariable}
              chosenColumns={this.state.chosenColumns}
              onCheckedColumn={this.onCheckedColumn.bind(this)}
            />
          )}

          {this.state.showVariableGroups && (
            <GroupVariables
              chosenColumns={this.state.chosenColumns}
              groups={this.state.groups}
              addGroup={this.addGroup.bind(this)}
              onVariableAddedToGroup={this.onVariableAddedToGroup.bind(this)}
              onVariableRemovedFromGroup={this.onVariableRemovedFromGroup.bind(
                this
              )}
            />
          )}

          {this.state.showAdvancedOptions && (
            <AdvancedOptions
              learner={this.state.learner}
              learnerChanged={this.learnerChanged.bind(this)}
            />
          )}
        </form>
      </div>
    );
  }

  componentDidMount() {
    window.$("form").bootstrapMaterialDesign();
    window.$("select").select();
  }

  onVariableGrouping() {
    this.setState({
      showAdvancedOptions: false,
      showColumns: false,
      showVariableGroups: true,
    });
  }

  onBasicOptionClick() {
    this.setState({
      showAdvancedOptions: false,
      showColumns: true,
      showVariableGroups: false,
    });
  }

  onAdvancedOptionClick() {
    this.setState({
      showAdvancedOptions: true,
      showColumns: false,
      showVariableGroups: false,
    });
  }

  onCheckedColumn(e) {
    var newCheckboxes = [...this.state.checkboxes];
    newCheckboxes[e.target.value] = e.target.checked;

    var newChosenColumns = [...this.state.chosenColumns];
    newChosenColumns[e.target.value].isUsed = e.target.checked;

    this.setState({
      checkboxes: newCheckboxes,
      chosenColumns: newChosenColumns,
    });
  }

  learnerChanged(newLearner) {
    this.setState({ learner: newLearner });
  }

  addGroup() {
    this.setState({
      groups: [...this.state.groups, []],
    });
  }

  onVariableAddedToGroup(groupId, variableId) {
    const variable = this.state.chosenColumns[variableId];
    const newVariable = {
      ...variable,
      ...{ realId: variableId, id: variableId },
    };

    var newGroups = [...this.state.groups];

    var modifiedGroup = newGroups[groupId];
    if (!this.isVariableInGroup(modifiedGroup, newVariable)) {
      modifiedGroup.push(variable);
    }
    newGroups[groupId] = modifiedGroup;

    this.setState({
      groups: newGroups,
    });
  }

  isVariableInGroup(group, variable) {
    const names = group.map((e) => e.name);
    return names.includes(variable.name);
  }

  onVariableRemovedFromGroup(groupId, variableId) {
    var newGroups = [...this.state.groups];

    newGroups[groupId] = newGroups[groupId].filter(
      (variable) => variable.idx !== variableId
    );

    this.setState({
      groups: newGroups,
    });
  }

  onSessionStartClick(e) {
    const chosenColumns = this.state.chosenColumns.filter((col) => col.isUsed);

    if (chosenColumns.length === 0) {
      alert("Please select attributes.");
      return;
    }

    const columnsInGroups = this.state.groups.flat(); // columns may be repeated
    const useFactorization = columnsInGroups.length > 0;

    var configuration;
    var columns;
    var groups;
    if (useFactorization) {
      columns = columnsInGroups;
      configuration = this.buildFactorizationConfiguration();

      var newGroups = this.state.groups.filter((group) => group.length > 0);
      this.computeVariableColumnIndices(newGroups);
      groups = newGroups;
    } else {
      columns = chosenColumns;
      configuration = this.buildNonFactorizationConfiguration();
      groups = null;
    }

    sendConfiguration(columns, configuration, this.props.sessionWasStarted);

    this.props.sessionOptionsWereChosen(columns, groups, configuration);
  }

  buildNonFactorizationConfiguration() {
    const activeLearner =
      this.state.learner === SIMPLE_MARGIN
        ? simpleMarginConfiguration
        : versionSpaceConfiguration;

    return { activeLearner, subsampling };
  }

  buildFactorizationConfiguration() {
    const activeLearner =
      this.state.learner === SIMPLE_MARGIN
        ? factorizedDualSpaceConfiguration
        : factorizedVersionSpaceConfiguration;

    const partition = this.state.groups.map((variables) =>
      variables.map((v) => v.idx)
    );

    return {
      activeLearner,
      subsampling,
      factorization: { partition },
    };
  }

  computeVariableColumnIndices(groups) {
    var i = 0;

    groups.forEach((variables) => {
      variables.forEach((variable) => {
        variable["realId"] = i;
        i++;
      });
    });
  }
}

export default SessionOptions;
