#  Copyright 2019 École Polytechnique
#
#  Authorship
#    Luciano Di Palma <luciano.di-palma@polytechnique.edu>
#    Enhui Huang <enhui.huang@polytechnique.edu>
#    Le Ha Vy Nguyen <nguyenlehavy@gmail.com>
#    Laurent Cetinsoy <laurent.cetinsoy@gmail.com>
#
#  Disclaimer
#    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
#    TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT. IN NO EVENT SHALL
#    THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
#    CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
#    IN THE SOFTWARE.

import numpy as np

from aideme.explore import LabeledSet


def create_labeled_set(labeled_points):
    if "labels" in labeled_points[0]:
        return LabeledSet(
            labels=[np.prod(point["labels"]) for point in labeled_points],
            partial=[point["labels"] for point in labeled_points],
            index=[point["id"] for point in labeled_points],
        )

    return LabeledSet(
        labels=[point["label"] for point in labeled_points],
        index=[point["id"] for point in labeled_points],
    )
