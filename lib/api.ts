import { Ticket } from "@/types/ticket";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function getTickets(): Promise<Ticket[]> {
  const res = await fetch(`${API_BASE_URL}/tickets`, { cache: "no-store" });
  if (!res.ok) throw new Error("Biletler alinamadi");
  return res.json();
}

export async function getTicket(id: number): Promise<Ticket> {
  const res = await fetch(`${API_BASE_URL}/tickets/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Bilet bulunamadi");
  return res.json();
}

export async function createTicket(payload: {
  title: string;
  description: string;
  customer_name?: string;
  customer_email?: string;
}): Promise<Ticket> {
  const res = await fetch(`${API_BASE_URL}/tickets`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ticket: payload }),
  });
  if (!res.ok) throw new Error("Bilet olusturulamadi");
  return res.json();
}

// Temsilci tarafından talep edilen canlı AI analizi
export async function analyzeTicket(id: number): Promise<Ticket> {
  const res = await fetch(`${API_BASE_URL}/tickets/${id}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Yapay zeka analizi yapilamadi");
  return res.json();
}

export async function updateTicket(id: number, payload: Partial<Ticket>): Promise<Ticket> {
  const res = await fetch(`${API_BASE_URL}/tickets/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ticket: payload }),
  });
  if (!res.ok) throw new Error("Bilet guncellenemedi");
  return res.json();
}