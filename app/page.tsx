"use client";

import { useState } from "react";
import Link from "next/link";
import { createTicket } from "@/lib/api";

const DEMO_TEMPLATES = [
  {
    icon: "📦",
    label: "Kargo Gecikmesi",
    title: "Siparişim 5 gündür kargoya verilmedi",
    description: "Geçen hafta verdiğim sipariş hala hazırlanıyor olarak görünüyor. Acil kargo takip no ve teslimat hızlandırması rica ediyorum."
  },
  {
    icon: "💳",
    label: "Arızalı Ürün / İade",
    title: "Ürün kutusundan kırık çıktı, iade talebi",
    description: "Bugün teslim aldığım monitörün paneli çatlak ve çalışmıyor. İade kodumun oluşturulmasını ve ücretimin kartıma iadesini talep ediyorum."
  },
  {
    icon: "🔑",
    label: "Şifre ve Giriş Sorunu",
    title: "Hesabıma giriş yapamıyorum şifre sıfırlanmıyor",
    description: "Şifremi unuttum bağlantısı e-posta adresime ulaşmıyor. Hesabıma erişimimi acil açabilir misiniz?"
  },
  {
    icon: "🧾",
    label: "Mükerrer Fatura",
    title: "Kredi kartımdan iki kez çekim yapılmış",
    description: "Abonelik yenilemesinde kartımdan aynı tutar 2 defa tahsil edilmiş görünüyor. Fazla çekimin iptalini ve dekont rica ederim."
  }
];

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

  const applyTemplate = (tpl: typeof DEMO_TEMPLATES[0]) => {
    setTitle(tpl.title);
    setDescription(tpl.description);
    setSuccess(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-6">
      <header className="max-w-2xl w-full mx-auto flex items-center justify-between pb-6 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center font-bold text-sm shadow-lg shadow-purple-900/30">
            Ω
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight">OmniResolve Destek</h1>
            <p className="text-[11px] text-slate-400">Autonomous Customer Operations</p>
          </div>
        </div>
        <Link
          href="/agent"
          className="text-xs px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center space-x-1.5"
        >
          <span>Temsilci Paneli</span>
          <span>→</span>
        </Link>
      </header>

      <main className="max-w-2xl w-full mx-auto my-auto py-8">
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold tracking-tight text-white">Yeni Destek Bileti Aç</h2>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-950/70 text-blue-400 border border-blue-800/40">
              AI-Native Triage
            </span>
          </div>
          <p className="text-xs text-slate-400 mb-6">
            Sorununuzu iletin; yapay zeka modelimiz anında önceliklendirip operasyonel çözüm planını hazırlasın.
          </p>

          {/* Hızlı Demo Şablonları */}
          <div className="mb-6">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-2">
              ⚡ Hızlı Demo Şablonları (Tek Tıkla Doldur):
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {DEMO_TEMPLATES.map((tpl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => applyTemplate(tpl)}
                  className="p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-purple-500/50 text-left transition group"
                >
                  <span className="text-base block mb-0.5">{tpl.icon}</span>
                  <span className="text-xs font-medium text-slate-300 group-hover:text-purple-300 block line-clamp-1">
                    {tpl.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {success && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-sm flex items-center justify-between shadow-lg">
              <div className="flex items-center space-x-2">
                <span className="text-lg">✓</span>
                <span>Biletiniz AI analizine alındı ve temsilci sırasına iletildi.</span>
              </div>
              <Link
                href="/agent"
                className="text-xs font-semibold px-2.5 py-1 rounded bg-emerald-800 hover:bg-emerald-700 text-emerald-100 transition"
              >
                Agent&apos;ta Gör →
              </Link>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-xs font-medium text-slate-300 mb-1.5">
                Açıklama / Mesajınız
              </label>
              <textarea
                id="description"
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Yaşadığınız sorunu detaylarıyla anlatın..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition resize-y"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium text-sm transition shadow-lg shadow-purple-900/40 disabled:opacity-50"
            >
              {loading ? "AI Analizi Yapılıyor & Gönderiliyor..." : "Bileti Gönder ve AI Çözümü Üret 🚀"}
            </button>
          </form>
        </div>
      </main>

      <footer className="text-center text-xs text-slate-600 py-4 flex items-center justify-center space-x-4">
        <span>OmniResolve AI-Native Support</span>
        <span>•</span>
        <span>Fortune 500 Architecture</span>
      </footer>
    </div>
  );
}
