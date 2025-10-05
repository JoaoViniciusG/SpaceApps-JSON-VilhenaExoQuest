import subprocess
import time
import os
from settings import settings

# Caminhos relativos ao projeto
API_DIR = settings.api.folder
FRONTEND_DIR = settings.frontend.folder
BASE_URL_API = settings.api.base_url
API_PORT = settings.api.port
BASE_URL_FRONTEND = settings.frontend.base_url
print(API_DIR)
def run_api():
    print("🚀 Starting API (FastAPI + Uvicorn)...")
    subprocess.Popen(
        ["uvicorn", "main:app", "--reload", "--host", BASE_URL_API, "--port", str(API_PORT)],
        cwd="./"
    )

def run_frontend():
  print("🌐 Starting Frontend (Next.js)...")
  subprocess.Popen(
      ["npm", "run", "dev"],
      cwd=FRONTEND_DIR
  )

if __name__ == "__main__":
  print("🔥 Starting SpaceApps (API + Front)...\n")
  run_api()
  time.sleep(3)
  # run_frontend()

  print(f"\n✅ API running in: {BASE_URL_API}")
  print(f"✅ Frontend running in: {BASE_URL_FRONTEND}")

  # Mantém o script ativo
  try:
    while True:
        time.sleep(1)
  except KeyboardInterrupt:
    print("\n🛑 Closing applications...")
