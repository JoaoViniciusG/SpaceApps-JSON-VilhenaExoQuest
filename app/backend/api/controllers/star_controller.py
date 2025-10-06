from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from database.database import get_db
from database.schemas import PageRespose
from database.repositorys.star_repository import StarRepository
from database.repositorys.exoplanet_repository import ExoplanetRepository

router = APIRouter(prefix="/stars")

@router.get("")
def getPage(page: int, db: Session = Depends(get_db)):
  stars = StarRepository.getPerPage(db, page)
  
  for s in stars:
    s.planets = ExoplanetRepository.getByStarId(db, s.id)
  
  res = PageRespose(page=page, stars=stars)
  return res

@router.get("/search")
def getPage(page: int, mission: int = 0, search: str = "", db: Session = Depends(get_db)):
  starsIds = ExoplanetRepository.getStarIdByLike(db, mission, search, page)
  print("IDS: ", starsIds)
  stars = StarRepository.getByIds(db, starsIds)
  
  for s in stars:
    s.planets = ExoplanetRepository.getByStarId(db, s.id)
  
  res = PageRespose(page=page, stars=stars)
  return res