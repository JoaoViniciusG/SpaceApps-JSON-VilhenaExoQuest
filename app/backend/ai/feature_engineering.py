
from __future__ import annotations
from typing import Tuple, Dict, List, Optional
import numpy as np
import pandas as pd

from app.backend.ai.utils import get_logger

logger = get_logger("feature_engineering")

# Helper conversions
def ppm_to_fraction(ppm: pd.Series) -> pd.Series:
    return pd.to_numeric(ppm, errors="coerce") / 1e6

def build_features(df: pd.DataFrame, dataset: str) -> Tuple[pd.DataFrame, Dict[str, str]]:
    """
    Create derived astrophysical features that are commonly predictive for transit validation.
    References in README cite: Shallue & Vanderburg 2018; Osborn et al. 2022; Heller et al. 2019; Morton 2012/2014 (VESPA).
    """
    feats_info: Dict[str,str] = {}

    X = df.copy()

    # Standard rename for shared columns
    rename_map = {
        # Period
        "koi_period":"period",
        "pl_orbper":"period",
        # Depth
        "koi_depth":"depth_ppm",
        "pl_trandep":"depth_ppm",   # TOI uses ppm
        # Duration
        "koi_duration":"duration_hours",
        "pl_trandurh":"duration_hours",
        "pl_trandur":"duration_hours",
        # Radius ratio
        "koi_ror":"rprstar",
        "pl_ratror":"rprstar",
        # a/R*
        "koi_dor":"a_over_rstar",
        "pl_ratdor":"a_over_rstar",
        # SNR / MES
        "koi_model_snr":"snr",
        "koi_max_mult_ev":"mes_multi",
        "koi_max_sngle_ev":"mes_single",
        # Stellar params
        "koi_steff":"st_teff",
        "st_teff":"st_teff",
        "koi_slogg":"st_logg",
        "st_logg":"st_logg",
        "koi_smet":"st_met",
        "st_met":"st_met",
        "koi_srad":"st_rad",
        "st_rad":"st_rad",
        "sy_kepmag":"kepmag",
        "koi_kepmag":"kepmag",
        "st_tmag":"tmag",
        "sy_tmag":"tmag",
    }
    for k,v in rename_map.items():
        if k in X.columns and v not in X.columns:
            X = X.rename(columns={k:v})

    # Derived: fractional depth
    if "depth_ppm" in X.columns and "depth_frac" not in X.columns:
        X["depth_frac"] = ppm_to_fraction(X["depth_ppm"])
        feats_info["depth_frac"] = "Transit depth (fractional); depth_ppm / 1e6."

    # SNR-related
    if "snr" in X.columns and "duration_hours" in X.columns:
        X["snr_per_hour"] = pd.to_numeric(X["snr"], errors="coerce") / (pd.to_numeric(X["duration_hours"], errors="coerce").replace(0, np.nan))
        feats_info["snr_per_hour"] = "Transit model SNR normalized by duration."

    # Interaction features motivated by literature
    for a,b,new in [
        ("period","depth_frac","period_times_depth"),
        ("period","duration_hours","period_over_dur"),
        ("depth_frac","duration_hours","depth_over_dur"),
    ]:
        if a in X.columns and b in X.columns:
            a_s = pd.to_numeric(X[a], errors="coerce")
            b_s = pd.to_numeric(X[b], errors="coerce")
            if "over" in new:
                X[new] = a_s / (b_s.replace(0, np.nan))
            else:
                X[new] = a_s * b_s
            feats_info[new] = f"Interaction: {new} from {a} and {b}."

    # Magnitude-color proxies (useful for crowding/contamination risk)
    if "kepmag" in X.columns and "tmag" in X.columns:
        X["kepmag_minus_tmag"] = pd.to_numeric(X["kepmag"], errors="coerce") - pd.to_numeric(X["tmag"], errors="coerce")
        feats_info["kepmag_minus_tmag"] = "Kepler - TESS magnitude difference."

    # Ensure numeric casting for model
    non_numeric = [c for c in X.columns if X[c].dtype == object]
    for c in non_numeric:
        # leave disposition-like columns to be removed later; keep id
        pass

    return X, feats_info

def select_feature_columns(df: pd.DataFrame) -> List[str]:
    import re
    # Padrões de colunas que geram vazamento ou não agregam como feature
    LEAKY_RE = re.compile(
        r"(disposition|pdisposition|fpflag|score|robovet|tfopwg|vet(?!.*err))",
        flags=re.IGNORECASE
    )
    ID_RE = re.compile(
        r"(rowid|object_id|kepoi|koi_name|kepler_name|kepid|tic_id|tid|epic|hostname|toi)",
        flags=re.IGNORECASE
    )

    cols: List[str] = []
    for c in df.columns:
        name = c.lower()
        # remover IDs e colunas claramente correlatas ao rótulo
        if LEAKY_RE.search(name) or ID_RE.search(name):
            continue
        # já removemos 'disposition/label/object_id' no clean, mas mantemos a proteção
        if any(tok in name for tok in ["disposition", "label", "object_id"]):
            continue
        # somente numéricas e não totalmente nulas
        if pd.api.types.is_numeric_dtype(df[c]) and df[c].notna().sum() > 0:
            cols.append(c)
    return cols
