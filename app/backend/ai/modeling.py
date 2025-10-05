from __future__ import annotations
from typing import Dict, Any, Tuple, List, Optional
import numpy as np
import optuna
from sklearn.model_selection import StratifiedKFold, GroupKFold
from sklearn.metrics import roc_auc_score, average_precision_score
from lightgbm import LGBMClassifier
from utils import get_logger

logger = get_logger("modeling")

def build_param_space(trial: optuna.trial.Trial, use_gpu: bool=False) -> Dict[str, Any]:
    params = {
        "objective":"binary",
        "boosting_type":"gbdt",
        "learning_rate": trial.suggest_float("learning_rate", 1e-4, 1e-1, log=True),
        "num_leaves": trial.suggest_int("num_leaves", 16, 1024, log=True),
        "max_depth": trial.suggest_int("max_depth", -1, 15),
        "min_child_samples": trial.suggest_int("min_child_samples", 5, 300),
        "subsample": trial.suggest_float("subsample", 0.4, 1.0),
        "colsample_bytree": trial.suggest_float("colsample_bytree", 0.3, 1.0),
        "reg_alpha": trial.suggest_float("reg_alpha", 1e-8, 10.0, log=True),
        "reg_lambda": trial.suggest_float("reg_lambda", 1e-8, 10.0, log=True),
        "min_split_gain": trial.suggest_float("min_split_gain", 0.0, 1.0),
        "n_estimators": trial.suggest_int("n_estimators", 200, 3000),
        "random_state": 42,
        "class_weight": "balanced",
        "n_jobs": -1,
    }
    if use_gpu:
        params["device_type"] = "gpu"
    return params

def optuna_cv(
    X: np.ndarray, y: np.ndarray, feature_names: List[str],
    n_splits: int = 5, groups: Optional[np.ndarray]=None, n_trials: int = 100, use_gpu: bool=False,
    study_name: Optional[str]=None, study_path: Optional[str]=None
) -> Tuple[Dict[str, Any], optuna.Study]:

    def objective(trial: optuna.trial.Trial):
        params = build_param_space(trial, use_gpu=use_gpu)
        if groups is not None:
            cv = GroupKFold(n_splits=n_splits)
            splits = cv.split(X, y, groups)
        else:
            cv = StratifiedKFold(n_splits=n_splits, shuffle=True, random_state=42)
            splits = cv.split(X, y)
        aucs, prs = [], []
        for train_idx, val_idx in splits:
            Xtr, Xva = X[train_idx], X[val_idx]
            ytr, yva = y[train_idx], y[val_idx]
            model = LGBMClassifier(**params)
            model.fit(Xtr, ytr, eval_set=[(Xva, yva)], eval_metric="auc")
            p = model.predict_proba(Xva)[:,1]
            aucs.append(roc_auc_score(yva, p))
            prs.append(average_precision_score(yva, p))
        trial.set_user_attr("mean_pr_auc", float(np.mean(prs)))
        return float(np.mean(aucs))

    study = optuna.create_study(direction="maximize", study_name=study_name, sampler=optuna.samplers.TPESampler(seed=42))
    study.optimize(objective, n_trials=n_trials, n_jobs=1, show_progress_bar=False)

    best_params = study.best_trial.params

    # Parâmetros FIXOS que não são parte da busca
    fixed = {
        "objective": "binary",
        "boosting_type": "gbdt",
        "random_state": 42,
        "class_weight": "balanced",
        "n_jobs": -1,
    }
    if use_gpu:
        fixed["device_type"] = "gpu"

    for k, v in fixed.items():
        best_params.setdefault(k, v)

    if study_path:
        import joblib, os
        os.makedirs(os.path.dirname(study_path), exist_ok=True)
        joblib.dump(study, study_path)

    return best_params, study

def fit_final_model(X, y, params: Dict[str, Any]) -> LGBMClassifier:
    model = LGBMClassifier(**params)
    model.fit(X, y)
    return model