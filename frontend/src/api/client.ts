const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

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
}

export const apiClient = new ApiClient();
export default apiClient;