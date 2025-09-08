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
