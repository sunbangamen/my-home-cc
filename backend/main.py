from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.exc import SQLAlchemyError
from typing import List
import os, uuid, shutil
from models import Base, Photo, Event, Album
from schemas import (
    PhotoResponse, EventCreate, EventResponse, EventUpdate,
    AlbumCreate, AlbumResponse, AlbumUpdate, AlbumWithPhotos, 
    PhotoAlbumAssociation
)

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

# Static file serving for photos
app.mount("/data/photos", StaticFiles(directory=PHOTOS_DIR), name="photos")

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


# Album API endpoints
@app.get("/api/albums", response_model=List[AlbumResponse])
def list_albums(db: Session = Depends(get_db)):
    """Get all albums with photo count."""
    albums = db.query(Album).order_by(Album.created_at.desc()).all()
    
    # Add photo count to each album
    result = []
    for album in albums:
        album_dict = {
            "id": album.id,
            "name": album.name,
            "description": album.description,
            "cover_photo_id": album.cover_photo_id,
            "created_at": album.created_at,
            "updated_at": album.updated_at,
            "photo_count": len(album.photos)
        }
        result.append(album_dict)
    
    return result


@app.post("/api/albums", response_model=AlbumResponse)
def create_album(album_data: AlbumCreate, db: Session = Depends(get_db)):
    """Create a new album."""
    # Validate album name
    if not album_data.name or not album_data.name.strip():
        raise HTTPException(status_code=400, detail="Album name is required")
    
    # Check for duplicate album names
    existing_album = db.query(Album).filter(Album.name == album_data.name.strip()).first()
    if existing_album:
        raise HTTPException(status_code=400, detail="Album with this name already exists")
    
    album = Album(**album_data.model_dump())
    db.add(album)
    db.commit()
    db.refresh(album)
    
    return {
        "id": album.id,
        "name": album.name,
        "description": album.description,
        "cover_photo_id": album.cover_photo_id,
        "created_at": album.created_at,
        "updated_at": album.updated_at,
        "photo_count": 0
    }


@app.get("/api/albums/{album_id}", response_model=AlbumWithPhotos)
def get_album(album_id: int, db: Session = Depends(get_db)):
    """Get a specific album with its photos."""
    album = db.query(Album).filter(Album.id == album_id).first()
    if not album:
        raise HTTPException(status_code=404, detail="Album not found")
    
    return album


@app.put("/api/albums/{album_id}", response_model=AlbumResponse)
def update_album(album_id: int, album_data: AlbumUpdate, db: Session = Depends(get_db)):
    """Update an existing album."""
    album = db.query(Album).filter(Album.id == album_id).first()
    if not album:
        raise HTTPException(status_code=404, detail="Album not found")
    
    # Validate cover_photo_id if provided
    if album_data.cover_photo_id is not None:
        photo = db.query(Photo).filter(Photo.id == album_data.cover_photo_id).first()
        if not photo:
            raise HTTPException(status_code=400, detail="Cover photo not found")
    
    update_data = album_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(album, field, value)
    
    db.commit()
    db.refresh(album)
    
    return {
        "id": album.id,
        "name": album.name,
        "description": album.description,
        "cover_photo_id": album.cover_photo_id,
        "created_at": album.created_at,
        "updated_at": album.updated_at,
        "photo_count": len(album.photos)
    }


@app.delete("/api/albums/{album_id}")
def delete_album(album_id: int, db: Session = Depends(get_db)):
    """Delete an album."""
    album = db.query(Album).filter(Album.id == album_id).first()
    if not album:
        raise HTTPException(status_code=404, detail="Album not found")
    
    db.delete(album)
    db.commit()
    return {"ok": True, "message": "Album deleted successfully"}


# Photo-Album association endpoints
@app.post("/api/albums/{album_id}/photos")
def add_photos_to_album(album_id: int, photo_data: PhotoAlbumAssociation, db: Session = Depends(get_db)):
    """Add photos to an album."""
    album = db.query(Album).filter(Album.id == album_id).first()
    if not album:
        raise HTTPException(status_code=404, detail="Album not found")
    
    # Validate all photo IDs exist
    photos = db.query(Photo).filter(Photo.id.in_(photo_data.photo_ids)).all()
    if len(photos) != len(photo_data.photo_ids):
        found_ids = [photo.id for photo in photos]
        missing_ids = [pid for pid in photo_data.photo_ids if pid not in found_ids]
        raise HTTPException(status_code=400, detail=f"Photos not found: {missing_ids}")
    
    # Add photos to album (SQLAlchemy handles duplicates)
    for photo in photos:
        if photo not in album.photos:
            album.photos.append(photo)
    
    db.commit()
    return {"ok": True, "message": f"Added {len(photos)} photos to album", "album_id": album_id}


@app.delete("/api/albums/{album_id}/photos")
def remove_photos_from_album(album_id: int, photo_data: PhotoAlbumAssociation, db: Session = Depends(get_db)):
    """Remove photos from an album."""
    album = db.query(Album).filter(Album.id == album_id).first()
    if not album:
        raise HTTPException(status_code=404, detail="Album not found")
    
    # Validate all photo IDs exist
    photos = db.query(Photo).filter(Photo.id.in_(photo_data.photo_ids)).all()
    if len(photos) != len(photo_data.photo_ids):
        found_ids = [photo.id for photo in photos]
        missing_ids = [pid for pid in photo_data.photo_ids if pid not in found_ids]
        raise HTTPException(status_code=400, detail=f"Photos not found: {missing_ids}")
    
    # Remove photos from album
    removed_count = 0
    for photo in photos:
        if photo in album.photos:
            album.photos.remove(photo)
            removed_count += 1
    
    db.commit()
    return {"ok": True, "message": f"Removed {removed_count} photos from album", "album_id": album_id}


@app.get("/api/photos/{photo_id}/albums", response_model=List[AlbumResponse])
def get_photo_albums(photo_id: int, db: Session = Depends(get_db)):
    """Get all albums that contain a specific photo."""
    photo = db.query(Photo).filter(Photo.id == photo_id).first()
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")
    
    result = []
    for album in photo.albums:
        album_dict = {
            "id": album.id,
            "name": album.name,
            "description": album.description,
            "cover_photo_id": album.cover_photo_id,
            "created_at": album.created_at,
            "updated_at": album.updated_at,
            "photo_count": len(album.photos)
        }
        result.append(album_dict)
    
    return result
