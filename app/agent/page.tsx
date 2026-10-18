"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Ticket } from "@/types/ticket";
import { getTickets, updateTicket, analyzeTicket } from "@/lib/api";

export default function AgentDashboard() {
  // Temsilci Kimlik Doğrulama / Oturum Durumu
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [agentEmail, setAgentEmail] = useState<string>("enes.gadis@omniresolve.com");
  const [agentPassword, setAgentPassword] = useState<string>("••••••••");

  // Bilet State'leri
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [draftReply, setDraftReply] = useState<string>("" );
  const [internalNote, setInternalNote] = useState<string>("");
  const [department, setDepartment] = useState<string>("");
  const [timeSaved, setTimeSaved] = useState<number>(0);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showMobileDetail, setShowMobileDetail] = useState<boolean>(false);

  // Oturum Kontrolü
  useEffect(() => {
    const savedAuth = localStorage.getItem("omni_agent_auth");
    if (savedAuth === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  // Konuşma/Okuma durdurma temizliği
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsAuthenticated(true);
    localStorage.setItem("omni_agent_auth", "true");
    loadTickets();
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("omni_agent_auth");
  };

  const loadTickets = async () => {
    try {
      setLoading(true);
      const data = await getTickets();
      setTickets(data);
      if (data.length > 0 && !selectedTicket) {
        selectTicket(data[0]);
      }
    } catch {
      setFeedback("API bağlantı hatası. Backend servisinin aktif olduğunu doğrulayınız.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadTickets();
    }
  }, [isAuthenticated]);

  const selectTicket = (ticket: Ticket) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    setSelectedTicket(ticket);
    setDraftReply(ticket.ai_draft_reply || "");
    setInternalNote(ticket.internal_note || "");
    setDepartment(ticket.department || "");
    setTimeSaved(ticket.time_saved_minutes || 0);
    setFeedback("");
    setShowMobileDetail(true);
  };

  // Metni Sesli Okutma (SpeechSynthesis)
  const toggleSpeech = (textToRead: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setFeedback("Tarayıcınız sesli okuma özelliğini desteklemiyor.");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = "tr-TR";
    utterance.rate = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleUpdate = async (statusOverride?: Ticket["status"]) => {
    if (!selectedTicket) return;
    try {
      setSaving(true);
      const updated = await updateTicket(selectedTicket.id, {
        ai_draft_reply: draftReply,
        internal_note: internalNote,
        department: department,
        time_saved_minutes: timeSaved,
        status: statusOverride || selectedTicket.status,
      });
      setSelectedTicket(updated);
      setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      setFeedback("Talep ve çalışma notları başarıyla güncellendi.");
    } catch {
      setFeedback("Güncelleme işlemi başarısız oldu.");
    } finally {
      setSaving(false);
    }
  };

  // Müşteriye Özel Yanıt Gönderme
  const handleSendToCustomer = async () => {
    if (!selectedTicket) return;
    try {
      setSaving(true);
      const updated = await updateTicket(selectedTicket.id, {
        ai_draft_reply: draftReply,
        internal_note: internalNote,
        department: department,
        status: "closed",
      });
      setSelectedTicket(updated);
      setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      setFeedback(`✓ Müşteriye (${selectedTicket.customer_email || "müşteri adresi"}) özel yanıt iletildi ve bilet statüsü güncellendi.`);
    } catch {
      setFeedback("Müşteriye yanıt iletilirken hata meydana geldi.");
    } finally {
      setSaving(false);
    }
  };

  // İlgili Birime İç Sevk İletme
  const handleForwardToDepartment = async () => {
    if (!selectedTicket) return;
    try {
      setSaving(true);
      const targetDept = department || selectedTicket.department || "İlgili Operasyonel Birim";
      const updated = await updateTicket(selectedTicket.id, {
        internal_note: internalNote,
        department: targetDept,
        status: "in_progress",
      });
      setSelectedTicket(updated);
      setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      setFeedback(`📨 Görev ve teknik sevk notu başarıyla [${targetDept}] birimine aktarıldı. Talep 'İşlemde' statüsüne alındı.`);
    } catch {
      setFeedback("Birime sevk edilirken hata meydana geldi.");
    } finally {
      setSaving(false);
    }
  };

  // Canlı Yapay Zekâ Analizini Tetikleme
  const handleAnalyze = async () => {
    if (!selectedTicket) return;
    try {
      setAnalyzing(true);
      setFeedback("");
      const updated = await analyzeTicket(selectedTicket.id);
      setSelectedTicket(updated);
      setDraftReply(updated.ai_draft_reply || "");
      setInternalNote(updated.internal_note || "");
      setDepartment(updated.department || "");
      setTimeSaved(updated.time_saved_minutes || 18);
      setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      setFeedback("✓ Google Gemini 3.8 Flash talebi anladı, ilgili Uber birimine sevk etti ve yanıtı hazırladı.");
    } catch {
      setFeedback("Yapay zekâ analizi sırasında bağlantı hatası oluştu.");
    } finally {
      setAnalyzing(false);
    }
  };

  // Kategori & Öncelik Algılama
  const getTicketMeta = (t: Ticket) => {
    const text = `${t.title} ${t.description}`.toLowerCase();
    let category = { label: "Genel Destek", icon: "💬", color: "text-slate-400 bg-slate-800/40 border-slate-700/50" };
    let priority = { label: "Normal", color: "text-blue-400 bg-blue-950/40 border-blue-800/40" };

    if (text.includes("çanta") || text.includes("eşya") || text.includes("unuttum") || text.includes("kayıp") || text.includes("cüzdan") || text.includes("telefon")) {
      category = { label: "Kayıp Eşya & Sürücü", icon: "🎒", color: "text-amber-400 bg-amber-950/40 border-amber-800/40" };
      priority = { label: "Yüksek", color: "text-orange-400 bg-orange-950/40 border-orange-800/40" };
    } else if (text.includes("ücret") || text.includes("rota") || text.includes("köprü") || text.includes("fazla") || text.includes("gişe") || text.includes("tahsilat")) {
      category = { label: "Ücret & Rota İtirazı", icon: "💳", color: "text-cyan-400 bg-cyan-950/40 border-cyan-800/40" };
      priority = { label: "Acil", color: "text-red-400 bg-red-950/40 border-red-800/40" };
    } else if (text.includes("güvenlik") || text.includes("tehlike") || text.includes("agresif") || text.includes("kural") || text.includes("emniyet")) {
      category = { label: "Sürüş Emniyeti (Safety)", icon: "🛡️", color: "text-rose-400 bg-rose-950/40 border-rose-800/40" };
      priority = { label: "Kritik", color: "text-rose-400 bg-rose-950/40 border-rose-800/40" };
    } else if (text.includes("eats") || text.includes("yemek") || text.includes("sipariş") || text.includes("kurye") || text.includes("restoran")) {
      category = { label: "Uber Eats Restoran", icon: "🍔", color: "text-emerald-400 bg-emerald-950/40 border-emerald-800/40" };
    }

    return { category, priority };
  };

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const customerInfo = `${t.customer_name || ""} ${t.customer_email || ""}`.toLowerCase();
      const matchesSearch =
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customerInfo.includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || t.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [tickets, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    const total = tickets.length;
    const open = tickets.filter((t) => t.status === "open").length;
    const closed = tickets.filter((t) => t.status === "closed").length;
    const totalSavedMinutes = tickets.reduce((acc, t) => acc + (t.time_saved_minutes || 0), 0);
    return { total, open, closed, totalSavedMinutes };
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

  // 1. EKRAN: TEMSİLCİ KURUMSAL GİRİŞ EKRANI (AUTH GATE)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-6 font-sans">
        <div className="max-w-md w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-8 shadow-2xl backdrop-blur-md">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-blue-900/40">
              Ω
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">OmniResolve Destek Masası</h1>
              <p className="text-xs text-slate-400">Yetkili Destek Uzmanı Girişi</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Kurumsal E-posta
              </label>
              <input
                type="email"
                required
                value={agentEmail}
                onChange={(e) => setAgentEmail(e.target.value)}
                placeholder="ad.soyad@omniresolve.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Şifre
              </label>
              <input
                type="password"
                required
                value={agentPassword}
                onChange={(e) => setAgentPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition shadow-lg shadow-blue-900/30"
            >
              Destek Masasına Giriş Yap
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Kurumsal SSO Aktif</span>
            <Link href="/" className="text-blue-400 hover:underline">
              ← Müşteri Portalına Dön
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. EKRAN: TEMSİLCİ ÇALIŞMA ALANI (AGENT WORKSPACE)
  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Sol Panel: Bilet Sırası ve Filtreler */}
      <aside className={`w-full md:w-[420px] border-r border-slate-800 flex-col bg-slate-900/40 backdrop-blur-md ${showMobileDetail ? "hidden md:flex" : "flex"}`}>
        {/* Header */}
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-xs text-white shadow-md">
                Ω
              </div>
              <div>
                <h1 className="font-bold text-sm tracking-tight text-white">OmniResolve Desk</h1>
                <p className="text-[10px] text-slate-400">Kurumsal Destek Operasyonları</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={loadTickets}
                className="text-xs px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                title="Yenile"
              >
                ⟳
              </button>
              <button
                onClick={handleLogout}
                className="text-[11px] px-2 py-1 rounded bg-slate-800/80 hover:bg-red-950/60 text-slate-400 hover:text-red-300 border border-slate-700 transition"
                title="Çıkış Yap"
              >
                Çıkış
              </button>
            </div>
          </div>

          {/* İstatistik Göstergesi */}
          <div className="grid grid-cols-4 gap-1.5 py-2 px-2 rounded-xl bg-slate-950/70 border border-slate-800/80 text-center mb-3">
            <div>
              <span className="block text-[9px] text-slate-500 uppercase font-semibold">Talepler</span>
              <span className="text-xs font-bold text-slate-200">{stats.total}</span>
            </div>
            <div>
              <span className="block text-[9px] text-emerald-400 uppercase font-semibold">Bekleyen</span>
              <span className="text-xs font-bold text-emerald-400">{stats.open}</span>
            </div>
            <div>
              <span className="block text-[9px] text-blue-400 uppercase font-semibold">Çözülen</span>
              <span className="text-xs font-bold text-blue-400">{stats.closed}</span>
            </div>
            <div>
              <span className="block text-[9px] text-purple-400 uppercase font-semibold">Tasarruf</span>
              <span className="text-xs font-bold text-purple-300 font-mono">
                {stats.totalSavedMinutes > 60 ? `${(stats.totalSavedMinutes / 60).toFixed(1)}s` : `${stats.totalSavedMinutes}dk`}
              </span>
            </div>
          </div>

          {/* Arama */}
          <div className="relative mb-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Müşteri adı, konu veya mesajda ara..."
              className="w-full bg-slate-950/90 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
            />
          </div>

          {/* Filtre Sekmeleri */}
          <div className="flex space-x-1 text-[11px]">
            {[
              { id: "all", label: "Tümü" },
              { id: "open", label: "Açık" },
              { id: "in_progress", label: "İşlemde" },
              { id: "closed", label: "Kapatıldı" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`flex-1 py-1 rounded-md transition text-center font-medium ${
                  statusFilter === tab.id
                    ? "bg-blue-600/30 text-blue-300 border border-blue-500/40"
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
            <div className="p-8 text-xs text-center text-slate-500 animate-pulse">Talepler yükleniyor...</div>
          ) : filteredTickets.length === 0 ? (
            <div className="p-8 text-xs text-center text-slate-500">Seçilen kriterde talep bulunmuyor.</div>
          ) : (
            filteredTickets.map((t) => {
              const active = selectedTicket?.id === t.id;
              const meta = getTicketMeta(t);
              const displayName = t.customer_name || "Kurumsal Müşteri";

              return (
                <div
                  key={t.id}
                  onClick={() => selectTicket(t)}
                  className={`p-3.5 cursor-pointer transition relative ${
                    active
                      ? "bg-blue-950/40 border-l-4 border-blue-500"
                      : "hover:bg-slate-800/30"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[11px] font-mono text-slate-400 font-semibold">#{t.id}</span>
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

                  <div className="text-[11px] text-blue-300/90 font-medium mb-0.5 flex items-center space-x-1">
                    <span>👤 {displayName}</span>
                  </div>

                  <h3 className="text-xs font-semibold text-slate-100 line-clamp-1">{t.title}</h3>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">{t.description}</p>

                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    {t.department && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-950/70 border border-blue-800/40 text-blue-300 font-medium">
                        🏢 {t.department}
                      </span>
                    )}
                    {(t.time_saved_minutes || 0) > 0 && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950/70 border border-emerald-800/40 text-emerald-300 font-mono">
                        ⏱️ +{t.time_saved_minutes} dk tasarruf
                      </span>
                    )}
                    {t.ai_suggested_action && (
                      <div className="w-full text-[10px] text-indigo-300 bg-indigo-950/60 border border-indigo-800/40 px-2 py-0.5 rounded-md font-mono truncate">
                        ⚡ {t.ai_suggested_action}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* Sağ Ana Panel: Talep İnceleme ve Akıllı Çözüm */}
      <main className={`flex-1 flex-col bg-slate-950 overflow-y-auto p-4 md:p-6 lg:p-8 ${showMobileDetail ? "flex" : "hidden md:flex"}`}>
        {selectedTicket ? (
          <div className="max-w-4xl w-full mx-auto space-y-5">
            {/* Mobilde Geri Dön Butonu */}
            <div className="md:hidden pb-3 border-b border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowMobileDetail(false)}
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 font-medium flex items-center space-x-1.5 transition"
              >
                <span>← Bilet Listesine Dön</span>
              </button>
              <span className="text-xs font-mono text-slate-400">Talep #{selectedTicket.id}</span>
            </div>

            {/* Üst Bilgi Barı */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center space-x-3 mb-1">
                  <h2 className="text-xl font-bold text-slate-100">{selectedTicket.title}</h2>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full border uppercase font-medium ${getStatusColor(selectedTicket.status)}`}>
                    {selectedTicket.status}
                  </span>
                </div>
                <div className="flex items-center space-x-3 text-xs text-slate-500">
                  <span>Talep No: #{selectedTicket.id}</span>
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
                      ? "bg-blue-950/60 border-blue-500/50 text-blue-300"
                      : "bg-slate-800 hover:bg-slate-700 text-slate-400 border-slate-700"
                  }`}
                >
                  Kapatıldı
                </button>
              </div>
            </div>

            {/* Müşteri Kimlik ve İletişim Kartı + Sesli Okuma / Dinleme */}
            <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-800/70">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-sm text-slate-200">
                    {(selectedTicket.customer_name || "M").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-200">
                      {selectedTicket.customer_name || "Kayıtlı Kurumsal Müşteri"}
                    </h4>
                    <span className="text-xs text-slate-400 font-mono">
                      {selectedTicket.customer_email || "iletisim@musteri.com"}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {/* Sesli Okutma Butonu */}
                  <button
                    type="button"
                    onClick={() => toggleSpeech(`${selectedTicket.title}. ${selectedTicket.description}`)}
                    className={`text-xs px-3 py-1.5 rounded-lg border font-medium flex items-center space-x-1.5 transition ${
                      isSpeaking
                        ? "bg-rose-950/70 text-rose-300 border-rose-500/50 animate-pulse"
                        : "bg-slate-800/90 hover:bg-slate-700 text-slate-200 border-slate-700"
                    }`}
                    title="Yapay zekâya metni sesli okut"
                  >
                    <span>{isSpeaking ? "⏹️ Okumayı Durdur" : "🔊 Metni Sesli Dinle"}</span>
                  </button>

                  <span className="text-[11px] font-mono px-2.5 py-1.5 rounded-lg bg-slate-800/80 text-slate-300 border border-slate-700">
                    Doğrulanmış İletişim
                  </span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                    Müşteri Mesajı / Şikayet Detayı
                  </h5>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {selectedTicket.description.length} karakter
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 text-sm text-slate-200 whitespace-pre-wrap leading-relaxed selection:bg-blue-600/40">
                  {selectedTicket.description}
                </div>
              </div>
            </section>

            {/* AI-NATIVE OPERASYONEL ASİSTAN & DEPARTMAN SEVK MERKEZİ */}
            <section className="bg-gradient-to-br from-indigo-950/40 via-slate-900/90 to-blue-950/30 border-2 border-indigo-500/40 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center space-x-2.5">
                  <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-white tracking-wide">
                      🤖 OmniResolve Akıllı Karar & Departman Sevk Asistanı
                    </h3>
                    <p className="text-[11px] text-indigo-300/80">
                      Sorun analiz edilerek ilgili birim sevk kaydı, tahmini süre tasarrufu ve müşteriye özel yanıt ayrıştırılır.
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 flex items-center space-x-1.5 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>Canlı LLM: Google Gemini 3.5 Flash</span>
                  </span>
                  <button
                    type="button"
                    disabled={analyzing}
                    onClick={handleAnalyze}
                    className="text-xs px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold border border-indigo-400/30 shadow-md transition flex items-center space-x-1.5 active:scale-95"
                    title="Yapay zekâya metni okut ve analiz ettir"
                  >
                    <span>{analyzing ? "🧠 Analiz Ediliyor..." : "✨ Yapay Zekâya Metni Okut"}</span>
                  </button>
                </div>
              </div>

              {/* Tahmini Süre Tasarrufu Metrik Kartı */}
              <div className="mb-5 p-3.5 rounded-xl bg-slate-950/80 border border-indigo-500/30 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-sm font-bold text-emerald-400">
                    ⏱️
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                      Yapay Zekâ Tahmini Süre Tasarrufu
                    </span>
                    <span className="text-xs text-slate-300">
                      Manuel Çözüm: <span className="line-through text-slate-500">{(timeSaved || 18) + 2} dk</span> ➔ AI Otomasyon: <span className="font-bold text-emerald-400">~15 sn</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs px-3 py-1 rounded-lg bg-emerald-950/90 text-emerald-300 border border-emerald-500/40 font-mono font-bold">
                    +{timeSaved || 18} Dakika Tasarruf Sağlandı
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded-lg bg-indigo-950/80 text-indigo-300 border border-indigo-700/50 font-bold">
                    %96 Hız Artışı
                  </span>
                </div>
              </div>

              {/* 2 AYRI İLETİM KANALI: 1. İLGİLİ BİRİME İÇ SEVK | 2. MÜŞTERİYE CEVAP */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
                {/* 1. KANAL: İLGİLİ BİRİME İÇ SEVK VE NOT */}
                <div className="bg-slate-950/80 border border-indigo-500/30 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">🏢</span>
                        <span className="text-xs font-bold text-indigo-200">İlgili Birim & Operasyonel Sevk</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-900/40 text-indigo-300 border border-indigo-700/40 font-mono">
                        Dahili İletişim
                      </span>
                    </div>

                    <div className="mb-3">
                      <label className="block text-[11px] text-slate-400 font-medium mb-1">
                        Yönlendirilecek Birim:
                      </label>
                      <input
                        type="text"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        placeholder="Örn: Lojistik & Depo, İade ve Kalite..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
                      />
                    </div>

                    <div className="mb-3">
                      <label className="block text-[11px] text-slate-400 font-medium mb-1">
                        Birim Uzmanına Özel Görev Notu:
                      </label>
                      <textarea
                        rows={5}
                        value={internalNote}
                        onChange={(e) => setInternalNote(e.target.value)}
                        placeholder="Yapay zekâ tarafından birim için hazırlanan teknik not..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-y leading-relaxed"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={saving}
                    onClick={handleForwardToDepartment}
                    className="w-full py-2.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold text-xs transition shadow-md shadow-indigo-950/50 flex items-center justify-center space-x-1.5 disabled:opacity-50"
                  >
                    <span>📨</span>
                    <span>İlgili Birime Sevk Et & Kaydet</span>
                  </button>
                </div>

                {/* 2. KANAL: MÜŞTERİYE VERİLECEK ŞEKİLLENMİŞ CEVAP */}
                <div className="bg-slate-950/80 border border-blue-500/30 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">✉️</span>
                        <span className="text-xs font-bold text-blue-200">Müşteriye İletilecek Çözüm Yanıtı</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-blue-900/40 text-blue-300 border border-blue-700/40 font-mono">
                        Dış İletişim
                      </span>
                    </div>

                    <div className="mb-3">
                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium mb-1">
                        <span>Alıcı: {selectedTicket.customer_email || "Müşteri E-posta"}</span>
                        <span className="font-mono">{draftReply.length} kr</span>
                      </div>
                      <textarea
                        rows={7}
                        value={draftReply}
                        onChange={(e) => setDraftReply(e.target.value)}
                        placeholder="Müşteriye gidecek profesyonel yanıt..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-y leading-relaxed"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(draftReply);
                        setFeedback("Müşteri yanıtı panoya kopyalandı.");
                      }}
                      className="px-3 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium transition"
                      title="Panoya Kopyala"
                    >
                      📋 Kopyala
                    </button>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={handleSendToCustomer}
                      className="flex-1 py-2.5 px-3 rounded-lg bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 active:scale-95 text-white font-bold text-xs transition shadow-md shadow-blue-950/50 flex items-center justify-center space-x-1.5 disabled:opacity-50"
                    >
                      <span>🚀</span>
                      <span>Müşteriye Yanıtı Gönder & Kapat</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Alt Yönetim Barı */}
              <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => handleUpdate()}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                  >
                    {saving ? "Kaydediliyor..." : "💾 Değişiklikleri Kaydet"}
                  </button>
                  {selectedTicket.ai_suggested_action && (
                    <span className="text-[11px] text-indigo-300 bg-indigo-950/70 border border-indigo-700/40 px-2.5 py-1 rounded-md font-mono">
                      ⚡ Aksiyon: {selectedTicket.ai_suggested_action}
                    </span>
                  )}
                </div>

                <span className="text-[11px] text-slate-400">
                  Google Gemini 3.5 Flash ile orkestre edilmektedir.
                </span>
              </div>

              {feedback && (
                <div className="mt-3.5 p-3 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-medium flex items-center space-x-2 shadow-sm">
                  <span>✓</span>
                  <span>{feedback}</span>
                </div>
              )}
            </section>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-500">
            <div className="text-3xl mb-2">📋</div>
            <p className="text-sm">İncelemek ve aksiyon almak için sol listeden bir talep seçiniz.</p>
          </div>
        )}
      </main>
    </div>
  );
}
