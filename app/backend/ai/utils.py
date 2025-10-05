from __future__ import annotations
import json
import logging
import os
import random
from pathlib import Path
from typing import Any, Dict

import numpy as np
import joblib

SEED_DEFAULT = 42

def set_seed(seed: int = SEED_DEFAULT) -> None:
    random.seed(seed)
    np.random.seed(seed)
    # tentar PyTorch apenas se disponível
    try:
        import torch  # type: ignore
        torch.manual_seed(seed)
        if torch.cuda.is_available():
            torch.cuda.manual_seed_all(seed)
    except Exception:
        # torch não instalado ou indisponível -> ok
        pass

def get_logger(name: str, log_dir: str = "logs", level: int = logging.INFO) -> logging.Logger:
    Path(log_dir).mkdir(parents=True, exist_ok=True)
    logger = logging.getLogger(name)
    logger.setLevel(level)
    logger.propagate = False
    if not logger.handlers:
        ch = logging.StreamHandler()
        ch.setLevel(level)
        fmt = logging.Formatter("[%(asctime)s] [%(levelname)s] %(name)s: %(message)s")
        ch.setFormatter(fmt)
        logger.addHandler(ch)

        fh = logging.FileHandler(os.path.join(log_dir, f"{name}.log"))
        fh.setLevel(level)
        fh.setFormatter(fmt)
        logger.addHandler(fh)
    return logger

def save_json(obj: Dict[str, Any], path: str) -> None:
    Path(os.path.dirname(path)).mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(obj, f, indent=2, ensure_ascii=False)

def load_json(path: str) -> Dict[str, Any]:
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def save_model(model: Any, path: str) -> None:
    Path(os.path.dirname(path)).mkdir(parents=True, exist_ok=True)
    joblib.dump(model, path)

def load_model(path: str) -> Any:
    return joblib.load(path)

def ensure_dir(path: str) -> None:
    Path(path).mkdir(parents=True, exist_ok=True)