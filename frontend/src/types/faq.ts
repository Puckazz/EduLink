import type { FeedbackCategory } from './feedback';

export interface Faq {
  faq_id: number;
  question: string;
  answer: string;
  category: FeedbackCategory;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateFaqDto {
  question: string;
  answer: string;
  category: FeedbackCategory;
  sort_order?: number;
  is_active?: boolean;
}

export type UpdateFaqDto = Partial<CreateFaqDto>;

export interface FaqGroup {
  category: FeedbackCategory;
  label: string;
  items: Faq[];
}
