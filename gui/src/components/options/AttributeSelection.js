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

import DataExploration from "../visualisation/DataExploration";

class AttributeSelection extends Component {
  render() {
    return (
      <div>
        <div className="row">
          <div className="col col-lg-12">
            <p>
              Explore the dataset and pick the variables for the labeling phase.
            </p>
          </div>
        </div>

        <div className="row">
          <div className="col col-lg-3" id="column-picker">
            <h3>Column name</h3>

            {this.props.columns.map((column, key) => (
              <div key={key} className="">
                <div className="form-check form-check-inline">
                  <input
                    id={"column-" + column}
                    name={"column" + key}
                    type="checkbox"
                    value={key}
                    className="form-check-input"
                    onClick={this.props.onCheckedColumn}
                    defaultChecked={this.props.checkboxes[key]}
                  />

                  <label
                    className="column-name-label"
                    htmlFor={"column-" + column}
                  >
                    {column || "Not available"}
                  </label>
                </div>
              </div>
            ))}
          </div>

          <div className="col col-lg-9">
            <DataExploration
              dataset={this.props.dataset}
              firstVariable={this.props.firstVariable}
              secondVariable={this.props.secondVariable}
              chosenColumns={this.props.chosenColumns}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default AttributeSelection;
