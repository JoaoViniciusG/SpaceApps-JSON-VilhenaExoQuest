import os
import json
from pydantic import BaseModel, Field

class AppConfig(BaseModel):
  name: str
  version: str

class APIConfig(BaseModel):
  base_url: str
  port: int = 8000
  folder: str

class FrontendConfig(BaseModel):
  base_url: str
  folder: str

class DatabaseConfig(BaseModel):
  folder: str
  filename: str
  models_folder: str

  @property
  def path(self) -> str:
    return os.path.join("sqlite:///", self.folder, self.filename)

  @property
  def url(self) -> str:
    return f"sqlite:///{self.path}"
  
class DataConfig(BaseModel):
  models_folder: str
  models_koi_name: str
  models_toi_name: str
  raw_folder: str
  raw_koi: str
  raw_toi: str
  
  @property
  def path_model_koi(self) -> str:
    return os.path.join(self.models_folder, self.models_koi_name)
  
  @property
  def path_model_toi(self) -> str:
    return os.path.join(self.models_folder, self.models_toi_name)

  @property
  def path_raw_koi(self) -> str:
    return os.path.join(self.raw_folder, self.raw_koi)
  
  @property
  def path_raw_toi(self) -> str:
    return os.path.join(self.raw_folder, self.raw_toi)

# ============================================================
# CONFIGURAÇÃO PRINCIPAL
# ============================================================

class Settings(BaseModel):
  app: AppConfig
  api: APIConfig
  frontend: FrontendConfig
  database: DatabaseConfig
  data: DataConfig
  
  @classmethod
  def load(cls, file_path: str = "config.json") -> "Settings":
    if not os.path.exists(file_path):
      raise FileNotFoundError(f"Config file not found: {file_path}")
    with open(file_path, "r", encoding="utf-8") as f:
      data = json.load(f)
    return cls(**data)

settings = Settings.load()