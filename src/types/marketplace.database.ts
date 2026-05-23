/**
 * Resources Marketplace — Supabase database types
 * Regenerate after schema changes: supabase gen types typescript --linked > src/types/marketplace.database.ts
 */

export type ProfileRole = 'admin' | 'creator' | 'customer';
export type ResourceStatus = 'draft' | 'published' | 'archived';
export type PricingType = 'free' | 'paid';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  website: string | null;
  role: ProfileRole;
  verified: boolean;
  social_links: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface ResourceCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  featured: boolean;
  display_order: number;
  created_at: string;
}

export interface Resource {
  id: string;
  slug: string;
  title: string;
  short_description: string | null;
  full_description: string | null;
  thumbnail_url: string | null;
  preview_images: string[];
  preview_video_url: string | null;
  category_id: string | null;
  creator_id: string | null;
  pricing_type: PricingType;
  price: number;
  compare_at_price: number | null;
  currency: string;
  featured: boolean;
  status: ResourceStatus;
  file_size: number | null;
  file_formats: string[];
  compatibility: string[];
  license_type: string;
  tags: string[];
  download_count: number;
  view_count: number;
  rating_average: number;
  rating_count: number;
  max_downloads_per_day: number;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

/** Storefront-safe subset */
export type PublishedResource = Pick<
  Resource,
  | 'id'
  | 'slug'
  | 'title'
  | 'short_description'
  | 'thumbnail_url'
  | 'preview_images'
  | 'preview_video_url'
  | 'category_id'
  | 'creator_id'
  | 'pricing_type'
  | 'price'
  | 'compare_at_price'
  | 'currency'
  | 'featured'
  | 'file_formats'
  | 'compatibility'
  | 'license_type'
  | 'tags'
  | 'download_count'
  | 'view_count'
  | 'rating_average'
  | 'rating_count'
  | 'seo_title'
  | 'seo_description'
  | 'published_at'
  | 'created_at'
>;

export interface ResourceFile {
  id: string;
  resource_id: string;
  file_name: string;
  file_path: string;
  file_size: number | null;
  file_type: string | null;
  storage_bucket: string;
  version: number;
  is_primary: boolean;
  created_at: string;
}

export interface Purchase {
  id: string;
  user_id: string | null;
  buyer_email: string | null;
  resource_id: string;
  amount_paid: number;
  currency: string;
  payment_provider: string | null;
  payment_status: PaymentStatus;
  transaction_id: string | null;
  metadata: Record<string, unknown>;
  purchased_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Download {
  id: string;
  user_id: string | null;
  resource_id: string;
  purchase_id: string | null;
  resource_file_id: string | null;
  downloaded_at: string;
  ip_address: string | null;
  user_agent: string | null;
  session_id: string | null;
}

export interface Review {
  id: string;
  user_id: string;
  resource_id: string;
  rating: number;
  review_text: string | null;
  approved: boolean;
  created_at: string;
  updated_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  resource_id: string;
  created_at: string;
}

export interface Newsletter {
  id: string;
  email: string;
  subscribed_at: string;
  unsubscribed_at: string | null;
  source: string | null;
}

export interface DownloadableFileRow {
  file_id: string;
  file_name: string;
  file_path: string;
  storage_bucket: string;
  file_type: string | null;
  file_size: number | null;
  version: number;
}

export interface ResourceWithCategory extends PublishedResource {
  resource_categories: Pick<ResourceCategory, 'name' | 'slug' | 'icon'> | null;
}

export interface ResourceWithCreator extends ResourceWithCategory {
  profiles: Pick<Profile, 'id' | 'full_name' | 'username' | 'avatar_url' | 'verified'> | null;
}

/** Insert / update helpers */
export type ResourceInsert = Partial<Omit<Resource, 'id' | 'created_at' | 'updated_at' | 'search_vector'>> &
  Pick<Resource, 'slug' | 'title' | 'pricing_type'>;

export type ResourceUpdate = Partial<ResourceInsert>;

export type ReviewInsert = Pick<Review, 'resource_id' | 'rating'> &
  Partial<Pick<Review, 'review_text'>>;

export type PurchaseInsert = Pick<Purchase, 'resource_id' | 'amount_paid'> &
  Partial<Pick<Purchase, 'currency' | 'payment_provider' | 'transaction_id'>>;

export interface MarketplaceDatabase {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile> & { id: string }; Update: Partial<Profile> };
      resource_categories: {
        Row: ResourceCategory;
        Insert: Partial<ResourceCategory>;
        Update: Partial<ResourceCategory>;
      };
      resources: { Row: Resource; Insert: ResourceInsert; Update: ResourceUpdate };
      resource_files: { Row: ResourceFile; Insert: Partial<ResourceFile>; Update: Partial<ResourceFile> };
      purchases: { Row: Purchase; Insert: PurchaseInsert; Update: Partial<Purchase> };
      downloads: { Row: Download; Insert: Partial<Download>; Update: Partial<Download> };
      reviews: { Row: Review; Insert: ReviewInsert; Update: Partial<Review> };
      favorites: { Row: Favorite; Insert: Pick<Favorite, 'resource_id'>; Update: never };
      newsletters: { Row: Newsletter; Insert: Pick<Newsletter, 'email'>; Update: Partial<Newsletter> };
    };
    Functions: {
      search_resources: {
        Args: {
          p_query?: string | null;
          p_category_slug?: string | null;
          p_pricing_type?: PricingType | null;
          p_featured_only?: boolean;
          p_sort?: string;
          p_limit?: number;
          p_offset?: number;
        };
        Returns: Resource[];
      };
      get_trending_resources: { Args: { p_days?: number; p_limit?: number }; Returns: Resource[] };
      get_related_resources: { Args: { p_resource_id: string; p_limit?: number }; Returns: Resource[] };
      record_resource_view: { Args: { p_resource_id: string; p_session_id?: string | null }; Returns: void };
      record_resource_download: {
        Args: {
          p_resource_id: string;
          p_resource_file_id?: string | null;
          p_session_id?: string | null;
          p_ip_address?: string | null;
          p_user_agent?: string | null;
        };
        Returns: string;
      };
      get_downloadable_files: { Args: { p_resource_id: string }; Returns: DownloadableFileRow[] };
      create_resource_purchase: {
        Args: { p_resource_id: string; p_payment_provider?: string; p_transaction_id?: string | null };
        Returns: string;
      };
      user_can_access_resource: { Args: { p_resource_id: string; p_user_id?: string | null }; Returns: boolean };
    };
  };
}

export type ResourceSort =
  | 'newest'
  | 'trending'
  | 'downloads'
  | 'rating'
  | 'price_asc'
  | 'price_desc';

export interface ResourceSearchParams {
  query?: string;
  categorySlug?: string;
  pricingType?: PricingType;
  featuredOnly?: boolean;
  sort?: ResourceSort;
  limit?: number;
  offset?: number;
}
