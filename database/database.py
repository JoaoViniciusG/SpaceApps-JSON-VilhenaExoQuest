from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from settings import settings

SQLITE_URL = settings.database.path

engine = create_engine(
  SQLITE_URL,
  connect_args={ "check_same_thread": False }
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
  db = SessionLocal()
  try:
    yield db
  finally:
    db.close()
    
def init_db():
  import database.models.star
  import database.models.exoplanet
  Base.metadata.create_all(bind=engine)