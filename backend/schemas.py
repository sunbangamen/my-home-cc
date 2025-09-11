"""Pydantic schemas for request/response models."""

from datetime import datetime
from pydantic import BaseModel
from typing import Optional, List


# Photo schemas
class PhotoBase(BaseModel):
    description: Optional[str] = None


class PhotoCreate(PhotoBase):
    pass


class PhotoResponse(PhotoBase):
    id: int
    filename: str
    original_name: str
    file_size: Optional[int] = None
    mime_type: Optional[str] = None
    uploaded_at: datetime
    
    class Config:
        from_attributes = True


# Event schemas
class EventBase(BaseModel):
    title: str
    description: Optional[str] = None
    event_date: datetime
    is_all_day: bool = False


class EventCreate(EventBase):
    pass


class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    event_date: Optional[datetime] = None
    is_all_day: Optional[bool] = None


class EventResponse(EventBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# Album schemas
class AlbumBase(BaseModel):
    name: str
    description: Optional[str] = None


class AlbumCreate(AlbumBase):
    pass


class AlbumUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    cover_photo_id: Optional[int] = None


class AlbumResponse(AlbumBase):
    id: int
    cover_photo_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    photo_count: Optional[int] = None
    
    class Config:
        from_attributes = True


class AlbumWithPhotos(AlbumResponse):
    photos: List['PhotoResponse'] = []
    
    class Config:
        from_attributes = True


# Photo-Album association schemas
class PhotoAlbumAssociation(BaseModel):
    photo_ids: List[int]


# Update PhotoResponse to include albums if needed
class PhotoWithAlbums(PhotoResponse):
    albums: List['AlbumResponse'] = []
    
    class Config:
        from_attributes = True