from typing import List, Optional
from database.schemas import ExoplanetByStellarResponse
from sqlalchemy.orm import Session
from sqlalchemy import or_
from database.models.exoplanet import Exoplanet

class ExoplanetRepository:      

  @staticmethod
  def getByStarId(db: Session, star_id: int) -> List[ExoplanetByStellarResponse]:
    data = (db.query(Exoplanet).filter(Exoplanet.star_id == star_id).all())
    return [ExoplanetByStellarResponse(
      id=e.id, 
      name=e.name, 
      probability=e.probability, 
      koi_score=e.koi_score,
      radius_earth=e.radius_earth, 
      equilibrium_tempk=e.equilibrium_tempk,
      orbital_period_days=e.orbital_period_days,
      semi_major_axis=e.semi_major_axis, 
      eccentricity=e.eccentricity, 
      inclination_deg=e.inclination_deg) for e in data]

  @staticmethod
  def getStarIdByLike(db: Session, mission: int, search: str, page: int, pageSize: int = 10) -> List[str]:
    if mission == 0:
      mission_value = True
    elif mission == 1:
      mission_value = Exoplanet.id.like("K%")
    elif mission == 2:
      mission_value = Exoplanet.id.like("T%")
          
    data = db.query(Exoplanet.star_id).filter(or_(
      Exoplanet.name.like(f"%{search}%"),
      Exoplanet.id.like(f"%{search}%"),
      Exoplanet.star_id.like(f"%{search}%"),
      )
    ).filter(mission_value).offset((page - 1) * pageSize).limit(pageSize)
    
    return data
  
  @staticmethod
  def getAllExoplanets(db: Session) -> Exoplanet:
    return db.query(Exoplanet).count()