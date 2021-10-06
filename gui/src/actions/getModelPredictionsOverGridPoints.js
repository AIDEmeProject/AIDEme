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

import $ from "jquery";
import { backend } from "../constants/constants";
import { modelPredictionMap } from "../components/exploration/labelMaps";

function getModelPredictionsOverGridPoints(dataWasReceived) {
  $.ajax({
    type: "GET",
    dataType: "JSON",
    url: backend + "/get-model-predictions-over-grid-point",
    xhrFields: {
      withCredentials: true,
    },
    success: (rawPoints) => {
      const predictions = rawPoints.map((e) => {
        return {
          id: e.id,
          label: modelPredictionMap[e.label],
        };
      });

      dataWasReceived(predictions);
    },
  });
}

export default getModelPredictionsOverGridPoints;
