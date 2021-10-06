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

import * as d3 from "d3";

import Dataset from "./Dataset";

class TraceDataset extends Dataset {
  static buildFromLoadedInput(fileContent, isCSV) {
    var csv = isCSV ? d3.csvParse(fileContent) : d3.tsvParse(fileContent);
    var dataset = new TraceDataset(csv);

    dataset.parse_trace();
    return dataset;
  }

  parse_initial_sampling() {}

  get_point(id) {
    return {
      id: this.point_indices[id],
      label: this.labels[id],
    };
  }

  parse_trace() {
    this.labels = this.get_raw_col_by_name("labels").flatMap((s) => {
      //var cleanedStr = e.replace("0.", "0").replace("1.", "1").replace(' ', ',')
      var cleanedStr = s;
      return JSON.parse(cleanedStr);
      //return parseFloat(e.replace(/[\[\]']/g,'' ))
    });

    this.point_indices = this.get_raw_col_by_name("labeled_indexes").flatMap(
      (e) => {
        return JSON.parse(e);
        //return parseFloat(e.replace(/[\[\]']/g,'' ))
      }
    );
  }
}

export default TraceDataset;
