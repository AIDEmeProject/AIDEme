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
