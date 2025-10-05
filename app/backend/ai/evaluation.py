
from __future__ import annotations
from typing import Dict, Any, List, Tuple
import os
import numpy as np
import pandas as pd
from sklearn import metrics
import matplotlib.pyplot as plt
import shap

from utils import ensure_dir, save_json, get_logger

logger = get_logger("evaluation")

def compute_all_metrics(y_true: np.ndarray, y_prob: np.ndarray, threshold: float=0.5) -> Dict[str, float]:
    y_pred = (y_prob >= threshold).astype(int)
    roc_auc = metrics.roc_auc_score(y_true, y_prob)
    pr_auc = metrics.average_precision_score(y_true, y_prob)
    acc = metrics.accuracy_score(y_true, y_pred)
    precision = metrics.precision_score(y_true, y_pred, zero_division=0)
    recall = metrics.recall_score(y_true, y_pred, zero_division=0)
    f1 = metrics.f1_score(y_true, y_pred, zero_division=0)
    brier = metrics.brier_score_loss(y_true, y_prob)
    tn, fp, fn, tp = metrics.confusion_matrix(y_true, y_pred).ravel()
    out = {
        "roc_auc": roc_auc, "pr_auc": pr_auc, "accuracy": acc, "precision": precision, "recall": recall,
        "f1": f1, "brier": brier, "tn": float(tn), "fp": float(fp), "fn": float(fn), "tp": float(tp)
    }
    return out

def precision_at_k(y_true: np.ndarray, y_prob: np.ndarray, k: float=0.1) -> float:
    n = int(np.ceil(len(y_true)*k))
    idx = np.argsort(-y_prob)[:n]
    return float(y_true[idx].mean())

def plot_roc(y_true: np.ndarray, y_prob: np.ndarray, path: str) -> None:
    fpr, tpr, _ = metrics.roc_curve(y_true, y_prob)
    auc = metrics.roc_auc_score(y_true, y_prob)
    plt.figure()
    plt.plot(fpr, tpr, label=f"AUC={auc:.3f}")
    plt.plot([0,1],[0,1],'--')
    plt.xlabel("FPR")
    plt.ylabel("TPR")
    plt.legend()
    plt.tight_layout()
    plt.savefig(path)
    plt.close()

def plot_pr(y_true: np.ndarray, y_prob: np.ndarray, path: str) -> None:
    precision, recall, _ = metrics.precision_recall_curve(y_true, y_prob)
    ap = metrics.average_precision_score(y_true, y_prob)
    plt.figure()
    plt.plot(recall, precision, label=f"AP={ap:.3f}")
    plt.xlabel("Recall")
    plt.ylabel("Precision")
    plt.legend()
    plt.tight_layout()
    plt.savefig(path)
    plt.close()

def plot_calibration(y_true: np.ndarray, y_prob: np.ndarray, path: str) -> None:
    from sklearn.calibration import calibration_curve
    prob_true, prob_pred = calibration_curve(y_true, y_prob, n_bins=10, strategy="quantile")
    plt.figure()
    plt.plot(prob_pred, prob_true, marker="o")
    plt.plot([0,1],[0,1],'--')
    plt.xlabel("Predicted probability")
    plt.ylabel("Empirical frequency")
    plt.tight_layout()
    plt.savefig(path)
    plt.close()

def plot_feature_importance(model, feature_names: List[str], path: str, top_n: int=30) -> None:
    import numpy as np
    import matplotlib.pyplot as plt
    if hasattr(model, "feature_importances_"):
        imp = model.feature_importances_
    else:
        imp = model.booster_.feature_importance(importance_type="gain")
    order = np.argsort(-imp)[:top_n]
    plt.figure(figsize=(6, max(4, int(top_n/2))))
    plt.barh(np.array(feature_names)[order][::-1], imp[order][::-1])
    plt.tight_layout()
    plt.savefig(path)
    plt.close()

def plot_shap_summary(model, X: np.ndarray, feature_names: List[str], path: str) -> None:
    import warnings
    # Silenciar avisos conhecidos do SHAP com LightGBM binário e do RNG futuro do NumPy
    warnings.filterwarnings("ignore", message="LightGBM binary classifier.*", category=UserWarning, module="shap")
    warnings.filterwarnings("ignore", category=FutureWarning, module="shap")

    explainer = shap.TreeExplainer(model)
    vals = explainer.shap_values(X)

    # SHAP >= 0.40: binário -> lista [classe_0, classe_1]
    if isinstance(vals, list) and len(vals) == 2:
        vals_to_plot = vals[1]  # classe positiva
    else:
        vals_to_plot = vals

    # summary_plot aceita ndarray para 'features' + nomes separados
    shap.summary_plot(vals_to_plot, features=X, feature_names=feature_names, show=False)
    plt.tight_layout()
    plt.savefig(path, bbox_inches="tight")
    plt.close()
