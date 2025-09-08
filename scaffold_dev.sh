#!/usr/bin/env bash
set -e

echo "==> 🚧 Scaffolding dev environment..."

# ---------- Helpers ----------
exists() { command -v "$1" >/dev/null 2>&1; }
write_if_absent() { local f="$1"; shift; if [ -f "$f" ]; then echo "    ↳ skip (exists): $f"; else printf "%s\n" "$@" > "$f"; echo "    ↳ create: $f"; fi; }

# ---------- Dirs ----------
mkdir -p backend docs .claude/commands .github/workflows

# ---------- .gitignore ----------
write_if_absent ".gitignore" "node_modules\ndist\n.env\n.env.*\n__pycache__\n*.pyc\ndb_data\nfrontend/.env\nbackend/.env.dev"

# ---------- docker-compose.dev.yml ----------
write_if_absent "docker-compose.dev.yml" "$(cat <<'YML'
version: "3.9"
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_USER: home
      POSTGRES_PASSWORD: homepw
      POSTGRES_DB: homepg
    ports: ["5432:5432"]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U home -d homepg"]
      interval: 3s
      timeout: 3s
      retries: 15
    restart: unless-stopped
    volumes:
      - db_data:/var/lib/postgresql/data

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    env_file:
      - ./backend/.env.dev
    volumes:
      - ./backend:/app
      - photos_data:/data/photos
    ports: ["8000:8000"]
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped

volumes:
  db_data:
  photos_data:
YML
)"

# ---------- Makefile ----------
write_if_absent "Makefile" "$(cat <<'MK'
.PHONY: up down logs ps rebuild

up:
\tdocker compose -f docker-compose.dev.yml up --build -d

down:
\tdocker compose -f docker-compose.dev.yml down

logs:
\tdocker compose -f docker-compose.dev.yml logs -f

ps:
\tdocker compose -f docker-compose.dev.yml ps

rebuild:
\tdocker compose -f docker-compose.dev.yml build --no-cache
MK
)"

# ---------- Backend ----------
write_if_absent "backend/Dockerfile.dev" "$(cat <<'DOCKER'
FROM python:3.11-slim
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends build-essential libpq-dev curl && rm -rf /var/lib/apt/lists/*
COPY requirements.dev.txt /app/requirements.dev.txt
RUN pip install --no-cache-dir -r requirements.dev.txt
EXPOSE 8000
CMD ["uvicorn","main:app","--host","0.0.0.0","--port","8000","--reload"]
DOCKER
)"

write_if_absent "backend/requirements.dev.txt" "fastapi==0.115.0\nuvicorn[standard]==0.30.6\npython-multipart==0.0.9\npydantic==2.8.2\nSQLAlchemy==2.0.34\npsycopg2-binary==2.9.9\nalembic==1.13.2"

write_if_absent "backend/.env.dev" "ENV=dev\nAPI_TITLE=HomePage API (dev)\nDATABASE_URL=postgresql+psycopg2://home:homepw@db:5432/homepg\nPHOTOS_DIR=/data/photos\nMAX_UPLOAD_MB=10\nALLOWED_EXTS=jpg,jpeg,png,webp\nCORS_ORIGINS=http://localhost:5173"

write_if_absent "backend/main.py" "$(cat <<'PY'
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os, uuid, shutil

app = FastAPI(title=os.getenv("API_TITLE", "HomePage API"))
origins = [o.strip() for o in os.getenv("CORS_ORIGINS","http://localhost:5173").split(",")]
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

PHOTOS_DIR = os.getenv("PHOTOS_DIR", "/data/photos")
ALLOWED = set(os.getenv("ALLOWED_EXTS","jpg,jpeg,png,webp").split(","))
MAX_MB = int(os.getenv("MAX_UPLOAD_MB","10"))
os.makedirs(PHOTOS_DIR, exist_ok=True)

class Event(BaseModel):
    title: str
    date: str
    description: str | None = None

@app.get("/api/health")
def health():
    return {"status":"ok"}

@app.post("/api/photos/upload")
async def upload_photo(file: UploadFile = File(...)):
    ext = (file.filename.rsplit(".",1)[-1] or "").lower()
    if ext not in ALLOWED:
        raise HTTPException(status_code=400, detail="Invalid file type")
    size, tmp_path = 0, os.path.join(PHOTOS_DIR, f"tmp_{uuid.uuid4().hex}")
    with open(tmp_path, "wb") as out:
        while chunk := await file.read(1024*1024):
            size += len(chunk)
            if size > MAX_MB*1024*1024:
                out.close(); os.remove(tmp_path)
                raise HTTPException(status_code=400, detail="File too large")
            out.write(chunk)
    final = os.path.join(PHOTOS_DIR, f"{uuid.uuid4().hex}.{ext}")
    shutil.move(tmp_path, final)
    return {"ok": True, "filename": os.path.basename(final)}

EVENTS: list[Event] = []
@app.get("/api/events")
def list_events(): return EVENTS
@app.post("/api/events")
def create_event(ev: Event): EVENTS.append(ev); return {"ok": True}
PY
)"

# ---------- Frontend ----------
if exists node && exists npm; then
  if [ ! -d "frontend" ]; then
    echo "==> Creating frontend (Vite React+TS)"
    npm create vite@latest frontend -- --template react-ts <<< '' >/dev/null 2>&1 || true
    (cd frontend && npm i)
    echo "VITE_API_BASE=http://localhost:8000" > frontend/.env
  fi
else
  echo "!! Node.js not found, skipping frontend scaffold"
fi

# ---------- Final run ----------
echo "==> 🚀 Starting backend+db with Docker..."
make up
echo "==> 🚀 Starting frontend (npm run dev)..."
(cd frontend && npm run dev)
