"""Database models for the family homepage application."""

from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean, ForeignKey, Table
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

Base = declarative_base()

# Association table for Many-to-Many relationship between Photo and Album
photo_albums = Table(
    'photo_albums',
    Base.metadata,
    Column('photo_id', Integer, ForeignKey('photos.id'), primary_key=True),
    Column('album_id', Integer, ForeignKey('albums.id'), primary_key=True)
)


class Photo(Base):
    """Photo model for storing uploaded photos."""
    __tablename__ = "photos"
    
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False, index=True)
    original_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size = Column(Integer)
    mime_type = Column(String(100))
    description = Column(Text)
    uploaded_at = Column(DateTime, default=func.now())
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Many-to-Many relationship with Album
    albums = relationship("Album", secondary=photo_albums, back_populates="photos")


class Album(Base):
    """Album model for organizing photos."""
    __tablename__ = "albums"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False, index=True)
    description = Column(Text)
    cover_photo_id = Column(Integer, ForeignKey('photos.id'), nullable=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Many-to-Many relationship with Photo
    photos = relationship("Photo", secondary=photo_albums, back_populates="albums")
    # One-to-One relationship for cover photo
    cover_photo = relationship("Photo", foreign_keys=[cover_photo_id])


class Event(Base):
    """Event model for calendar events."""
    __tablename__ = "events"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False, index=True)
    description = Column(Text)
    event_date = Column(DateTime, nullable=False)
    is_all_day = Column(Boolean, default=False)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())