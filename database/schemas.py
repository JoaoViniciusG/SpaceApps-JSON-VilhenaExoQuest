from pydantic import BaseModel
from typing import List, Optional

# Exoplanets Models
class ExoplanetByStellarResponse(BaseModel):
  id: str
  name: Optional[str] = None
  probability: Optional[float] = None
  radius_earth: Optional[float] = None
  equilibrium_tempk: Optional[float] = None
  orbital_period_days: Optional[float] = None
  semi_major_axis: Optional[float] = None
  eccentricity: Optional[float] = None
  inclination_deg: Optional[float] = None

  class Config:
    orm_mode = True

# Stars Models
class StarsPaginedResponse(BaseModel):
  id: str
  mass_solar: Optional[float] = None
  radius_solar: Optional[float] = None
  effective_tempk: Optional[float] = None
  metallicity_feh: Optional[float] = None
  age_gyr: Optional[float] = None
  planets: Optional[List[ExoplanetByStellarResponse]] = None
  
  class Config:
    orm_mode = True
    
class PageRespose(BaseModel):
  page: int
  stars: List[StarsPaginedResponse]


class GetInfosResponse(BaseModel):
  amountStars: int
  amountExoplanets: int