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

class LabelInfos extends Component {
  render() {
    const labeledPoints = this.props.labeledPoints
      .slice(0, this.props.iteration + 1)
      .flat();

    var nNegativeSamples = labeledPoints.filter((e) => e.label === 0).length;
    var nPositiveSamples = labeledPoints.filter((e) => e.label === 1).length;
    var nLabeledPoints = labeledPoints.length;

    return (
      <div id="iteration-labels">
        <div>Labeled samples {nLabeledPoints}</div>

        <div>Positive labels {nPositiveSamples}</div>

        <div>Negative labels {nNegativeSamples}</div>
      </div>
    );
  }
}

export default LabelInfos;
