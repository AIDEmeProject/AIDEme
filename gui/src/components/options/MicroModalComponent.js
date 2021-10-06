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

import MicroModal from "micromodal";

class MicroModalComponent extends Component {
  render() {
    return (
      <div className="modal micromodal-slide" id="modal-1" aria-hidden="true">
        <div className="modal__overlay" tabIndex="-1" data-micromodal-close>
          <div
            className="modal__container"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-1-title"
          >
            <header className="modal__header">
              <h2 className="modal__title" id="modal-1-title">
                {this.props.title}
              </h2>
            </header>
            <main className="modal__content" id="modal-1-content">
              <div>{this.props.children}</div>
            </main>
            <footer className="modal__footer">
              <button
                className="btn btn-primary"
                onClick={this.props.onClose}
                role="button"
                type="button"
              >
                Close
              </button>
            </footer>
          </div>
        </div>
      </div>
    );
  }

  componentDidMount() {
    MicroModal.init({
      onClose: () => {
        MicroModal.close("modal-1");
        this.props.onClose();
      },
    });
    MicroModal.show("modal-1");
  }

  componentWillUnmount() {
    MicroModal.close("modal-1");
  }
}

MicroModalComponent.defaultProps = {
  title: "title",
};

export default MicroModalComponent;
