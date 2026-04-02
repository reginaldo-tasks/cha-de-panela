// Types for Wedding Gift List Application

export interface Couple {
  id: string;
  email: string;
  couple_name: string;
  list_title?: string | null;
  whatsapp?: string | null;
  pix_key?: string | null;
  qr_code_url?: string | null;
  wedding_date?: string | null;
  biography?: string | null;
  image_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Gift {
  id: string;
  couple?: string;
  couple_name?: string;
  name: string;
  title?: string;
  description?: string | null;
  price?: number | string | null;
  image_url?: string | null;
  imageUrl?: string;
  category?: string | null;
  priority?: number;
  status?: 'available' | 'reserved' | 'purchased';
  reserved_by?: string | null;
  url?: string | null;
  is_selected?: boolean;
  isSelected?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  couple: Couple;
}

export interface CreateGiftInput {
  name?: string;
  title?: string;
  description?: string;
  price?: number | string;
  image_url?: string;
  imageUrl?: string;
  category?: string;
}

export interface UpdateGiftInput extends Partial<CreateGiftInput> {
  is_selected?: boolean;
  isSelected?: boolean;
}

export interface UpdateCoupleInput {
  couple_name?: string;
  coupleName?: string;
  list_title?: string;
  listTitle?: string;
  whatsapp?: string;
  pix_key?: string;
  pixKey?: string;
  qr_code_url?: string | null;
  qrCodeUrl?: string | null;
  wedding_date?: string;
  biography?: string;
  image_url?: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
}