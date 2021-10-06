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

class LearnerOptions extends Component {
  render() {
    return (
      <div className="form-group">
        <label htmlFor="algorithm-selection">Learner</label>
        <select
          className="form-control"
          id="algorithm-selection"
          name="active-learner"
          onChange={this.onLearnerChange.bind(this)}
        >
          {this.props.learners.map((learner, idx) => (
            <option
              key={`learner-${idx}`}
              value={learner.value}
              selected={learner.value === this.props.selected}
            >
              {learner.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  onLearnerChange(e) {
    this.props.learnerChanged(e.target.value);
  }
}

export default LearnerOptions;
