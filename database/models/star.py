from sqlalchemy import Column, Integer, String, Float
from database.database import Base


class Stars(Base):
    __tablename__ = "stars"

    id = Column(String, primary_key=True, unique=True)
    effective_tempk = Column(Float)
    mass_solar = Column(Float)
    radius_solar = Column(Float)
    metallicity_feh = Column(Float)
    age_gyr = Column(Float)
