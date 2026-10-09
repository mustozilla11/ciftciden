# Çiftçiden 🌱 (Tarladan Sofraya Komisyonsuz)

> **Üretici çiftçilerimiz ile toptancı, manav, restoran ve tüketicileri doğrudan buluşturan, %100 komisyonsuz ve aracısız modern mobil tarım pazaryeri.**

---

## 🎯 Projenin Amacı ve Vizyonu
Geleneksel tarım tedarik zincirinde mahsuller üreticiden çıkıp tezgaha ulaşana kadar en az 3-4 aracı el değiştirmekte, bu durum hem çiftçinin emeğinin karşılığını alamamasına hem de tüketicinin yüksek fiyatlarla karşılaşmasına neden olmaktadır. 

**Çiftçiden**, tarla ile tüketici arasındaki aracıları ve komisyonları tamamen ortadan kaldırarak şeffaf, taze ve adil bir ticaret ortamı sağlar.

---

## 🚀 Öne Çıkan Özellikler

### 1. 🛡️ Çiftçi Güvenliği ve Mahsul Mahremiyeti (Sıfır GPS Zorunluluğu)
* Üreticilerin harita pini, köy/mahalle adı veya kesin koordinatları ilanlarda **asla herkese açık yayınlanmaz**.
* Bu sayede hasat öncesi ürün hırsızlığı, haksız tarla baskınları ve fırsatçı aracı darlamaları engellenir.
* Tüm ilanlar sadece **İl / İlçe** seviyesinde listelenir (Örn: *Antalya, Kumluca*).
* Alıcı ile üretici anlaştıktan sonra çiftçi dilerse kendi rızasıyla uygulama üzerinden tek tıkla **"WhatsApp'tan Canlı Konum"** gönderebilir.

### 2. ⏳ Tarımsal Geri Sayım & Acil Vitrin ("Acil Tarladan Çıkmalı!")
* Mahsullerin raf ömrü ve hasat periyodu sınırlıdır.
* Son 48 saat kalan mahsuller ana sayfada **"Acil Tarladan Çıkmalı!"** acil durum vitrininde öne çıkarılır; ürünün tarlada çürümesi önlenir.

### 3. 📸 Kırsal Şebeke ve Görsel Optimizasyonu (WebP <200KB)
* Tarladaki 3G/Edge şebekelerinde bile anında ilan yüklenebilmesi için görseller cihazda otomatik olarak **WebP formatına, 1280px genişliğe ve <200 KB boyutuna** sıkıştırılır.

### 4. 🇹🇷 81 İl Kapsamı ve Hızlı Arama
* Tüm Türkiye genelinde 81 ilin tamamı alfabetik sırada ve hızlı canlı arama desteğiyle sunulur.

### 5. 🔐 Şifresiz ve Masrafsız Giriş (Google & iCloud)
* SMS spam ve operatör maliyetlerini sıfıra indiren modern Google ve iCloud (Sign in with Apple) entegrasyonu.
* Çapraz platform (Android & iOS) tam uyumluluk.

### 6. 📞 Güvenli İletişim & Arama Teyidi
* Yanlışlıkla arama yapmayı önleyen onay kartı (Üretici adı, ilan bilgisi, arama butonu).

---

## 🛠️ Teknoloji Yığını (Tech Stack)

* **Mobil Çatı:** [React Native](https://reactnative.dev/) & [Expo](https://expo.dev/) (SDK 52/57)
* **Dil:** TypeScript
* **Yönlendirme:** [Expo Router](https://docs.expo.dev/router/introduction/) (Dosya tabanlı routing)
* **Stil:** [NativeWind v4](https://www.nativewind.dev/) (Tailwind CSS) + React Native StyleSheet
* **Veritabanı & Backend:** [Supabase](https://supabase.com/) (PostgreSQL, Row Level Security)
* **İkonlar:** [Lucide React Native](https://lucide.dev/)
* **Görsel İşleme:** `expo-image-manipulator`

---

## 💻 Kurulum ve Geliştirme

Projeyi yerel ortamınızda çalıştırmak için:

1. **Bağımlılıkları Yükleyin:**
   ```bash
   npm install
   ```

2. **Geliştirme Sunucusunu Başlatın:**
   ```bash
   npx expo start
   ```

3. **Mobil Cihazda Açma:**
   * Telefonunuza **Expo Go** uygulamasını yükleyin.
   * Terminaldeki QR kodu Expo Go kamerasıyla taratın.
   * Hotspot veya farklı ağlarda tünel açmak için:
     ```bash
     npx expo start --tunnel
     ```

---

## 📄 Lisans
Bu proje özel mülkiyete tabi olup tüm hakları saklıdır.
