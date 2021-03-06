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

import axios from "axios";

import { backend } from "../../constants/constants";
import loadFileFromInputFile from "../../lib/data_utils";

function uploadFile(file, separator, onSuccess) {
  var formData = new FormData();
  formData.append("dataset", file);
  formData.append("separator", separator);

  axios
    .post(backend + "/new-session", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      withCredentials: true,
    })
    .then((response) => {
      onSuccess(response.data);
    })
    .catch((e) => {
      alert(e);
    });
}

class NewSession extends Component {
  handleSubmit(event) {
    event.preventDefault();

    const file = document.querySelector("form input[type=file]").files[0];
    const separator = document.getElementById("csv-separator").value;

    if (!file) {
      alert("Please select a file");
      return;
    }

    uploadFile(file, separator, this.props.fileUploaded);

    loadFileFromInputFile("dataset", (event) => {
      this.props.datasetLoaded(event.target.result, separator);
    });
  }

  render() {
    return (
      <div className="row">
        <div className="col col-lg-6 offset-3 card">
          <h1>New session</h1>

          <div>
            <form onSubmit={this.handleSubmit.bind(this)}>
              <h6>1. Choose the dataset to be labeled</h6>
              <p>Datasets without missing values are supported.</p>
              <div className="form-group">
                <input
                  required
                  className="form-control-file"
                  id="dataset"
                  name="dataset"
                  type="file"
                  accept=".csv"
                />
              </div>

              <h6>2. Choose the separator</h6>
              <p>CSV, TSV and Semi-colon separators are supported.</p>
              <div className="form-group">
                <label htmlFor="separator">Separator</label>
                <select
                  className="form-control"
                  id="csv-separator"
                  name="separator"
                >
                  <option value=",">Comma ","</option>
                  <option value="\t">Tab</option>
                  <option value=";">Semi-colon ";"</option>
                </select>
              </div>

              <div className="form-group bmd-form-group">
                <input
                  className="btn btn-raised btn-primary"
                  type="submit"
                  value="Confirm"
                />
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }
}
export default NewSession;
