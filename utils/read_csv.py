import pandas as pd
from sqlalchemy.orm import Session
from database.database import engine
from database.models.exoplanet import Exoplanet
from database.models.star import Stars
from random import random

def csv_to_sqlite() :
  df = pd.read_csv("data/output/teste.csv")

  # Eliminar duplicatas de estrelas
  stars_df = df.drop_duplicates(subset=["kepid"])

  with Session(engine) as session:
      # Inserir estrelas
      for _, row in stars_df.iterrows():
          star = Stars(
              id=str(row["kepoi_name"]).split(".")[0],
              effective_tempk=row.get("koi_steff"),
              mass_solar=row.get("koi_smass"),
              radius_solar=row.get("koi_srad"),
              metallicity_feh=row.get("koi_smet"),
              age_gyr=row.get("koi_sage")
          )
          session.merge(star)  # merge evita duplicar se já existir

      # Inserir exoplanetas
      for _, row in df.iterrows():
          planet = Exoplanet(
              id=str(row["kepoi_name"]),
              star_id=str(row["kepoi_name"]).split(".")[0],
              name=row.get("kepler_name"),
              probability=row.get("probability"),
              radius_earth=row.get("koi_prad"),
              equilibrium_tempk=row.get("koi_teq"),
              orbital_period_days=row.get("koi_period"),
              semi_major_axis=row.get("koi_sma"),
              eccentricity=row.get("koi_eccen"),
              inclination_deg=row.get("koi_incl")
          )
          session.merge(planet)

      session.commit()

  print("✅ Importação concluída com sucesso!")
  
if __name__ == "__main__":
    csv_to_sqlite()