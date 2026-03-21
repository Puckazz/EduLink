import type { Parent } from "./parent";

export interface Feedback {
  feedback_id: number;
  content: string;
  reply_content: string | null;
  created_at: string;
  replied_at: string | null;
  parent_id: number;
  parent?: Parent;
}

export interface CreateFeedbackDto {
  content: string;
}
