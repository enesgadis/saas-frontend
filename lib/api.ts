import { Ticket } from "@/types/ticket";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function getTickets(): Promise<Ticket[]> {
  const res = await fetch(`${API_BASE_URL}/tickets`, { cache: "no-store" });
  if (!res.ok) throw new Error("Biletler alinamadi");
  return res.json();
}

export async function createTicket(payload: { title: string; description: string }): Promise<Ticket> {
  const res = await fetch(`${API_BASE_URL}/tickets`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ticket: payload }),
  });
  if (!res.ok) throw new Error("Bilet olusturulamadi");
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
