from __future__ import annotations
import argparse, os, sys, time, json
import numpy as np
import pandas as pd
from sklearn.impute import SimpleImputer
from typing import Optional

# Add src directory to sys.path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
SRC_DIR = os.path.join(CURRENT_DIR, "src")
if SRC_DIR not in sys.path:
    sys.path.append(SRC_DIR)


from app.backend.ai.utils import set_seed, get_logger, ensure_dir, save_json
from app.backend.ai.data_utils import load_dataset, infer_label, basic_clean, train_val_test_split
from app.backend.ai.feature_engineering import build_features, select_feature_columns
from app.backend.ai.modeling import optuna_cv, fit_final_model
from app.backend.ai.evaluation import (
    compute_all_metrics, plot_roc, plot_pr, plot_feature_importance,
    plot_calibration, plot_shap_summary, precision_at_k
)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dataset", type=str, required=True, choices=["kepler","toi","k2"])
    parser.add_argument("--data_dir", type=str, default="./data")
    parser.add_argument("--out_dir", type=str, default="./results")
    parser.add_argument("--n_trials", type=int, default=50)
    parser.add_argument("--test_size", type=float, default=0.15)
    parser.add_argument("--n_splits", type=int, default=5)
    parser.add_argument("--random_state", type=int, default=42)
    parser.add_argument("--label", type=str, default=None)
    parser.add_argument("--use_gpu", action="store_true")
    args = parser.parse_args()

    set_seed(args.random_state)
    logger = get_logger("run_experiment")

    df_raw = load_dataset(args.dataset, args.data_dir)
    df = basic_clean(df_raw, args.dataset)
    y, ycol = infer_label(df, args.dataset, args.label)
    Xfe, feats_info = build_features(df, args.dataset)

    # identify groups to prevent leakage if available
    group_col = None
    for c in ["kepid","k2_name","tid","tic_id","epic_hostname","hostname"]:
        if c in df_raw.columns:
            group_col = c
            break
    groups = df_raw[group_col] if group_col else None

    # choose numeric features
    all_cols = set(Xfe.columns)
    feature_cols = select_feature_columns(Xfe)
    removed = sorted(list(all_cols - set(feature_cols)))
    if removed:
        logger.info(f"Excluded {len(removed)} potential leaky/ID columns (first 20 shown): {removed[:20]}")
    X = Xfe[feature_cols].copy()

    # drop high-missing columns (>60% missing)
    miss_rate = X.isna().mean()
    keep_cols = miss_rate[miss_rate <= 0.6].index.tolist()
    dropped = [c for c in X.columns if c not in keep_cols]
    if dropped:
        logger.info(f"Dropped {len(dropped)} high-missing columns: {dropped[:10]}...")
    X = X[keep_cols]
    # ✅ manter lista de features em sincronia após o drop
    feature_cols = list(X.columns)

    # train/holdout split
    idx_tr, idx_te = train_val_test_split(X, y, test_size=args.test_size, random_state=args.random_state, groups=groups)
    Xtr, Xte = X.iloc[idx_tr], X.iloc[idx_te]
    ytr, yte = y.iloc[idx_tr].values, y.iloc[idx_te].values
    gtr = groups.iloc[idx_tr].values if groups is not None else None

    # imputation pipeline (median)
    imputer = SimpleImputer(strategy="median")
    Xtr_np = imputer.fit_transform(Xtr)
    Xte_np = imputer.transform(Xte)

    # Reconstituir DataFrames com nomes de colunas para manter consistência
    Xtr_df = pd.DataFrame(Xtr_np, columns=feature_cols, index=Xtr.index)
    Xte_df = pd.DataFrame(Xte_np, columns=feature_cols, index=Xte.index)

    # --- salvar estudo Optuna ---
    ensure_dir("studies")
    study_path = os.path.join("studies", f"optuna_study_{args.dataset}.pkl")
    # -----------------------------

    # Optuna CV (usa numpy; sem problema)
    best_params, study = optuna_cv(
        Xtr_df.values, ytr, feature_cols, n_splits=args.n_splits,
        groups=gtr, n_trials=args.n_trials, use_gpu=args.use_gpu,
        study_name=f"{args.dataset}_study", study_path=study_path
    )

    # Fit final com DataFrame (para o LightGBM armazenar feature names)
    model = fit_final_model(Xtr_df, ytr, best_params)

    # Predict também com DataFrame para evitar warning
    p_te = model.predict_proba(Xte_df)[:, 1]
    metrics_dict = compute_all_metrics(yte, p_te)
    metrics_dict["precision_at_10pct"] = precision_at_k(yte, p_te, 0.1)
    metrics_dict["n_samples"] = int(len(yte))
    metrics_dict["pos_rate"] = float(np.mean(yte))
    metrics_df = pd.DataFrame([metrics_dict])
    ds_out_dir = os.path.join(args.out_dir, args.dataset)
    ensure_dir(ds_out_dir)
    metrics_df.to_csv(os.path.join(ds_out_dir, f"metrics_{args.dataset}_holdout.csv"), index=False)

    # Plots
    ensure_dir(os.path.join("plots", args.dataset))
    plot_roc(yte, p_te, os.path.join("plots", args.dataset, "roc_holdout.png"))
    plot_pr(yte, p_te, os.path.join("plots", args.dataset, "pr_holdout.png"))
    plot_calibration(yte, p_te, os.path.join("plots", args.dataset, "calibration_holdout.png"))
    plot_feature_importance(model, feature_cols, os.path.join("plots", args.dataset, "feature_importance.png"))
    try:
        # usar Xte_df.values no SHAP para evitar conflitos com índices/nomes
        plot_shap_summary(model, Xte_df.values, feature_cols, os.path.join("plots", args.dataset, "shap_summary.png"))
    except Exception as e:
        logger.warning(f"SHAP plot failed: {e}")

    # Save model & imputer
    import joblib
    ensure_dir("models")
    joblib.dump({"model": model, "imputer": imputer, "features": feature_cols}, os.path.join("models", f"model_{args.dataset}.joblib"))

    # Append to dataset comparison
    comp_path = os.path.join(args.out_dir, "dataset_comparison.csv")
    row = {
        "dataset": args.dataset, "roc_auc": metrics_dict["roc_auc"], "pr_auc": metrics_dict["pr_auc"],
        "f1": metrics_dict["f1"], "precision": metrics_dict["precision"], "recall": metrics_dict["recall"],
        "brier": metrics_dict["brier"], "precision_at_10pct": metrics_dict["precision_at_10pct"],
        "n_samples": metrics_dict["n_samples"], "pos_rate": metrics_dict["pos_rate"]
    }
    if os.path.exists(comp_path):
        comp_df = pd.read_csv(comp_path)
        comp_df = comp_df[comp_df["dataset"] != args.dataset]
        comp_df = pd.concat([comp_df, pd.DataFrame([row])], ignore_index=True)
    else:
        comp_df = pd.DataFrame([row])
    comp_df.sort_values(by="roc_auc", ascending=False, inplace=True)
    comp_df.to_csv(comp_path, index=False)

    logger.info(f"Done. Results saved to {ds_out_dir} and plots/{args.dataset}.")

if __name__ == "__main__":
    main()