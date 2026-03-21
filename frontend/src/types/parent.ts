import type { Student } from "./student";

export interface Parent {
  parent_id: number;
  username: string | null;
  full_name: string;
  phone: string;
  email: string | null;
  is_active: boolean;
  created_at: string;
  students?: Student[];
}
