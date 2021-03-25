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
