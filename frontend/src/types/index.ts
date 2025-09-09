export interface Photo {
  id: number;
  filename: string;
  title: string;
  uploaded_at: string;
  thumbnail: string;
}

export interface Event {
  id: number;
  title: string;
  date: string;
  description?: string;
}