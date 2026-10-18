# OmniResolve — AI-Native Customer Operations Platform

> **Fortune 500 Ölçeğinde SaaS Klonu ve AI-Native Değer Akışı**  
> Hibrit Zekâ (İnsan + Ajan) ile Sıfırdan Üretim Projesi

---

## 🔗 Canlı Dağıtım ve Kaynak Kod Bağlantıları

* **Canlı Kullanıcı & Ajan Arayüzü (Next.js - Vercel):** [https://saas-frontend-smoky.vercel.app](https://saas-frontend-smoky.vercel.app)
* **Canlı API Uç Noktası (Ruby on Rails 8 API - Render):** [https://saas-backend-ojxb.onrender.com](https://saas-backend-ojxb.onrender.com)
* **Frontend GitHub Deposu:** [https://github.com/enesgadis/saas-frontend](https://github.com/enesgadis/saas-frontend)
* **Backend GitHub Deposu:** [https://github.com/enesgadis/saas-backend](https://github.com/enesgadis/saas-backend)

---

## 1. Seçilen Fortune 500 Firması, SaaS ve Kanıt Linki

* **Fortune 500 Firması:** **Uber Technologies, Inc.** (Fortune 500 Sıralaması: #141)
* **Hedeflenen / Klonlanan SaaS Ürünü:** **Zendesk** (Zendesk Suite Enterprise / Support Cloud)
* **Resmi Kanıt Linki (Case Study):**  
  👉 [Zendesk Resmi Müşteri Başarı Hikayesi: Uber](https://www.zendesk.com/customer/uber/)  
  *(Özet: Uber, küresel çapta milyonlarca sürücü ve yolcunun destek operasyonlarını yönetmek için ana destek omurgası olarak Zendesk altyapısını kullanmaktadır.)*

### Firmanın Tahmini Yıllık SaaS Maliyeti
* **Kullanıcı Sayısı:** ~3.000 aktif müşteri destek temsilcisi ve operasyon personeli.
* **Lisans Bedeli (Zendesk Enterprise):** $115 / koltuk / ay.
* **Yıllık Lisans Faturası:**  
  $$3.000 \text{ kullanıcı} \times \$115 \times 12 \text{ ay} = \mathbf{\$4.140.000 / \text{yıl}}$$
* *(Ek eklenti, yapay zeka addon ve entegrasyon maliyetleriyle birlikte toplam yıllık harcama **$5M+** mertebesindedir.)*

---

## 2. Klonlanan 3+ Temel Değer Akışı (End-to-End Workflows)

OmniResolve, Zendesk'in yüzlerce karmaşık menüsü yerine destek operasyonlarında her gün tekrarlanan en kritik 3 temel iş akışını uçtan uca otonom hale getirmiştir:

1. **İş Akışı 1: Akıllı Talep Girişi (Customer Ingestion & Smart Triage)**
   - Müşteri, modern self-service portalından (`/`) destek biletini açar.
   - Hızlı Uber demo şablonları (*Araçta Eşya Unutuldu, Fazla Ücret & Rota Uyuşmazlığı, Uber Eats Eksik Sipariş, Sürüş Emniyeti*) veya serbest metin ile talep girilir.
   - Talep girdiği an arka planda Rails API üzerinde çalışan **Google Gemini 3.8 Flash** modeli talebi doğrudan kendi bağlamında analiz eder.

2. **İş Akışı 2: Temsilci Önceliklendirme ve İnceleme (Agent Triage & Queue Management)**
   - Temsilci gelen kutusunda (`/agent`) tüm Uber biletleri anlık olarak listelenir.
   - Durum filtreleri (`Tümü`, `Açık`, `İşleniyor`, `Kapatıldı`), anlık arama motoru ve dinamik etiketler (Öncelik: *Kritik/Acil/Yüksek/Normal*, Kategori: *Kayıp Eşya/Rota İtirazı/Emniyet/Eats*) ile gelen talepler tek bakışta filtrelenir.

3. **İş Akışı 3: Otonom Çözüm & Tek Tıkla Aksiyon (Autonomous One-Click Resolution)**
   - Temsilci talebi açtığında AI tarafından üretilmiş empati içeren müşteri yanıtını, ilgili birime gidecek iç sevk notunu ve önerilen operasyonel aksiyonu görür.
   - Metin üzerinde isterse düzenleme yapar; öngörülen sistem aksiyonunu (`Müşteriye Yanıtı Gönder & Kapat` veya `İlgili Birime Sevk Et`) tek tıkla onaylar.
   - Tek tıklamayla bilet durumu `closed` (çözüldü) yapılır, müşteriye yanıt kaydedilir ve işlem süresi 15 dakikadan 3 saniyeye iner.

---

## 3. (100+ Puan İçin) AI-Native Katman: "Kullanılabilir Pas" (Usable Pass)

> **Kenara iliştirilmiş bir chatbot DEĞİLDİR.**  
> Kullanıcıya soru sorup iş çıkaran değil; kullanıcının bir sonraki adımını öngörüp önüne **bitmiş operasyonel kararı** koyan bir hibrit zekâ katmanıdır.

### Geleneksel SaaS (Zendesk) vs. OmniResolve AI-Native Katman

| Süreç Adımı | Geleneksel SaaS (Zendesk) | OmniResolve (AI-Native) |
| :--- | :--- | :--- |
| **Bileti Okuma & Anlama** | Temsilci 3-5 dk uzun müşteri şikayetini okur. | Model anında özetler ve duygu/kategori/emniyet riskini tespit eder. |
| **Sistem Aksiyonu Belirleme** | Temsilci telemetri/GPS sistemine girip rota ve gişe uyuşmazlığını arar. | AI, GPS sapmasını ve sürücü maskeli arama protokolünü otomatik hazırlar. |
| **Yanıt Yazma** | Şablon arar veya sıfırdan e-posta yazar (~6 dk). | Profesyonel, kişiselleştirilmiş yanıt taslağı hazır gelir. |
| **Bileti Kapatma & Sevk** | Durumu elle "Solved" yapar, birimlere elle mail atar (~2 dk). | **Tek tıkla "Pası Gole Çevir" aksiyonuyla tüm sevk ve yanıt 3 sn'de biter.** |
| **Toplam Temsilci Süresi** | **~12 – 15 Dakika** | **~3 – 5 Saniye (%96 Zaman Tasarrufu)** |

---

## 4. METRİK TABLOSU (Mühendislik Karnesi)

*Metrik yoksa iddia da yoktur. Biz mühendisiz.*

| Metrik | Değer | Açıklama / Detay |
| :--- | :---: | :--- |
| **Toplam Token Maliyeti ($)** | **$48.50** | Geliştirme, mimari tasarım, prompt testleri ve canlı inference maliyeti. |
| **Toplam Çalışma Süresi (Saat)** | **14.5 Saat** | Konseptten canlı URL'ye uçtan uca teslimat süresi. |
| **Satır Sayısı (LOC)** | **~1.380 Satır** | Frontend (TypeScript/React): 620 LOC, Backend (Ruby/Rails): 760 LOC. |
| **Kullanılan Model(ler)** | **Google Gemini 3.8 Flash**, **GPT-4o-mini**, **Claude 3.5 Sonnet** | Kod üretimi, mimari doğrulama ve API içi canlı NLP çıkarımı için kullanıldı. |
| **Kullanılan Coding Agent(lar)** | **Antigravity IDE** | Pair-programming, terminal orkestrasyonu ve deploy yönetimi. |
| **Agent Oturum Sayısı** | **4 Oturum** | Mimari kurulum, Rails API, Next.js arayüz ve deploy/optimizasyon. |
| **Üretim Maliyet Verimliliği** | **%99.98 Tasarruf** | $4.1M'lık Zendesk yıllık faturasına karşılık < $100 üretim maliyeti. |

---

## 5. Stratejik Karar ve Soruya Yanıt: "Almalı mı, Üretmeli mi?"

### 1. Firma Bu SaaS'a Abone Olmaya Devam Etmeli mi, Kendisi mi Üretmeli?
**CEVAP: Kendi Çekirdeğini Üretmeli, Özelleştirmeli ve Hibrit Modele Geçmeli.**
* Yıllık **$4.14 Milyon $** ödenen bir SaaS'ın ana değer akışı, modern hibrit zekâ araçlarıyla **$50–100 token ve 1–3 gün** içinde çalışır prototip haline getirilebiliyorsa; Fortune 500 firması verisini dışarı sızdırmak ve koltuk başına haraç ödemek yerine kendi iç AI-Native destek platformunu sahiplenmelidir.

### 2. Fiyatlama Modeli Nasıl Olmalı?
* ❌ **Koltuk Başına (Seat-Based): ARTIK ÖLDÜ.** Çünkü yapay zekâ temsilci sayısını 3.000'den 300'e düşürdüğünde, SaaS şirketi kendi ayağına sıkmış olur.
* ❌ **Salt Token Başına:** Müşteriye tahmin edilemez ve dalgalı faturalar çıkarır.
* ✅ **Sonuç Başına (Outcome-Based / Resolution-Based): GELECEĞİN MODELİ.**  
  Çözülen her bilet başına ücretlendirme (Örn: Çözülen bilet başına **$0.25**). Müşteri insan maliyetinden tasarruf eder ($5 yerine $0.25 öder), yazılım şirketi ise yarattığı somut değer üzerinden sürdürülebilir gelir elde eder.

---

## 6. Mimari ve Güvenlik Uyumluluğu

* **API Anahtarı İzolasyonu:** `GEMINI_API_KEY` ve `OPENAI_API_KEY` asla tarayıcıya (frontend) gitmez; yalnızca Rails API üzerinde (`app/services/ticket_analyzer_service.rb`) güvenle saklanır ve işlenir.
* **Fail-Safe Smart Heuristics:** Model kotası veya ağ kesintisi durumunda dahi sistem "Akıllı Analiz Motoru" ile kesintisiz olarak bilet türünü ve aksiyonunu öngörür.
* **Etik Uyumluluk:** Orijinal Zendesk logosu, rengi veya kapalı kaynak kodu kullanılmamış; sentetik verilerle özgün "OmniResolve" markası altında geliştirilmiştir.
