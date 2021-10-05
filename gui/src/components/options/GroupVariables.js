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

import MicroModalComponent from "./MicroModalComponent";
import Group from "./Group";

import robot from "../../resources/robot.png";

class GroupEditor extends Component {
  render() {
    const variablesInGroup = this.props.group.map((variable) => variable.idx);
    return (
      <div>
        {this.props.chosenColumns.map((variable, i) => {
          return (
            <div key={i} className="form-inline in-line">
              <label htmlFor={"column-group-" + i}>{variable.name}</label>
              <input
                id={"column-group-" + i}
                type="checkbox"
                className="form-control"
                data-variableid={variable.idx}
                checked={variablesInGroup.includes(variable.idx)}
                onChange={this.onVariableClick.bind(this)}
              />
            </div>
          );
        })}
      </div>
    );
  }

  onVariableClick(e) {
    const iVariable = parseInt(e.target.dataset.variableid);

    if (e.target.checked) {
      this.props.onVariableAddedToGroup(this.props.iGroup, iVariable);
    } else {
      this.props.onVariableRemovedFromGroup(this.props.iGroup, iVariable);
    }
  }
}

class GroupVariables extends Component {
  constructor(props) {
    super(props);

    this.state = {
      editedGroupId: null,
    };
  }

  render() {
    return (
      <div>
        <h4>Variable subgroups</h4>

        <p className="card">
          <span className="chatbot-talk">
            <img src={robot} width="50" alt="robot" />
            <q>
              By grouping variables in formal subgroups, the convergence speed
              can be improved. Group variables by click on "Edit" on a given
              group.
            </q>
          </span>
        </p>

        <div>
          <button
            role="button"
            type="button"
            className="btn btn-primary btn-raised"
            onClick={this.props.addGroup}
          >
            Add group
          </button>
        </div>

        <div>
          {this.props.groups.map((group, iGroup) => {
            return (
              <div key={iGroup} className="card group">
                <p>
                  Group {iGroup + 1}
                  <button
                    type="button"
                    role="button"
                    data-group={iGroup}
                    className="btn btn-primary"
                    onClick={this.onGroupEdit.bind(this)}
                  >
                    Edit
                  </button>
                </p>

                <Group
                  group={group}
                  iGroup={iGroup}
                  onVariableRemovedFromGroup={
                    this.props.onVariableRemovedFromGroup
                  }
                />
              </div>
            );
          })}
        </div>

        {this.state.editedGroupId !== null && (
          <MicroModalComponent
            title={
              "Edition of group " + String(Number(this.state.editedGroupId) + 1)
            }
            onClose={this.closeGroupEditor.bind(this)}
          >
            <GroupEditor
              group={this.props.groups[this.state.editedGroupId]}
              iGroup={this.state.editedGroupId}
              chosenColumns={this.props.chosenColumns.filter((e) => e.isUsed)}
              onVariableAddedToGroup={this.props.onVariableAddedToGroup}
              onVariableRemovedFromGroup={this.props.onVariableRemovedFromGroup}
            />
          </MicroModalComponent>
        )}
      </div>
    );
  }

  componentDidUpdate() {
    window.$("input").bootstrapMaterialDesign();
  }

  onGroupEdit(e) {
    const groupId = e.target.dataset.group;

    this.setState({
      editedGroupId: groupId,
    });
  }

  closeGroupEditor(e) {
    e.preventDefault();
    this.setState({ editedGroupId: null });
  }
}

export default GroupVariables;
