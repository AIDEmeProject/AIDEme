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
import { backend, webplatformApi } from "../constants/constants";

function explorationSendLabeledPoint(data, tokens, onSuccess) {
  const formattedLabeledPoints = data.labeledPoints.map((e) => ({
    id: e.id,
    label: e.label,
  }));

  $.ajax({
    type: "POST",
    dataType: "JSON",
    url: backend + "/data-point-were-labeled",
    xhrFields: {
      withCredentials: true,
    },
    data: {
      labeledPoints: JSON.stringify(formattedLabeledPoints),
    },

    success: onSuccess,
  });

  $.ajax({
    type: "PUT",
    dataType: "JSON",
    url: webplatformApi + "/session/" + tokens.sessionToken + "/new-label",
    headers: {
      Authorization: "Token " + tokens.authorizationToken,
    },
    data: {
      number_of_labeled_points: data.labeledPoints.length,
    },
  });
}

export default explorationSendLabeledPoint;
