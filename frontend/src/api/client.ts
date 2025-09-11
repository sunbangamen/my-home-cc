import type { 
  Photo, Event, Album, AlbumWithPhotos, 
  AlbumCreate, AlbumUpdate, PhotoAlbumAssociation 
} from '../types/index';

const API_BASE = import.meta.env.VITE_API_BASE || '';

export interface CreateEvent {
  title: string;
  description?: string;
  event_date: string;
  is_all_day: boolean;
}

export interface UpdateEvent {
  title?: string;
  description?: string;
  event_date?: string;
  is_all_day?: boolean;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE) {
    this.baseUrl = baseUrl;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }
    return response.json();
  }

  // Health Check
  async healthCheck(): Promise<{ status: string; database: string; service: string; version: string }> {
    const response = await fetch(`${this.baseUrl}/api/health`);
    return this.handleResponse(response);
  }

  // Photos API
  async getPhotos(): Promise<Photo[]> {
    const response = await fetch(`${this.baseUrl}/api/photos`);
    return this.handleResponse(response);
  }

  async uploadPhoto(file: File): Promise<Photo> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${this.baseUrl}/api/photos/upload`, {
      method: 'POST',
      body: formData,
    });
    return this.handleResponse(response);
  }

  // Events API
  async getEvents(): Promise<Event[]> {
    const response = await fetch(`${this.baseUrl}/api/events`);
    return this.handleResponse(response);
  }

  async getEvent(id: number): Promise<Event> {
    const response = await fetch(`${this.baseUrl}/api/events/${id}`);
    return this.handleResponse(response);
  }

  async createEvent(event: CreateEvent): Promise<Event> {
    const response = await fetch(`${this.baseUrl}/api/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });
    return this.handleResponse(response);
  }

  async updateEvent(id: number, event: UpdateEvent): Promise<Event> {
    const response = await fetch(`${this.baseUrl}/api/events/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });
    return this.handleResponse(response);
  }

  async deleteEvent(id: number): Promise<{ ok: boolean; message: string }> {
    const response = await fetch(`${this.baseUrl}/api/events/${id}`, {
      method: 'DELETE',
    });
    return this.handleResponse(response);
  }

  // Albums API
  async getAlbums(): Promise<Album[]> {
    const response = await fetch(`${this.baseUrl}/api/albums`);
    return this.handleResponse(response);
  }

  async getAlbum(id: number): Promise<AlbumWithPhotos> {
    const response = await fetch(`${this.baseUrl}/api/albums/${id}`);
    return this.handleResponse(response);
  }

  async createAlbum(album: AlbumCreate): Promise<Album> {
    const response = await fetch(`${this.baseUrl}/api/albums`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(album),
    });
    return this.handleResponse(response);
  }

  async updateAlbum(id: number, album: AlbumUpdate): Promise<Album> {
    const response = await fetch(`${this.baseUrl}/api/albums/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(album),
    });
    return this.handleResponse(response);
  }

  async deleteAlbum(id: number): Promise<{ ok: boolean; message: string }> {
    const response = await fetch(`${this.baseUrl}/api/albums/${id}`, {
      method: 'DELETE',
    });
    return this.handleResponse(response);
  }

  // Photo-Album Association API
  async addPhotosToAlbum(albumId: number, photoIds: number[]): Promise<{ ok: boolean; message: string; album_id: number }> {
    const response = await fetch(`${this.baseUrl}/api/albums/${albumId}/photos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ photo_ids: photoIds }),
    });
    return this.handleResponse(response);
  }

  async removePhotosFromAlbum(albumId: number, photoIds: number[]): Promise<{ ok: boolean; message: string; album_id: number }> {
    const response = await fetch(`${this.baseUrl}/api/albums/${albumId}/photos`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ photo_ids: photoIds }),
    });
    return this.handleResponse(response);
  }

  async getPhotoAlbums(photoId: number): Promise<Album[]> {
    const response = await fetch(`${this.baseUrl}/api/photos/${photoId}/albums`);
    return this.handleResponse(response);
  }
}

export const apiClient = new ApiClient();
export default apiClient;

// Convenience exports for direct use (with proper this binding)
export const healthCheck = apiClient.healthCheck.bind(apiClient);
export const getPhotos = apiClient.getPhotos.bind(apiClient);
export const uploadPhoto = apiClient.uploadPhoto.bind(apiClient);
export const getEvents = apiClient.getEvents.bind(apiClient);
export const getEvent = apiClient.getEvent.bind(apiClient);
export const createEvent = apiClient.createEvent.bind(apiClient);
export const updateEvent = apiClient.updateEvent.bind(apiClient);
export const deleteEvent = apiClient.deleteEvent.bind(apiClient);
export const getAlbums = apiClient.getAlbums.bind(apiClient);
export const getAlbum = apiClient.getAlbum.bind(apiClient);
export const createAlbum = apiClient.createAlbum.bind(apiClient);
export const updateAlbum = apiClient.updateAlbum.bind(apiClient);
export const deleteAlbum = apiClient.deleteAlbum.bind(apiClient);
export const addPhotosToAlbum = apiClient.addPhotosToAlbum.bind(apiClient);
export const removePhotosFromAlbum = apiClient.removePhotosFromAlbum.bind(apiClient);
export const getPhotoAlbums = apiClient.getPhotoAlbums.bind(apiClient);