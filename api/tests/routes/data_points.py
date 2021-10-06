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

SIMPLE_MARGIN_CONFIGURATION = {
    "activeLearner": {"name": "SimpleMargin", "params": {"C": 100000.0}},
    "subsampling": 50000,
}


VERSION_SPACE_CONFIGURATION = {
    "activeLearner": {
        "name": "KernelVersionSpace",
        "params": {
            "decompose": True,
            "n_samples": 16,
            "warmup": 100,
            "thin": 100,
            "rounding": True,
            "rounding_cache": True,
            "rounding_options": {"strategy": "opt", "z_cut": True, "sphere_cuts": True},
        },
    },
    "subsampling": 50000,
}


FACTORIZED_SIMPLE_MARGIN_CONFIGURATION = {
    "activeLearner": {
        "name": "FactorizedDualSpaceModel",
        "params": {
            "active_learner": {"name": "SimpleMargin", "params": {"C": 100000.0}}
        },
    },
    "subsampling": 50000,
    "factorization": {
        "partition": [[1, 3], [2]],
    },
}


FACTORIZED_VERSION_SPACE_CONFIGURATION = {
    "activeLearner": {
        "name": "SubspatialVersionSpace",
        "params": {
            "loss": "PRODUCT",
            "decompose": True,
            "n_samples": 16,
            "warmup": 100,
            "thin": 100,
            "rounding": True,
            "rounding_cache": True,
            "rounding_options": {"strategy": "opt", "z_cut": True, "sphere_cuts": True},
        },
    },
    "subsampling": 50000,
    "factorization": {
        "partition": [[1, 3], [2, 3]],
    },
}
