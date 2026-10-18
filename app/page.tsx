"use client";

import { useState } from "react";
import Link from "next/link";
import { createTicket } from "@/lib/api";

const COMMON_TOPICS = [
  {
    icon: "📦",
    label: "Kargo Gecikmesi",
    customer_name: "Ahmet Yılmaz",
    customer_email: "ahmet.yilmaz@sirket.com",
    title: "Siparişim 5 gündür kargoya verilmedi",
    description: "Geçen hafta verdiğim sipariş sisteminizde hala 'hazırlanıyor' olarak görünüyor. Acil kargo takip numaramın paylaşılmasını ve sevkiyatın hızlandırılmasını talep ediyorum."
  },
  {
    icon: "💳",
    label: "Arızalı Ürün & İade",
    customer_name: "Zeynep Kaya",
    customer_email: "zeynep.kaya@kurumsal.com",
    title: "Ürün hasarlı teslim edildi, iade talebi",
    description: "Bugün teslim aldığım cihazın ekranında çatlak ve fiziksel hasar mevcut. Ürünün iadesi için kargo anlaşma kodunun tarafıma iletilmesini ve tutarın kartıma iadesini rica ederim."
  },
  {
    icon: "🔑",
    label: "Hesap & Erişim",
    customer_name: "Mehmet Demir",
    customer_email: "mehmet.demir@firma.com",
    title: "Kurumsal hesaba giriş yapılamıyor",
    description: "Şifremi sıfırlamak istediğimde tek kullanımlık doğrulama bağlantısı e-posta kutuma ulaşmıyor. Hesabıma acil erişim sağlamam gerekiyor."
  },
  {
    icon: "🧾",
    label: "Fatura & Muhasebe",
    customer_name: "Canan Şahin",
    customer_email: "canan.sahin@holding.com",
    title: "Kredi kartından mükerrer tahsilat",
    description: "Aylık lisans yenilemesinde kurumsal kartımızdan aynı tutar 2 defa tahsil edilmiştir. Fazla çekilen bedelin iadesi ve muhasebe dekontunun tarafımıza gönderilmesini rica ederiz."
  }
];

export default function CustomerPortal() {
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !customerName.trim() || !customerEmail.trim()) {
      setError("Lütfen tüm zorunlu alanları doldurunuz.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await createTicket({
        title,
        description,
        customer_name: customerName,
        customer_email: customerEmail
      });
      setSuccess(true);
      setTitle("");
      setDescription("");
      setCustomerName("");
      setCustomerEmail("");
    } catch {
      setError("Talebiniz iletilirken sistemsel bir hata meydana geldi. Lütfen tekrar deneyiniz.");
    } finally {
      setLoading(false);
    }
  };

  const applyTopic = (topic: typeof COMMON_TOPICS[0]) => {
    setCustomerName(topic.customer_name);
    setCustomerEmail(topic.customer_email);
    setTitle(topic.title);
    setDescription(topic.description);
    setSuccess(false);
    setError("");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-6 font-sans">
      {/* Kurumsal Header */}
      <header className="max-w-2xl w-full mx-auto flex items-center justify-between pb-6 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-sm text-white shadow-md">
            Ω
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white">Müşteri Destek Merkezi</h1>
            <p className="text-[11px] text-slate-400">OmniResolve Kurumsal Müşteri Hizmetleri</p>
          </div>
        </div>

        <Link
          href="/agent"
          className="text-xs px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition flex items-center space-x-1.5"
        >
          <span>🔒 Temsilci Girişi</span>
        </Link>
      </header>

      {/* Ana Destek Formu */}
      <main className="max-w-2xl w-full mx-auto my-auto py-8">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl backdrop-blur-sm">
          <div className="mb-6">
            <h2 className="text-xl font-bold tracking-tight text-white mb-1">Destek Talebi Oluşturun</h2>
            <p className="text-xs text-slate-400">
              Sorununuzu ve iletişim bilgilerinizi iletin. Müşteri temsilcilerimiz en kısa sürede kaydınızı inceleyerek çözüm sağlayacaktır.
            </p>
          </div>

          {/* Sık Karşılaşılan Konular */}
          <div className="mb-6">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-2">
              Örnek Konu Seçin (Otomatik Doldur):
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {COMMON_TOPICS.map((topic, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => applyTopic(topic)}
                  className="p-2.5 rounded-xl bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800 hover:border-blue-500/50 text-left transition group"
                >
                  <span className="text-base block mb-0.5">{topic.icon}</span>
                  <span className="text-xs font-medium text-slate-300 group-hover:text-blue-300 block line-clamp-1">
                    {topic.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {success && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-sm flex items-center justify-between shadow-lg">
              <div className="flex items-center space-x-2">
                <span className="text-lg">✓</span>
                <span>Talebiniz başarıyla alındı. Destek uzmanımız en kısa sürede yanıt verecektir.</span>
              </div>
              <button
                type="button"
                onClick={() => setSuccess(false)}
                className="text-xs font-semibold px-2.5 py-1 rounded bg-emerald-800 hover:bg-emerald-700 text-emerald-100 transition"
              >
                Yeni Talep Aç
              </button>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Müşteri İletişim Bilgileri */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="customer_name" className="block text-xs font-medium text-slate-300 mb-1.5">
                  Adınız ve Soyadınız <span className="text-red-400">*</span>
                </label>
                <input
                  id="customer_name"
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Örn: Ahmet Yılmaz"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>

              <div>
                <label htmlFor="customer_email" className="block text-xs font-medium text-slate-300 mb-1.5">
                  E-posta Adresiniz <span className="text-red-400">*</span>
                </label>
                <input
                  id="customer_email"
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="Örn: ahmet@sirket.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
            </div>

            <div>
              <label htmlFor="title" className="block text-xs font-medium text-slate-300 mb-1.5">
                Talep Konusu <span className="text-red-400">*</span>
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
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="description" className="block text-xs font-medium text-slate-300">
                  Mesajınız / Talebinizin Detayları <span className="text-red-400">*</span>
                </label>
                {description.trim().length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof window !== "undefined" && "speechSynthesis" in window) {
                        window.speechSynthesis.cancel();
                        const u = new SpeechSynthesisUtterance(description);
                        u.lang = "tr-TR";
                        window.speechSynthesis.speak(u);
                      }
                    }}
                    className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center space-x-1"
                    title="Yazdığınız metni dinleyin"
                  >
                    <span>🔊 Metni Dinle</span>
                  </button>
                )}
              </div>
              <textarea
                id="description"
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Talebinizi, sipariş veya fatura numaranızı detaylandırarak açıklayınız..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-y"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition shadow-lg shadow-blue-900/30 disabled:opacity-50"
            >
              {loading ? "Talebiniz İletiliyor..." : "Destek Talebini Gönder"}
            </button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-600 py-4 flex items-center justify-center space-x-3">
        <span>OmniResolve Destek Çözümleri</span>
        <span>•</span>
        <span>Gizlilik ve Hizmet Koşulları</span>
      </footer>
    </div>
  );
}
