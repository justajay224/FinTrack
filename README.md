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

2. **Setup Environment Variables**
   
   **a. Konfigurasi Root Environment (Wajib):**
   
   Salin file `.env-example` menjadi `.env` di folder utama project, lalu sesuaikan nilainya:
   
   **Windows (Command Prompt):**
   ```cmd
   copy .env-example .env
   ```
   
   **Mac/Linux/Git Bash:**
   ```bash
   cp .env-example .env
   ```
   
   > ⚠️ **Penting:** Edit file `.env` dan ganti nilai default dengan kredensial yang aman untuk production!

   **b. Konfigurasi Services (Opsional untuk development lokal):**
   
   ```cmd
   copy services\auth-service\.env.example services\auth-service\.env
   copy services\transaction-service\.env.example services\transaction-service\.env
   copy services\reports-service\.env.example services\reports-service\.env
   copy frontend\.env.example frontend\.env
   ```
   
   > Catatan: File `.env` di masing-masing service hanya dibutuhkan jika menjalankan service secara individual (tanpa Docker).

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
