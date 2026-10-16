"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Ticket } from "@/types/ticket";
import { getTickets, updateTicket } from "@/lib/api";

export default function AgentDashboard() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [draftReply, setDraftReply] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const loadTickets = async () => {
    try {
      setLoading(true);
      const data = await getTickets();
      setTickets(data);
      if (data.length > 0 && !selectedTicket) {
        selectTicket(data[0]);
      }
    } catch {
      setFeedback("API bağlantı hatası. Backend sunucusunun ayakta olduğunu kontrol edin.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const selectTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setDraftReply(ticket.ai_draft_reply || "");
    setFeedback("");
  };

  const handleUpdate = async (statusOverride?: Ticket["status"]) => {
    if (!selectedTicket) return;
    try {
      setSaving(true);
      const updated = await updateTicket(selectedTicket.id, {
        ai_draft_reply: draftReply,
        status: statusOverride || selectedTicket.status,
      });
      setSelectedTicket(updated);
      setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      setFeedback("Değişiklikler başarıyla kaydedildi.");
    } catch {
      setFeedback("Güncelleme başarısız.");
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmAction = async () => {
    if (!selectedTicket) return;
    try {
      setSaving(true);
      const updated = await updateTicket(selectedTicket.id, {
        ai_draft_reply: draftReply,
        status: "closed",
      });
      setSelectedTicket(updated);
      setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      setFeedback(`✓ Usable Pass Onaylandı: Aksiyon işlendi ve bilet çözümlenerek kapatıldı.`);
    } catch {
      setFeedback("Aksiyon onaylanırken hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  // İkincil etiketleme (Kategori & Öncelik Algılama)
  const getTicketMeta = (t: Ticket) => {
    const text = `${t.title} ${t.description}`.toLowerCase();
    let category = { label: "Genel Destek", icon: "💬", color: "text-slate-400 bg-slate-800/40 border-slate-700/50" };
    let priority = { label: "Normal", color: "text-blue-400 bg-blue-950/40 border-blue-800/40" };

    if (text.includes("iade") || text.includes("arıza") || text.includes("bozuk") || text.includes("para")) {
      category = { label: "İade & Değişim", icon: "💳", color: "text-amber-400 bg-amber-950/40 border-amber-800/40" };
      priority = { label: "Yüksek", color: "text-orange-400 bg-orange-950/40 border-orange-800/40" };
    } else if (text.includes("kargo") || text.includes("teslim") || text.includes("gecik") || text.includes("nerede")) {
      category = { label: "Lojistik & Kargo", icon: "📦", color: "text-cyan-400 bg-cyan-950/40 border-cyan-800/40" };
      priority = { label: "Acil", color: "text-red-400 bg-red-950/40 border-red-800/40" };
    } else if (text.includes("şifre") || text.includes("giriş") || text.includes("hesap")) {
      category = { label: "Güvenlik & Hesap", icon: "🔑", color: "text-purple-400 bg-purple-950/40 border-purple-800/40" };
    }

    return { category, priority };
  };

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const matchesSearch =
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || t.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [tickets, searchQuery, statusFilter]);

  // Metrik Hesaplamaları
  const stats = useMemo(() => {
    const total = tickets.length;
    const open = tickets.filter((t) => t.status === "open").length;
    const closed = tickets.filter((t) => t.status === "closed").length;
    return { total, open, closed };
  }, [tickets]);

  const getStatusColor = (status: Ticket["status"]) => {
    switch (status) {
      case "open":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "in_progress":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      case "closed":
        return "bg-slate-500/10 text-slate-400 border-slate-500/30";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/30";
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Sol Kenar Çubuğu: Gelen Kutusu & Filtreler */}
      <aside className="w-80 md:w-[420px] border-r border-slate-800 flex flex-col bg-slate-900/40 backdrop-blur-md">
        {/* Üst Logo & Navigasyon */}
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center font-bold text-xs shadow-md shadow-purple-900/40">
                Ω
              </div>
              <div>
                <h1 className="font-bold text-sm tracking-tight text-white">OmniResolve Agent</h1>
                <p className="text-[10px] text-slate-400">Fortune 500 Support Tier</p>
              </div>
            </div>
            <div className="flex items-center space-x-1.5">
              <button
                onClick={loadTickets}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                title="Listeyi Yenile"
              >
                ⟳
              </button>
              <Link
                href="/"
                className="text-xs px-2.5 py-1 rounded-lg bg-blue-600/20 text-blue-300 border border-blue-500/30 hover:bg-blue-600/30 transition flex items-center space-x-1"
                title="Müşteri Portalı"
              >
                <span>+ Yeni</span>
              </Link>
            </div>
          </div>

          {/* İstatistik Özet Şeridi */}
          <div className="grid grid-cols-3 gap-2 py-2 px-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center mb-3">
            <div>
              <span className="block text-[10px] text-slate-500 uppercase font-semibold">Toplam</span>
              <span className="text-sm font-bold text-slate-200">{stats.total}</span>
            </div>
            <div>
              <span className="block text-[10px] text-emerald-400 uppercase font-semibold">Açık</span>
              <span className="text-sm font-bold text-emerald-400">{stats.open}</span>
            </div>
            <div>
              <span className="block text-[10px] text-purple-400 uppercase font-semibold">Çözülen</span>
              <span className="text-sm font-bold text-purple-400">{stats.closed}</span>
            </div>
          </div>

          {/* Arama Kutusu */}
          <div className="relative mb-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Biletlerde ara (başlık, mesaj)..."
              className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition"
            />
          </div>

          {/* Durum Filtre Sekmeleri */}
          <div className="flex space-x-1 text-[11px]">
            {[
              { id: "all", label: "Tümü" },
              { id: "open", label: "Açık" },
              { id: "in_progress", label: "İşlemde" },
              { id: "closed", label: "Çözüldü" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`flex-1 py-1 rounded-md transition text-center font-medium ${
                  statusFilter === tab.id
                    ? "bg-purple-600/30 text-purple-300 border border-purple-500/40"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bilet Listesi */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/50">
          {loading ? (
            <div className="p-8 text-xs text-center text-slate-500 animate-pulse">Biletler alınıyor...</div>
          ) : filteredTickets.length === 0 ? (
            <div className="p-8 text-xs text-center text-slate-500">Kriterlere uygun bilet bulunamadı.</div>
          ) : (
            filteredTickets.map((t) => {
              const active = selectedTicket?.id === t.id;
              const meta = getTicketMeta(t);
              return (
                <div
                  key={t.id}
                  onClick={() => selectTicket(t)}
                  className={`p-3.5 cursor-pointer transition relative ${
                    active
                      ? "bg-purple-950/40 border-l-4 border-purple-500"
                      : "hover:bg-slate-800/30"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[11px] font-mono text-slate-500">#{t.id}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded border font-medium ${meta.priority.color}`}>
                        {meta.priority.label}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded border font-medium ${meta.category.color}`}>
                        {meta.category.icon} {meta.category.label}
                      </span>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border uppercase tracking-wider font-semibold ${getStatusColor(t.status)}`}>
                      {t.status}
                    </span>
                  </div>

                  <h3 className="text-xs font-semibold text-slate-100 line-clamp-1">{t.title}</h3>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">{t.description}</p>

                  {t.ai_suggested_action && (
                    <div className="mt-2 flex items-center space-x-1 text-[10px] text-purple-300 bg-purple-950/60 border border-purple-800/40 px-2 py-1 rounded-md font-mono">
                      <span>⚡</span>
                      <span className="truncate">{t.ai_suggested_action}</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* Sağ Ana Bölüm: Bilet Detayı & AI-Native Usable Pass */}
      <main className="flex-1 flex flex-col bg-slate-950 overflow-y-auto p-6 lg:p-8">
        {selectedTicket ? (
          <div className="max-w-4xl w-full mx-auto space-y-6">
            {/* Başlık ve Durum Aksiyon Butonları */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center space-x-3 mb-1">
                  <h2 className="text-xl font-bold text-slate-100">{selectedTicket.title}</h2>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full border uppercase font-medium ${getStatusColor(selectedTicket.status)}`}>
                    {selectedTicket.status}
                  </span>
                </div>
                <div className="flex items-center space-x-3 text-xs text-slate-500">
                  <span>Bilet ID: #{selectedTicket.id}</span>
                  <span>•</span>
                  <span>Kayıt Tarihi: {new Date(selectedTicket.created_at).toLocaleString("tr-TR")}</span>
                </div>
              </div>

              {/* Durum Değiştirme Butonları */}
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleUpdate("open")}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition ${
                    selectedTicket.status === "open"
                      ? "bg-emerald-950/60 border-emerald-500/50 text-emerald-300"
                      : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
                  }`}
                >
                  Açık
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdate("in_progress")}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition ${
                    selectedTicket.status === "in_progress"
                      ? "bg-amber-950/60 border-amber-500/50 text-amber-300"
                      : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
                  }`}
                >
                  İşleniyor
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdate("closed")}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition ${
                    selectedTicket.status === "closed"
                      ? "bg-purple-950/60 border-purple-500/50 text-purple-300"
                      : "bg-slate-800 hover:bg-slate-700 text-slate-400 border-slate-700"
                  }`}
                >
                  Kapatıldı
                </button>
              </div>
            </div>

            {/* Müşteri Orijinal Mesajı */}
            <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs uppercase tracking-wider text-slate-400 font-semibold flex items-center space-x-2">
                  <span>👤 Müşteri Talebi</span>
                </h4>
                <span className="text-[11px] text-slate-500 font-mono">Inbound Message</span>
              </div>
              <p className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
                {selectedTicket.description}
              </p>
            </section>

            {/* AI-NATIVE KATMAN: USABLE PASS (KULLANILABİLİR PAS) */}
            <section className="bg-gradient-to-br from-purple-950/40 via-slate-900/90 to-purple-900/20 border-2 border-purple-500/40 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2.5">
                  <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-white tracking-wide">
                      🤖 AI-Native Katman: Kullanılabilir Pas (Usable Pass)
                    </h3>
                    <p className="text-[11px] text-purple-300/80">
                      Ajan bir sonraki adımı öngördü, operasyonel aksiyonu ve yanıtı hazırladı.
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-purple-900/50 text-purple-300 border border-purple-700/50">
                  Zero-Friction
                </span>
              </div>

              {/* Önerilen Aksiyon Rozeti */}
              {selectedTicket.ai_suggested_action && (
                <div className="mb-4 p-3.5 rounded-xl bg-purple-950/80 border border-purple-500/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider block">
                      Öngörülen Sistem Aksiyonu:
                    </span>
                    <span className="text-sm font-semibold text-white">
                      ⚡ {selectedTicket.ai_suggested_action}
                    </span>
                  </div>

                  <button
                    type="button"
                    disabled={saving}
                    onClick={handleConfirmAction}
                    className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-95 text-white font-bold text-xs shadow-lg shadow-purple-900/60 transition transform disabled:opacity-50"
                  >
                    {saving ? "İşleniyor..." : "⚡ Pası Gole Çevir (Onayla & Kapat)"}
                  </button>
                </div>
              )}

              {/* Düzenlenebilir Yanıt Taslağı */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="ai_draft_reply" className="text-xs font-semibold text-slate-300">
                    Müşteriye İletilecek Yanıt Taslağı (Doğrudan Düzenlenebilir)
                  </label>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {draftReply.length} karakter
                  </span>
                </div>
                <textarea
                  id="ai_draft_reply"
                  rows={5}
                  value={draftReply}
                  onChange={(e) => setDraftReply(e.target.value)}
                  placeholder="AI yanıt taslağı bekleniyor..."
                  className="w-full bg-slate-950/90 border border-purple-500/30 rounded-xl p-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-400 transition resize-y leading-relaxed"
                />
              </div>

              {/* Alt Butonlar ve Geri Bildirim */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(draftReply);
                      setFeedback("Taslak panoya kopyalandı!");
                    }}
                    className="text-xs px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                  >
                    Panoya Kopyala
                  </button>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => handleUpdate()}
                    className="text-xs px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-100 font-medium disabled:opacity-50 transition"
                  >
                    {saving ? "Kaydediliyor..." : "Taslağı Kaydet"}
                  </button>
                </div>

                <div className="text-xs text-slate-400">
                  Ortalama Süre Tasarrufu: <span className="font-semibold text-emerald-400">%94</span>
                </div>
              </div>

              {feedback && (
                <div className="mt-3.5 p-3 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-medium flex items-center space-x-2">
                  <span>✓</span>
                  <span>{feedback}</span>
                </div>
              )}
            </section>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-500">
            <div className="text-3xl mb-2">📋</div>
            <p className="text-sm">İncelemek ve aksiyon almak için sol menüden bir bilet seçin.</p>
          </div>
        )}
      </main>
    </div>
  );
}
