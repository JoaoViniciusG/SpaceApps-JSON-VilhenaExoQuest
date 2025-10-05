
from __future__ import annotations
from typing import Dict, List, Tuple, Optional
import os
import re
import pandas as pd
import numpy as np
from pathlib import Path

from sklearn.model_selection import train_test_split
from app.backend.ai.utils import get_logger

ID_CANDIDATES = [
    "kepid","koi_kepid","kepoi_name","kepler_name","tid","tic_id","epic_hostname","epic_candname",
    "k2_name","pl_name","hostname","toi","toipfx","ctoi_alias"
]

def load_dataset(dataset: str, data_dir: str) -> pd.DataFrame:
    logger = get_logger("data_utils")
    file_map = {
        "kepler": "kepler_candidates.csv",
        "toi": "toi_candidates.csv",
        "k2": "k2_pandc.csv",
    }
    fname = file_map.get(dataset.lower())
    if fname is None:
        raise ValueError(f"Unknown dataset {dataset}")
    path = os.path.join(data_dir, fname)
    if not os.path.exists(path):
        raise FileNotFoundError(f"Expected file at {path}")
    df = pd.read_csv(path)
    logger.info(f"Loaded {dataset} with shape {df.shape} from {path}")
    return df

def infer_label(df: pd.DataFrame, dataset: str, override_label: Optional[str]=None) -> Tuple[pd.Series, str]:
    """
    Binary target: 1 = planet (CONFIRMED or CANDIDATE), 0 = non-planet (FALSE POSITIVE / NOT DISPOSITIONED)
    Rules based on NASA Exoplanet Archive column conventions.
    """
    logger = get_logger("data_utils")

    if override_label and override_label in df.columns:
        y = df[override_label]
        # attempt to coerce to binary with sensible mapping
        if y.dtype == object:
            mapping = {
                "CONFIRMED":1,"CANDIDATE":1,"PC":1,"CP":1,"KP":1,
                "FALSE POSITIVE":0,"FP":0,"NOT DISPOSITIONED":0,"NOT_DISPOSITIONED":0,"KOI":0,"UNKNOWN":0
            }
            y = y.str.upper().map(mapping).fillna(y)
        y = pd.to_numeric(y, errors="coerce")
        y = y.fillna(0).astype(int)
        return y, override_label

    col_candidates = [
        "koi_disposition","koi_pdisposition","koi_score",
        "tfopwg_disp","disposition","toi_disposition","k2_disposition"
    ]
    found = [c for c in col_candidates if c in df.columns]
    if not found:
        raise ValueError("Could not infer label column. Please pass --label with a valid column.")
    col = found[0]
    logger.info(f"Using label column: {col}")
    series = df[col]

    if series.dtype == object:
        series_u = series.astype(str).str.upper().str.strip()
        pos = series_u.isin(["CONFIRMED","CANDIDATE","PC","CP","KP"])
        neg = series_u.isin(["FALSE POSITIVE","FP","NOT DISPOSITIONED","NOT_DISPOSITIONED","UNKNOWN"])
        y = pd.Series(np.where(pos,1, np.where(neg,0, np.nan)), index=series.index)
        # fall back to koi_score threshold if many NaNs
        if y.isna().mean() > 0.5 and "koi_score" in df.columns:
            score = pd.to_numeric(df["koi_score"], errors="coerce")
            y = (score >= 0.5).astype(int)
    else:
        y = pd.to_numeric(series, errors="coerce")
        y = (y >= 0.5).astype(int)
    y = y.fillna(0).astype(int)
    return y, col

def basic_clean(df: pd.DataFrame, dataset: str) -> pd.DataFrame:
    # drop obvious non-feature columns
    drop_cols = []
    for c in df.columns:
        if any(k in c.lower() for k in ["url","link","dvr","dvs","comment","prov","provenance","reference"]):
            drop_cols.append(c)
    df = df.drop(columns=drop_cols, errors="ignore")

    # keep an object id if exists
    objid = None
    for c in ID_CANDIDATES:
        if c in df.columns:
            objid = c
            break
    if objid:
        df = df.rename(columns={objid:"object_id"})

    return df

def train_val_test_split(X: pd.DataFrame, y: pd.Series, test_size: float, random_state: int, groups: Optional[pd.Series]=None):
    # stratified split; if groups available use GroupShuffleSplit for test
    from sklearn.model_selection import GroupShuffleSplit, StratifiedShuffleSplit
    if groups is not None:
        gss = GroupShuffleSplit(n_splits=1, test_size=test_size, random_state=random_state)
        idx_train, idx_test = next(gss.split(X, y, groups))
        return idx_train, idx_test
    else:
        sss = StratifiedShuffleSplit(n_splits=1, test_size=test_size, random_state=random_state)
        idx_train, idx_test = next(sss.split(X, y))
        return idx_train, idx_test
