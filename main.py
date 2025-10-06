from fastapi import FastAPI
from app.backend.api.controllers import generic_controller
from app.backend.api.controllers import star_controller
from database.database import engine, Base
from fastapi.middleware.cors import CORSMiddleware
from settings import settings

BASE_URL_FRONTEND = settings.frontend.base_url

async def lifespan(app: FastAPI):
  Base.metadata.create_all(bind=engine)
  yield

app = FastAPI(
  title="Exoplanets API",
  lifespan=lifespan,
)

# CORS
app.add_middleware(
  CORSMiddleware,
  allow_origins=[BASE_URL_FRONTEND],
  allow_methods=["*"],
  allow_headers=["*"],
  allow_credentials=False,
)

app.include_router(generic_controller.router)
app.include_router(star_controller.router)

@app.get("/")
def root():
  return {"status": "ok"}