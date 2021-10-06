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
import LearnerOptions from "./LearnerOptions";
import { learnersInInteractiveSession } from "../../constants/constants";

class AdvancedOptions extends Component {
  render() {
    return (
      <div className="row">
        <div className="col col-lg-6 offset-lg-3">
          <LearnerOptions
            learners={learnersInInteractiveSession}
            selected={this.props.learner}
            learnerChanged={this.props.learnerChanged}
          />
          {/* <div className="form-group">
            <label htmlFor="algorithm-selection">Learner</label>
            <select
              className="form-control"
              id="algorithm-selection"
              name="active-learner"
              onChange={this.props.onLearnerChange}
            >
              {learnersInInteractiveSession.map((learner, idx) => (
                <option
                  key={`learner-${idx}`}
                  value={learner.value}
                  selected={learner.value === this.props.learner}
                >
                  {learner.label}
                </option>
              ))}
            </select>
          </div> */}
        </div>
      </div>
    );
  }
}

export default AdvancedOptions;
