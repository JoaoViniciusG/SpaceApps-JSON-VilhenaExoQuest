from typing import List, Optional
from database.schemas import StarsPaginedResponse
from sqlalchemy.orm import Session
from database.models.star import Stars

class StarRepository:      

  @staticmethod
  def getPerPage(db: Session, page: int, pageSize: int = 10) -> List[StarsPaginedResponse]:
    data = db.query(Stars).offset((page - 1) * pageSize).limit(pageSize).all()
    return [StarsPaginedResponse(
      id=s.id, 
      mass_solar=s.mass_solar, 
      radius_solar=s.radius_solar, 
      effective_tempk=s.effective_tempk, 
      metallicity_feh=s.metallicity_feh, 
      age_gyr=s.age_gyr) for s in data]  
    
  @staticmethod
  def getByIds(db: Session, ids: List[str]) -> List[StarsPaginedResponse]:
    data = db.query(Stars).filter(Stars.id.in_(ids)).all()
    return [StarsPaginedResponse(
      id=s.id, 
      mass_solar=s.mass_solar, 
      radius_solar=s.radius_solar, 
      effective_tempk=s.effective_tempk, 
      metallicity_feh=s.metallicity_feh, 
      age_gyr=s.age_gyr) for s in data]  
    
  @staticmethod
  def getAllStars(db: Session) -> Stars:
    return db.query(Stars).count()