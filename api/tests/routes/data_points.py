SIMPLE_MARGIN_CONFIGURATION = {
    "activeLearner": {
        "name": "SimpleMargin",
        "svmLearner": {
            "C": 1024,
            "kernel": {"gamma": 0, "name": "gaussian"},
            "name": "SVM",
        },
    },
    "subsampleSize": 50000,
    "useFactorizationInformation": False,
}

VERSION_SPACE_CONFIGURATION = {
    "activeLearner": {
        "learner": {
            "name": "MajorityVote",
            "sampleSize": 8,
            "versionSpace": {
                "addIntercept": True,
                "hitAndRunSampler": {
                    "cache": True,
                    "rounding": True,
                    "selector": {"name": "WarmUpAndThin", "thin": 10, "warmUp": 100},
                },
                "kernel": {"name": "gaussian"},
                "solver": "ojalgo",
            },
        },
        "name": "UncertaintySampler",
    },
    "subsampleSize": 50000,
    "task": "sdss_Q4_0.1%",
}

FACTORIZED_SIMPLE_MARGIN_CONFIGURATION = {
    **SIMPLE_MARGIN_CONFIGURATION,
    "multiTSM": {
        "hasTsm": True,
        "searchUnknownRegionProbability": 0.5,
        "columns": ["age", "indice_glycemique", "sex"],
        "decompose": True,
        "flags": [[True, False], [True, True]],
        "featureGroups": [["age", "indice_glycemique"], ["sex"]],
    },
}

FACTORIZED_VERSION_SPACE_CONFIGURATION = {
    **VERSION_SPACE_CONFIGURATION,
    "multiTSM": {
        "hasTsm": True,
        "searchUnknownRegionProbability": 0.5,
        "columns": ["age", "indice_glycemique", "sex", "indice_glycemique"],
        "decompose": True,
        "flags": [[True, False], [True, False]],
        "featureGroups": [["age", "indice_glycemique"], ["sex", "indice_glycemique"]],
    },
}
