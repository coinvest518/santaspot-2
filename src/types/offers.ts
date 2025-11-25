
// types/offers.ts
export type Offer = {
  id: string;
  title: string;
  description: string;
  category: string;
  image_url: string; // URL for fetching images from external sources
  reward: number;
  is_active: boolean;
  estimated_time?: string;
  link: string;
  created_at: string;
  requirements?: string[];
};

export interface UserStats {
  user_id?: string;
  rank?: number;
  total_earned: number;
  completed_offers: number;
  current_streak: number;
  social_shares?: number;
  last_offer_completed?: string;
  updated_at?: string;
}

export interface OfferClick {
  id: string;
  user_id: string;
  offer_id: string;
  clicked_at: string;
  status: 'pending' | 'completed' | 'failed';
}