export type UserRole = 'farmer' | 'buyer';

export type ListingStatus = 'active' | 'sold' | 'expired';

export type DeliveryType = 'Tarlada Teslim' | 'Kargo Uygun' | 'Nakliye Alıcıya Ait';

export type UnitType = 'kg' | 'kasa' | 'ton' | 'çuval';

export type ProductCategory = 
  | 'Sebze' 
  | 'Meyve' 
  | 'Narenciye' 
  | 'Yeşillik' 
  | 'Bakliyat' 
  | 'Tahıl & Yem' 
  | 'Diğer';

export interface Profile {
  id: string;
  full_name: string;
  phone_number: string;
  city: string;
  district: string;
  role: UserRole;
  avatar_url?: string | null;
  bio?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface Listing {
  id: string;
  user_id: string;
  title: string;
  description?: string | null;
  category: ProductCategory;
  quantity: number;
  unit: UnitType;
  price_per_unit: number;
  delivery_type: DeliveryType;
  harvest_end_date: string; // ISO 8601 string
  images: string[];
  city: string;
  district: string;
  village?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  status: ListingStatus;
  views_count: number;
  created_at: string;
  updated_at?: string;
  // İlişkisel profil verisi (join sorguları için)
  profiles?: Profile;
}

export interface CreateListingInput {
  title: string;
  description?: string;
  category: ProductCategory;
  quantity: number;
  unit: UnitType;
  price_per_unit: number;
  delivery_type: DeliveryType;
  harvest_end_date: string;
  images: string[];
  city: string;
  district: string;
  village?: string;
  latitude?: number;
  longitude?: number;
  phone_number?: string;
  farmer_name?: string;
}

export interface FreshnessInfo {
  daysRemaining: number;
  hoursRemaining: number;
  badgeText: string;
  badgeVariant: 'fresh' | 'urgent' | 'expired';
  isExpired: boolean;
  isUrgent: boolean; // <= 48 hours / 2 days
}
