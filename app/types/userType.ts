export interface User {
  user_id: number;
  id: string;
  email: string;
  username: string;
  role: string;
  avatar_url?: string;
  bio?: string;
  city?: string;
  ip_address?: string;
  longitude?: number;
  latitude?: number;
  is_active?: boolean;
  is_verified?: boolean;
  created_at: string;
  updated_at?: string;
}
