import dill

from aideme.active_learning.dsm import FactorizedDualSpaceModel

from . import db_client


def save_factorized_active_learner(
    session_id, active_learner, sample_unknown_proba, partition, mode
):
    factorization_params = {
        "sample_unknown_proba": sample_unknown_proba,
        "partition": partition,
        "mode": mode,
    }

    db_client.hset(session_id, "active_learner", dill.dumps(active_learner))
    db_client.hset(session_id, "factorization", dill.dumps(factorization_params))


def save_exploration_manager(
    session_id, exploration_manager, without_active_learner=False
):

    if without_active_learner:
        active_learner = exploration_manager.active_learner
        exploration_manager.active_learner = None
        db_client.hset(
            session_id, "exploration_manager", dill.dumps(exploration_manager)
        )
        exploration_manager.active_learner = active_learner
    else:
        db_client.hset(
            session_id, "exploration_manager", dill.dumps(exploration_manager)
        )


def load_exploration_manager(session_id, with_separate_active_learner=False):
    exploration_manager = dill.loads(db_client.hget(session_id, "exploration_manager"))

    if with_separate_active_learner:
        active_learner = dill.loads(db_client.hget(session_id, "active_learner"))
        factorization_params = dill.loads(db_client.hget(session_id, "factorization"))

        exploration_manager.active_learner = FactorizedDualSpaceModel(
            active_learner,
            sample_unknown_proba=factorization_params["sample_unknown_proba"],
            partition=factorization_params["partition"],
            mode=factorization_params["mode"],
        )

    return exploration_manager
