export interface Photo {
  id: number;
  filename: string;
  original_name: string;
  file_size: number;
  mime_type: string;
  uploaded_at: string;
  description?: string;
}

export interface Event {
  id: number;
  title: string;
  description?: string;
  event_date: string;
  is_all_day: boolean;
  created_at: string;
  updated_at: string;
}

export interface Album {
  id: number;
  name: string;
  description?: string;
  cover_photo_id?: number;
  created_at: string;
  updated_at: string;
  photo_count?: number;
}

export interface AlbumWithPhotos extends Album {
  photos: Photo[];
}

export interface AlbumCreate {
  name: string;
  description?: string;
}

export interface AlbumUpdate {
  name?: string;
  description?: string;
  cover_photo_id?: number;
}

export interface PhotoAlbumAssociation {
  photo_ids: number[];
}