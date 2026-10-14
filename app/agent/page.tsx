"use client";

import { useEffect, useState } from "react";
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

  const loadTickets = async () => {
    try {
      setLoading(true);
      const data = await getTickets();
      setTickets(data);
      if (data.length > 0 && !selectedTicket) {
        selectTicket(data[0]);
      }
    } catch {
      setFeedback("API bağlantı hatası. Rails sunucusunu (port 3000) kontrol edin.");
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
      setFeedback(`Aksiyon (${selectedTicket.ai_suggested_action}) başarıyla onaylandı ve bilet kapatıldı.`);
    } catch {
      setFeedback("Aksiyon onaylanırken hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

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
    <div className="flex h-screen w-full bg-slate-950 text-slate-100 overflow-hidden">
      <aside className="w-80 md:w-96 border-r border-slate-800 flex flex-col bg-slate-900/30">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse" />
            <h1 className="font-semibold text-sm tracking-wide uppercase text-slate-200">Gelen Kutusu</h1>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={loadTickets}
              className="text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              Yenile
            </button>
            <Link
              href="/"
              className="text-xs px-2 py-1 text-slate-400 hover:text-slate-200"
              title="Portal"
            >
              Portal ↗
            </Link>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
          {loading ? (
            <div className="p-6 text-xs text-center text-slate-500">Biletler alınıyor...</div>
          ) : tickets.length === 0 ? (
            <div className="p-6 text-xs text-center text-slate-500">Henüz açık bilet yok.</div>
          ) : (
            tickets.map((t) => {
              const active = selectedTicket?.id === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => selectTicket(t)}
                  className={`p-4 cursor-pointer transition ${
                    active
                      ? "bg-purple-950/30 border-l-4 border-purple-500"
                      : "hover:bg-slate-800/30"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-mono text-slate-400">#{t.id}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border uppercase tracking-wider ${getStatusColor(t.status)}`}>
                      {t.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-medium text-slate-200 line-clamp-1">{t.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1">{t.description}</p>
                  {t.ai_suggested_action && (
                    <span className="mt-2 inline-block text-[10px] font-medium text-purple-300 bg-purple-950/60 border border-purple-800/40 px-2 py-0.5 rounded">
                      ⚡ {t.ai_suggested_action}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </aside>

      <main className="flex-1 flex flex-col bg-slate-950 overflow-y-auto p-6 lg:p-8">
        {selectedTicket ? (
          <div className="max-w-4xl w-full mx-auto space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center space-x-3 mb-1">
                  <h2 className="text-xl font-bold text-slate-100">{selectedTicket.title}</h2>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full border uppercase ${getStatusColor(selectedTicket.status)}`}>
                    {selectedTicket.status}
                  </span>
                </div>
                <span className="text-xs text-slate-500">
                  Kayıt Tarihi: {new Date(selectedTicket.created_at).toLocaleString("tr-TR")}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleUpdate("open")}
                  className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Açık
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdate("in_progress")}
                  className="text-xs px-3 py-1.5 rounded-lg bg-amber-950/40 border border-amber-800/40 text-amber-300 hover:bg-amber-900/40"
                >
                  İşleniyor
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdate("closed")}
                  className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400"
                >
                  Kapat
                </button>
              </div>
            </div>

            <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
              <h4 className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">
                Müşteri Orijinal Mesajı
              </h4>
              <p className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
                {selectedTicket.description}
              </p>
            </section>

            <section className="bg-gradient-to-br from-purple-950/50 via-slate-900/80 to-purple-900/30 border-2 border-purple-500/50 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-bold text-purple-200 tracking-wide">
                    🤖 AI Önerilen Çözüm (Usable Pass)
                  </h3>
                </div>
                <span className="text-xs text-purple-300/80">Doğrudan Düzenlenebilir</span>
              </div>

              <textarea
                id="ai_draft_reply"
                rows={7}
                value={draftReply}
                onChange={(e) => setDraftReply(e.target.value)}
                placeholder="AI yanıtı bekleniyor..."
                className="w-full bg-slate-950/80 border border-purple-500/30 rounded-xl p-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition resize-y font-normal leading-relaxed"
              />

              <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <button
                  type="button"
                  disabled={saving || !selectedTicket.ai_suggested_action}
                  onClick={handleConfirmAction}
                  className="w-full sm:w-auto py-3 px-6 rounded-xl bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white font-bold text-sm shadow-lg shadow-purple-900/50 transition transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ⚡ Aksiyonu Onayla: {selectedTicket.ai_suggested_action || "Genel İnceleme"}
                </button>

                <div className="flex items-center space-x-2 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(draftReply);
                      setFeedback("Taslak panoya kopyalandı!");
                    }}
                    className="text-xs px-3.5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                  >
                    Kopyala
                  </button>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => handleUpdate()}
                    className="text-xs px-4 py-2.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-100 font-medium disabled:opacity-50"
                  >
                    {saving ? "Kaydediliyor..." : "Taslağı Kaydet"}
                  </button>
                </div>
              </div>

              {feedback && (
                <div className="mt-3 text-xs text-purple-300 font-medium">
                  {feedback}
                </div>
              )}
            </section>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-sm text-slate-500">
            Detayları görüntülemek için gelen kutusundan bir bilet seçin.
          </div>
        )}
      </main>
    </div>
  );
}
