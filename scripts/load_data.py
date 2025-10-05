import argparse, os, sys
import numpy as np
import pandas as pd
import joblib
from sqlalchemy.orm import Session
from database.database import engine
from database.models.exoplanet import Exoplanet
from database.models.star import Stars
from app.backend.ai.data_utils import basic_clean
from app.backend.ai.feature_engineering import build_features
from settings import settings
from database.database import init_db

def main():
  ap = argparse.ArgumentParser()
  ap.add_argument("--mission", required=True, help="Mission name (koi or toi)")
  args = ap.parse_args()

  if args.mission == "koi":
    data_path = settings.data.path_raw_koi
    model_path = settings.data.path_model_koi
    id_column = "kepid"
  else:
    data_path = settings.data.path_raw_toi
    model_path = settings.data.path_model_toi
    id_column = "toi"

  bundle = joblib.load(model_path)
  model = bundle["model"]
  imputer = bundle["imputer"]
  feat_names = bundle["features"]

  df_raw = pd.read_csv(data_path)
  df = basic_clean(df_raw, dataset=args.mission)
  Xfe, _ = build_features(df, dataset=args.mission)

  # garantir TODAS as features esperadas (as ausentes viram NaN)
  for c in feat_names:
    if c not in Xfe.columns:
        Xfe[c] = np.nan
  Xfe = Xfe[feat_names]  # mesma ordem

  # imputar + predição
  X_np = imputer.transform(Xfe)
  probs = model.predict_proba(X_np)[:, 1]
    
  #Salvando os dados no banco de dados
  df_raw['probability'] = probs
  stars_df = df_raw.drop_duplicates(subset=[id_column])

  init_db()
  
  if args.mission == "koi":
    with Session(engine) as session:
      for _, row in stars_df.iterrows():
        star = Stars(
          id=str(row["kepoi_name"]).split(".")[0],
          effective_tempk=row.get("koi_steff"),
          mass_solar=row.get("koi_smass"),
          radius_solar=row.get("koi_srad"),
          metallicity_feh=row.get("koi_smet"),
          age_gyr=row.get("koi_sage")
        )
        session.merge(star)

      for _, row in df_raw.iterrows():
        planet = Exoplanet(
          id=str(row["toipfx"]),
          star_id=str(row["kepoi_name"]).split(".")[0],
          name=row.get("kepler_name"),
          probability=row.get("probability"),
          koi_score=row.get("koi_score"),
          radius_earth=row.get("koi_prad"),
          equilibrium_tempk=row.get("koi_teq"),
          orbital_period_days=row.get("koi_period"),
          semi_major_axis=row.get("koi_sma"),
          eccentricity=row.get("koi_eccen"),
          inclination_deg=row.get("koi_incl")
        )
        session.merge(planet)

      session.commit()
  else:
    with Session(engine) as session:
      for _, row in stars_df.iterrows():
        star = Stars(
          id=row["toipfx"],
          effective_tempk=row.get("koi_steff"),
          mass_solar=row.get("koi_smass"),
          radius_solar=row.get("koi_srad"),
          metallicity_feh=row.get("koi_smet"),
          age_gyr=row.get("koi_sage")
        )
        session.merge(star)

      for _, row in df_raw.iterrows():
        planet = Exoplanet(
          id=row["toi"],
          star_id=row["toipfx"],
          name=row.get("kepler_name"),
          probability=row.get("probability"),
          koi_score=None,
          radius_earth=row.get("koi_prad"),
          equilibrium_tempk=row.get("koi_teq"),
          orbital_period_days=row.get("koi_period"),
          semi_major_axis=row.get("koi_sma"),
          eccentricity=row.get("koi_eccen"),
          inclination_deg=row.get("koi_incl")
        )
        session.merge(planet)

      session.commit()
    

if __name__ == "__main__":
  main()