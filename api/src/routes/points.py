import json
import dill
import pandas as pd

from flask import Blueprint, session, request, jsonify
from flask_cors import cross_origin

from aideme.initial_sampling import random_sampler
from aideme.explore import PartitionedDataset, ExplorationManager
from aideme.active_learning import SimpleMargin, KernelVersionSpace

from .endpoints import INITIAL_UNLABELED_POINTS
from ..db import db_client
from ..utils import get_dataset_path


bp = Blueprint("initial points", __name__, url_prefix=INITIAL_UNLABELED_POINTS)


@bp.route("", methods=["POST"])
@cross_origin(supports_credentials=True)
def get_initial_points_to_label():
    configuration = json.loads(request.form["configuration"])
    column_ids = json.loads(request.form["columnIds"])
    session_id = session["session_id"]

    if db_client.exists(session_id) == 0:
        return {"errorMessage": "Session expired"}

    dataset = pd.read_csv(
        get_dataset_path(session_id),
        db_client.hget(session_id, "separator").decode("utf-8"),
        usecols=column_ids,
    ).to_numpy()
    # TODO: normalize, categorical columns, null values

    if configuration["activeLearner"]["name"] == "SimpleMargin":
        learner = configuration["activeLearner"]["svmLearner"]
        active_learner = SimpleMargin(
            C=learner["C"],
            kernel=learner["kernel"]["name"]
            if learner["kernel"]["name"] != "gaussian"
            else "rbf",
            gamma=learner["kernel"]["gamma"]
            if learner["kernel"]["gamma"] > 0
            else "auto",
        )
    else:
        learner = configuration["activeLearner"]["learner"]
        active_learner = KernelVersionSpace(
            n_samples=learner["sampleSize"],
            add_intercept=learner["versionSpace"]["addIntercept"],
            cache_samples=learner["versionSpace"]["hitAndRunSampler"]["cache"],
            rounding=learner["versionSpace"]["hitAndRunSampler"]["rounding"],
            thin=learner["versionSpace"]["hitAndRunSampler"]["selector"]["thin"],
            warmup=learner["versionSpace"]["hitAndRunSampler"]["selector"]["warmUp"],
            kernel=learner["versionSpace"]["kernel"]["name"]
            if learner["versionSpace"]["kernel"]["name"] != "gaussian"
            else "rbf",
        )

    exploration_manager = ExplorationManager(
        PartitionedDataset(dataset),
        active_learner,
        subsampling=configuration["subsampleSize"],
        initial_sampler=random_sampler(sample_size=3),
    )

    db_client.hset(session_id, "exploration_manager", dill.dumps(exploration_manager))

    next_points_to_label = exploration_manager.get_next_to_label()

    return jsonify(
        [
            {"id": int(idx), "data": {"array": dataset[idx, :].tolist()}}
            for idx in next_points_to_label
        ]
    )
