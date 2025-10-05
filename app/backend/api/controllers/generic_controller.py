from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from database.database import get_db
from database.repositorys.exoplanet_repository import ExoplanetRepository
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from database.database import get_db
from database.repositorys.exoplanet_repository import ExoplanetRepository
from database.repositorys.star_repository import StarRepository
from database.schemas import GetInfosResponse


router = APIRouter()

@router.get("/getInfos")
def register(db: Session = Depends(get_db)):
    planets = ExoplanetRepository.getAllExoplanets(db)
    stars = StarRepository.getAllStars(db)

    dto = GetInfosResponse(amountStars=stars, amountExoplanets=planets)

    if not dto:
        raise HTTPException(status_code=500, detail="Error")
    return dto

