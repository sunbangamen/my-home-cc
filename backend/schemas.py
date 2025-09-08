"""Pydantic schemas for request/response models."""

from datetime import datetime
from pydantic import BaseModel
from typing import Optional


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