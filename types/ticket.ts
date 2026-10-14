export interface Ticket {
  id: number;
  title: string;
  description: string;
  status: "open" | "in_progress" | "closed";
  ai_draft_reply: string | null;
  ai_suggested_action: string | null;
  created_at: string;
  updated_at: string;
}
