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

class PredictionStatistics extends Component {
  render() {
    return (
      <div id="prediction-stats">
        <h5>Classifier statistics</h5>

        <table className="table">
          <tbody>
            <tr>
              <td>Positive</td>
              <td>{this.props.stats.positive}</td>
            </tr>

            <tr>
              <td>Negative</td>
              <td>{this.props.stats.negative}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}

export default PredictionStatistics;
