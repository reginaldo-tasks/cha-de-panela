// Types for Wedding Gift List Application

export interface Couple {
  id: string;
  email: string;
  coupleName: string;
  listTitle: string;
  whatsapp: string;
  pixKey: string;
  qrCodeUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Gift {
  id: string;
  coupleId: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  isSelected: boolean;
  selectedAt: string | null;
  createdAt: string;
  updatedAt: string;
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
  title: string;
  description: string;
  price: number;
  imageUrl: string;
}

export interface UpdateGiftInput extends Partial<CreateGiftInput> {
  isSelected?: boolean;
}

export interface UpdateCoupleInput {
  coupleName?: string;
  listTitle?: string;
  whatsapp?: string;
  pixKey?: string;
  qrCodeUrl?: string | null;
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