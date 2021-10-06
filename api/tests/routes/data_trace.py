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

ENCODED_DATASET_NAME = "cars_encoded.csv"
SEPARATOR = ","
NUM_ROWS = 5622

SELECTED_COLS_IN_ENCODED_DATASET = [
    2,
    3,
    15,
    28,
    29,
    30,
    31,
    32,
    33,
    34,
    35,
    36,
    37,
    38,
    39,
    40,
    41,
    42,
    43,
    44,
    45,
    46,
    47,
    48,
    49,
    50,
    51,
    52,
    72,
    73,
    74,
    75,
    76,
    77,
    78,
    79,
    509,
    510,
    511,
    512,
    513,
    514,
    515,
    516,
    517,
    518,
    519,
    520,
    521,
    522,
    523,
    524,
    525,
    526,
    527,
    528,
    529,
    530,
]


FACTORIZED_SIMPLE_MARGIN_CONFIGURATION = {
    "activeLearner": {
        "name": "FactorizedDualSpaceModel",
        "params": {
            "active_learner": {"name": "SimpleMargin", "params": {"C": 100000.0}}
        },
    },
    "subsampling": 50000,
    "factorization": {
        "partition": [
            [2, 3],
            [15],
            [
                28,
                29,
                30,
                31,
                32,
                33,
                34,
                35,
                36,
                37,
                38,
                39,
                40,
                41,
                42,
                43,
                44,
                45,
                46,
                47,
                48,
                49,
                50,
                51,
                52,
            ],
            [72, 73, 74, 75, 76, 77, 78, 79],
            [
                509,
                510,
                511,
                512,
                513,
                514,
                515,
                516,
                517,
                518,
                519,
                520,
                521,
                522,
                523,
                524,
                525,
                526,
                527,
                528,
                529,
                530,
            ],
        ],
        "mode": ["persist", "persist", "categorical", "categorical", "categorical"],
    },
}

LABELED_POINTS = [
    {"id": 2554, "labels": [1.0, 1.0, 1.0, 1.0, 1.0]},
    {"id": 1064, "labels": [1.0, 0.0, 0.0, 0.0, 1.0]},
]
