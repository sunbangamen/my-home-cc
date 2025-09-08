from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.exc import SQLAlchemyError
from typing import List
import os, uuid, shutil
from models import Base, Photo, Event
from schemas import PhotoResponse, EventCreate, EventResponse, EventUpdate

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://home:homepw@db:5432/homepg")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# FastAPI app configuration
app = FastAPI(
    title=os.getenv("APP_NAME", "우리집 홈페이지 API"),
    description="가족용 사진/일정 공유 홈페이지 API",
    version="0.1.0"
)

# CORS configuration
origins = [o.strip() for o in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Photo directory setup
PHOTOS_DIR = os.getenv("PHOTOS_DIR", "/data/photos")
ALLOWED = set(os.getenv("ALLOWED_EXTS","jpg,jpeg,png,webp").split(","))
MAX_MB = int(os.getenv("MAX_UPLOAD_MB","10"))
os.makedirs(PHOTOS_DIR, exist_ok=True)

@app.get("/api/health")
def health_check(db: Session = Depends(get_db)):
    """Health check endpoint with database connectivity test."""
    try:
        # Test database connection
        db.execute(text("SELECT 1"))
        db_status = "connected"
    except SQLAlchemyError as e:
        db_status = f"error: {str(e)}"
    except Exception as e:
        db_status = f"unknown_error: {str(e)}"
    
    return {
        "status": "ok",
        "database": db_status,
        "service": "우리집 홈페이지 API",
        "version": "0.1.0"
    }

# Photos API endpoints
@app.get("/api/photos", response_model=List[PhotoResponse])
def list_photos(db: Session = Depends(get_db)):
    """Get all uploaded photos."""
    return db.query(Photo).order_by(Photo.uploaded_at.desc()).all()


@app.post("/api/photos/upload", response_model=PhotoResponse)
async def upload_photo(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Upload a new photo."""
    ext = (file.filename.rsplit(".",1)[-1] or "").lower()
    if ext not in ALLOWED:
        raise HTTPException(status_code=400, detail="Invalid file type")
    
    size, tmp_path = 0, os.path.join(PHOTOS_DIR, f"tmp_{uuid.uuid4().hex}")
    try:
        with open(tmp_path, "wb") as out:
            while chunk := await file.read(1024*1024):
                size += len(chunk)
                if size > MAX_MB*1024*1024:
                    raise HTTPException(status_code=400, detail="File too large")
                out.write(chunk)
        
        # Generate final filename and move file
        filename = f"{uuid.uuid4().hex}.{ext}"
        final_path = os.path.join(PHOTOS_DIR, filename)
        shutil.move(tmp_path, final_path)
        
        # Save to database
        photo = Photo(
            filename=filename,
            original_name=file.filename or "unknown",
            file_path=final_path,
            file_size=size,
            mime_type=file.content_type
        )
        db.add(photo)
        db.commit()
        db.refresh(photo)
        
        return photo
        
    except Exception as e:
        # Clean up temporary file if it exists
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


# Events API endpoints
@app.get("/api/events", response_model=List[EventResponse])
def list_events(db: Session = Depends(get_db)):
    """Get all events."""
    return db.query(Event).order_by(Event.event_date.asc()).all()


@app.post("/api/events", response_model=EventResponse)
def create_event(event_data: EventCreate, db: Session = Depends(get_db)):
    """Create a new event."""
    event = Event(**event_data.model_dump())
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


@app.get("/api/events/{event_id}", response_model=EventResponse)
def get_event(event_id: int, db: Session = Depends(get_db)):
    """Get a specific event by ID."""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event


@app.put("/api/events/{event_id}", response_model=EventResponse)
def update_event(event_id: int, event_data: EventUpdate, db: Session = Depends(get_db)):
    """Update an existing event."""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    update_data = event_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(event, field, value)
    
    db.commit()
    db.refresh(event)
    return event


@app.delete("/api/events/{event_id}")
def delete_event(event_id: int, db: Session = Depends(get_db)):
    """Delete an event."""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    db.delete(event)
    db.commit()
    return {"ok": True, "message": "Event deleted successfully"}
