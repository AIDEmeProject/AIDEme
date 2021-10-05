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

class Group extends Component {
  render() {
    const iGroup = this.props.iGroup;

    return (
      <div>
        {this.props.group.map((variable, iVariable) => {
          return (
            <div className="" key={iVariable}>
              <div>
                {/* required because bs theme removes inner div */}
                <div className="">
                  {variable.name}{" "}
                  {/* <button
                    type="button"
                    className="btn btn-raised btn-sm"
                    data-variableid={variable.idx}
                    data-group={iGroup}
                    onClick={this.removeVariable.bind(this)}
                  >
                    Remove
                  </button> */}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // removeVariable(e) {
  //   this.props.onVariableRemovedFromGroup(
  //     this.props.iGroup,
  //     e.target.dataset.variableid
  //   );
  // }
}

export default Group;
