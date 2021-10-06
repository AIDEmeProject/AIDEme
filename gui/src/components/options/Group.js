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
