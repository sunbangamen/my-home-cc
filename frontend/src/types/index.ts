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