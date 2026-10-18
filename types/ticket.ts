export interface Ticket {
  id: number;
  title: string;
  description: string;
  customer_name?: string | null;
  customer_email?: string | null;
  status: "open" | "in_progress" | "closed";
  ai_draft_reply: string | null;
  ai_suggested_action: string | null;
  department?: string | null;
  internal_note?: string | null;
  time_saved_minutes?: number | null;
  created_at: string;
  updated_at: string;
}

