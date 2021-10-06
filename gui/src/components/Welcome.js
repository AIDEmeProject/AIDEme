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

import welcomeImg from "../resources/welcome.png";

class Welcome extends Component {
  render() {
    return (
      <div className="row">
        <div className="col col-lg-6 offset-lg-3">
          <div className="center">
            <h1>Welcome to AIDEme</h1>

            <p>
              <img src={welcomeImg} width="600" alt="AIDEme keywords" />
            </p>
            <p className="">
              <button
                className="btn btn-raised"
                onClick={this.props.onTraceClick}
              >
                Trace session
              </button>
              <button
                className="btn btn-raised"
                onClick={this.props.onInteractiveSessionClick}
              >
                Interactive session
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }
}

export default Welcome;
