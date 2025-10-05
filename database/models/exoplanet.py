from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, func, Float
from database.database import Base

class Exoplanet(Base):
  __tablename__ = "exoplanets"

  id = Column(String, primary_key=True, unique=True)
  star_id = Column(Integer, ForeignKey("stars.id"), nullable=False)
  koi_score = Column(Float, nullable=True)
  name = Column(String, nullable=True)
  probability = Column(Float, nullable=True)
  radius_earth = Column(Float, nullable=True)
  equilibrium_tempk = Column(Float, nullable=True)
  orbital_period_days = Column(Float, nullable=True)
  semi_major_axis = Column(Float, nullable=True)
  eccentricity = Column(Float, nullable=True)
  inclination_deg = Column(Float, nullable=True)