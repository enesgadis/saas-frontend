"use client";

import { useState } from "react";
import Link from "next/link";
import { createTicket } from "@/lib/api";

export default function CustomerPortal() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    try {
      setLoading(true);
      setError("");
      await createTicket({ title, description });
      setSuccess(true);
      setTitle("");
      setDescription("");
    } catch {
      setError("Bilet oluşturulurken bir hata meydana geldi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-6">
      <header className="max-w-2xl w-full mx-auto flex items-center justify-between pb-6 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          <h1 className="text-lg font-bold tracking-tight">OmniResolve Destek</h1>
        </div>
        <Link
          href="/agent"
          className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
        >
          Agent Paneline Git →
        </Link>
      </header>

      <main className="max-w-2xl w-full mx-auto my-auto py-8">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl">
          <h2 className="text-xl font-semibold mb-1">Yeni Destek Bileti Aç</h2>
          <p className="text-xs text-slate-400 mb-6">
            Sorununuzu detaylandırın, yapay zeka destekli ekibimiz hemen yanıt hazırlasın.
          </p>

          {success && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 text-sm flex items-center justify-between">
              <span>✓ Biletiniz oluşturuldu. En kısa sürede yanıtlanacaktır.</span>
              <button
                type="button"
                onClick={() => setSuccess(false)}
                className="text-xs text-emerald-400 hover:underline"
              >
                Yeni Bilet
              </button>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-950/50 border border-red-500/30 text-red-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="title" className="block text-xs font-medium text-slate-300 mb-1.5">
                Konu Başlığı
              </label>
              <input
                id="title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Örn: Siparişim kargoya verilmedi"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-xs font-medium text-slate-300 mb-1.5">
                Açıklama / Mesajınız
              </label>
              <textarea
                id="description"
                required
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Yaşadığınız sorunu detaylarıyla anlatın..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-y"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition disabled:opacity-50"
            >
              {loading ? "Oluşturuluyor..." : "Bileti Gönder"}
            </button>
          </form>
        </div>
      </main>

      <footer className="text-center text-xs text-slate-600 py-4">
        OmniResolve AI-Native Support
      </footer>
    </div>
  );
}
