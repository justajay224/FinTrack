# FinTrack - Sistem Pencatatan Keuangan

Sistem pencatatan keuangan modern berbasis Microservices yang mudah digunakan dan dideploy.

![Dashboard Preview](frontend/public/preview.png)

## 📋 Fitur Utama
- **Dashboard Interaktif**: Ringkasan keuangan real-time.
- **Laporan Lengkap**: Harian, Mingguan, Bulanan, dan Tahunan.
- **Manajemen Transaksi**: Catat pemasukan dan pengeluaran dengan mudah.
- **Multi-Service Architecture**: Dibangun dengan Node.js, Express, dan Next.js.

---

## 🚀 Cara Menjalankan (Quick Start)

Ikuti langkah mudah ini untuk menjalankan aplikasi di komputer Anda.

### Prasyarat
Pastikan Anda sudah menginstall:
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Wajib)
- Git (Opsional, untuk clone)

### Langkah-Langkah

1. **Clone Repository (atau download ZIP)**

3. **Setup Environment Variables (PENTING)**

   **a. Konfigurasi Root Project (WAJIB)**
   Aplikasi ini menggunakan **Strict Environment Mode**, artinya Anda wajib memiliki file `.env` di root folder.
   
   Salin file `.env-example` menjadi `.env` di folder utama:
   
   **Windows (Command Prompt):**
   ```cmd
   copy .env-example .env
   ```
   **Mac/Linux:**
   ```bash
   cp .env-example .env
   ```
   
   > ⚠️ **Edit file `.env` sekarang!** Pastikan variabel `NEXT_PUBLIC_API_URL` dan `CORS_ORIGIN` sesuai dengan URL aplikasi Anda (default: `http://localhost`).

   **b. Konfigurasi Tiap Service (OPSIONAL)**
   File `.env` di dalam folder `services/*` dan `frontend/` **TIDAK PERLU** jika Anda menggunakan Docker Compose (karena sudah di-inject otomatis).
   
   Hanya buat file env di service jika Anda berencana menjalankannya secara manual (tanpa Docker).

3. **Jalankan Aplikasi**
   Buka terminal di folder utama project, lalu jalankan:
   ```bash
   docker-compose up -d
   ```
   *Tunggu beberapa saat (5-10 menit) untuk proses build dan download database pertama kali.*
   
   > **Catatan:** Migrasi database akan berjalan otomatis setiap kali aplikasi dimulai.

4. **(Opsional) Isi Data Awal (Seeder)**
   Jika ingin mengisi kategori bawaan (Gaji, Makanan, dll), jalankan perintah ini **sekali saja** setelah aplikasi berjalan:
   ```bash
   docker exec -it fintrack-transaction npm run seed
   ```

5. **Akses Aplikasi**
   Setelah semua selesai, buka browser dan kunjungi:
   
   👉 **http://localhost**

---

## 🛠️ Tech Stack

**Frontend:**
- Next.js 13+ (App Router)
- TailwindCSS
- Framer Motion (Animasi)
- Chart.js (Visualisasi Data)

**Backend:**
- **API Gateway**: Nginx
- **Auth Service**: Node.js, Express, MySQL, Redis
- **Transaction Service**: Node.js, Express, MariaDB
- **Reports Service**: Node.js, Express, MariaDB

**Infrastructure:**
- Docker & Docker Compose

---

## ❓ Troubleshooting

Jika aplikasi gagal berjalan atau error:

1. **Cek Status Container:**
   ```bash
   docker-compose ps
   ```
   Pastikan semua statusnya `Up (healthy)`.

2. **Restart Container (Jika ada yang mati):**
   ```bash
   docker-compose down
   docker-compose up -d
   ```

3. **Reset Database (Hapus data & mulai dari nol):**
   ```bash
   docker-compose down -v
   docker-compose up -d
   ```
