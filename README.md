# EchoDrop 🎵📨👥

EchoDrop adalah platform web *anonymous multimedia messaging* yang memungkinkan pengguna untuk berbagi pesan secara anonim. Tidak hanya mengirimkan teks biasa, pengguna juga dapat menyematkan gambar (*image attachments*) serta membagikan trek lagu favorit mereka yang terintegrasi langsung dengan Spotify API.

Untuk menjaga performa, stabilitas, dan keamanan dari serangan spam, platform ini mengombinasikan **PostgreSQL** sebagai database utama dengan **Redis** sebagai lapisan *caching* dan *rate limiting*.

---

## 👥 Contributors

**SBD Group 6**

* **Kayla Joanna** (2406487014)
* **Safina Amarani** (2406415665)
* **Djukallita Tafiana D.** (2406416573)
* **Thalita Salma Artanti** (2406419354)

---

## 📌 Features

### Hak Akses Pengguna

* **Guest (Unregistered):**

  * Melihat *global feed* berisi pesan-pesan publik.
  * Melakukan pencarian (*search*) pesan menggunakan kata kunci tertentu.

* **Registered User:**

  * Melakukan pendaftaran akun (*register*) dan masuk (*login*).
  * Membuat pesan anonim baru (*create message*).
  * Mengunggah lampiran gambar (*upload image attachment*).
  * Mencari dan menyematkan lagu menggunakan integrasi Spotify API.

### Optimalisasi & Keamanan Sistem

* **PostgreSQL Full-Text Search:**
  Pencarian pesan menggunakan fitur bawaan `tsvector` PostgreSQL yang jauh lebih cepat dan efisien dibandingkan *query* `LIKE` konvensional.

* **Global Feed Caching:**
  Menggunakan Redis untuk menyimpan *cache* pesan-pesan terbaru guna memangkas waktu respons dan meringankan beban kerja PostgreSQL.

* **Anti-Spam Rate Limiting:**
  Lapisan keamanan Redis untuk membatasi frekuensi pengiriman pesan per pengguna/IP dalam periode tertentu demi menjaga stabilitas server.

---

## 🏗️ System Architecture

Aplikasi ini menggunakan arsitektur berlapis untuk memastikan pemisahan tugas yang jelas dan performa yang optimal:

[
\text{Frontend} \longrightarrow \text{Backend API} \longrightarrow
\begin{cases}
\text{PostgreSQL (Main DB)} \
\text{Redis (Cache & Rate Limiter)} \
\text{Spotify API (Music Data)}
\end{cases}
]

1. **Frontend:**
   Antarmuka pengguna untuk proses autentikasi, pembuatan pesan, penjelajahan *feed*, dan kolom pencarian.

2. **Backend API:**
   Mengontrol seluruh logika bisnis termasuk validasi data, autentikasi, integrasi API pihak ketiga, dan manajemen *query* database.

3. **PostgreSQL:**
   Penyimpanan data permanen (*persistent*) untuk entitas *user*, *message*, dan *media attachment*.

4. **Redis:**
   Database *in-memory* pendukung untuk kebutuhan *caching* cepat dan pembatasan akses (*rate limit*).

5. **Spotify API:**
   Menyediakan data eksternal untuk pencarian lagu dan pemutaran *widget* musik.

---

## 🗄️ Database Design (ERD)

Sistem menggunakan database relasional PostgreSQL dengan skema berikut:

### 1. Table `users`

Menyimpan informasi kredensial dan akun pengguna aplikasi.

* `id` (UUID, Primary Key)
* `username` (VARCHAR, NOT NULL)
* `email` (VARCHAR, NOT NULL)
* `password_hash` (VARCHAR, NOT NULL)
* `created_at` (TIMESTAMP)

### 2. Table `messages`

Menyimpan data konten dari pesan anonim yang dikirim oleh pengguna.

* `id` (UUID, Primary Key)
* `author_id` (UUID, Foreign Key menunjuk ke `users.id`)
* `content` (TEXT, NOT NULL)
* `search_vector` (TSVECTOR, digunakan untuk PostgreSQL Full-Text Search)
* `created_at` (TIMESTAMP)

### 3. Table `media_attachments`

Menyimpan metadata lampiran multimedia, baik berupa tautan gambar maupun lagu dari Spotify.

* `id` (UUID, Primary Key)
* `message_id` (UUID, Foreign Key menunjuk ke `messages.id`)
* `media_type` (VARCHAR, pembeda tipe antara gambar atau lagu)
* `media_url` (VARCHAR, URL file gambar atau tautan media)
* `external_id` (VARCHAR, ID lagu spesifik dari Spotify API)

### Relasi Tabel

* **One-to-Many (1:N) antara `users` dan `messages`:**
  Satu pengguna dapat mempublikasikan banyak pesan anonim.

* **One-to-Many (1:N) antara `messages` dan `media_attachments`:**
  Satu pesan anonim dapat memuat beberapa lampiran media sekaligus.

---

## 🧠 Application Flows

### 1. Alur Pembuatan Pesan (*Create Message*)

```text
[User Login] ➔ [Buka Form] ➔ [Tulis Pesan] ➔ [Cari & Pilih Lagu via Spotify]
                                                     ➔ [Unggah Gambar] ➔ [Klik Post]
                                                     ➔ [Backend Validasi] ➔ [Simpan PostgreSQL]
                                                     ➔ [Pesan Tampil di Global Feed]
```
