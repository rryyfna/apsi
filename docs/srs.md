# Software Requirements Specification (SRS)
## Sistem Informasi Akademik (SIAKAD)

**Versi:** 1.1.0
**Tanggal:** 6 Juni 2026
**Nama Sistem:** SIAKAD (Sistem Informasi Akademik)
**Klien:** Universitas / Institusi Pendidikan

---

## Daftar Isi
1. Pendahuluan
2. Deskripsi Umum
3. Spesifikasi Kebutuhan Fungsional (Functional Requirements)
4. Kebutuhan Non-Fungsional (Non-Functional Requirements)
5. Skema Data Berdasarkan Dataset
6. Glosarium
7. Referensi

## Riwayat Revisi
- 1.0.0 (6 Juni 2026): Draft Awal
- 1.1.0 (6 Juni 2026): Finalisasi Tech Stack dan struktur skema data awal.
- 1.2.0 (6 Juni 2026): Penambahan fitur export PDF, input nilai TU, grafik pie chart, download transkrip mahasiswa, dan integrasi fitur monitoring CPL.
- 1.3.0 (23 Juni 2026): Penambahan fitur Registrasi, Import CPMK Excel, Filter Semester/Angkatan, Edit Kuota (Kaprodi), Entry Manual, Dashboard Pemetaan, dan Pengayaan Menu.

---

## 1. Pendahuluan
### 1.1 Tujuan Dokumen
Dokumen ini menspesifikasikan kebutuhan perangkat lunak untuk SIAKAD, mencakup kebutuhan fungsional dan non-fungsional, serta pemetaan awal skema database.

### 1.2 Ruang Lingkup Perangkat Lunak
Sistem berupa aplikasi web *fullstack* (Next.js) yang mengelola siklus akademik dari hulu ke hilir.

## 2. Deskripsi Umum
### 2.1 Lingkungan Operasional
- **Frontend & Backend Framework:** Next.js (TypeScript)
- **Database ORM:** Prisma ORM
- **Database Engine:** PostgreSQL
- **Platform:** Web Browser modern

### 2.2 Batasan Desain dan Implementasi
- Sistem harus mengadopsi standar keamanan web (pencegahan SQL Injection, XSS, CSRF).
- Desain antarmuka wajib mengacu pada referensi SIAKAD UNS.
- Struktur database harus dirancang agar bisa menampung data migrasi dari format Excel klien secara utuh (termasuk komponen nilai spesifik).

## 3. Spesifikasi Kebutuhan Fungsional (Functional Requirements)

### FQ-01: Manajemen Akses (Otentikasi & Otorisasi)
- **FQ-01.1:** Sistem harus membedakan akses login berdasarkan kredensial (NIM untuk mahasiswa, NIDN/NIP untuk Dosen, Username khusus untuk Karyawan).
- **FQ-01.2:** Sistem harus mengenkripsi kata sandi pengguna di database.
- **FQ-01.3:** Sistem menyediakan antarmuka Registrasi Akun baru untuk mahasiswa atau pengguna terkait di luar mekanisme import data.
- **FQ-01.4:** Sistem memiliki sidebar/menu yang kaya dan relevan sesuai dengan role (Mahasiswa, Dosen, Admin, Kaprodi) agar dashboard tidak terlihat kosong.

### FQ-02: Fungsionalitas Karyawan (Admin/TU)
- **FQ-02.1:** Sistem memungkinkan Karyawan untuk mengimpor data massal (misalnya dari format Excel) untuk data mahasiswa, dosen, dan mata kuliah.
- **FQ-02.2:** Sistem memungkinkan Karyawan untuk menjadwalkan kelas, menetapkan dosen pengampu, dan ruangan.
- **FQ-02.3:** Karyawan dapat mengaktifkan atau menonaktifkan status semester (Masa KRS, Masa Input Nilai).
- **FQ-02.4:** Karyawan (Tata Usaha) dapat menginput nilai untuk mata kuliah non-pengajaran seperti Kerja Praktik (KP), Skripsi, MBKM, dan sejenisnya.
- **FQ-02.5:** Karyawan dapat memonitor Capaian Pembelajaran Lulusan (CPL) dan mengekspor laporan pemantauan.
- **FQ-02.6:** Sistem mengakomodasi entry data manual (di luar sinkronisasi database eksternal) melalui antarmuka Form UI yang terintegrasi.

### FQ-03: Fungsionalitas Kaprodi
- **FQ-03.1:** Kaprodi dapat memodifikasi (edit) kuota mahasiswa di kelas secara langsung.
- **FQ-03.2:** Kaprodi dapat mengimpor data narasi CPMK (Capaian Pembelajaran Mata Kuliah) beserta bahasa Indonesia dan bahasa Inggris via Excel.
- **FQ-03.3:** Kaprodi memiliki Dashboard Visual untuk pemetaan (mapping) antara CPMK dan CPL.

### FQ-03: Fungsionalitas Dosen
- **FQ-03.1:** Sistem menampilkan daftar mata kuliah yang diampu dosen pada semester berjalan.
- **FQ-03.2:** Dosen dapat melakukan persetujuan (approve/reject) KRS mahasiswa perwalian.
- **FQ-03.3:** Dosen dapat menginput dan mengubah nilai akhir mahasiswa selama Masa Input Nilai aktif.

### FQ-04: Fungsionalitas Mahasiswa
- **FQ-04.1:** Mahasiswa dapat melihat tagihan UKT dan status pembayaran.
- **FQ-04.2:** Mahasiswa dapat melakukan pengisian KRS berdasarkan jadwal yang tersedia dan kuota kelas.
- **FQ-04.3:** Mahasiswa dapat mencetak KHS per semester serta melihat dan mengunduh (download) Transkrip Nilai Kumulatif dalam format PDF.

### FQ-05: Fungsionalitas Monitoring & Pelaporan
- **FQ-05.1:** Setiap portal (Mahasiswa, Dosen, Karyawan, Kaprodi) memiliki fitur monitoring yang fungsional dengan filter khusus berdasarkan Semester dan Angkatan (cohort).
- **FQ-05.2:** Fitur monitoring harus menyediakan visualisasi data dalam bentuk grafik, termasuk penggunaan *Pie Chart*.
- **FQ-05.3:** Semua hasil monitoring di setiap portal dapat diekspor menjadi laporan berformat PDF.

## 4. Kebutuhan Non-Fungsional (Non-Functional Requirements)
- **Performa:** Page load di bawah 3 detik, mendukung *concurrent users* tinggi saat periode pengisian KRS.
- **Keamanan:** Mencegah SQL Injection via Prisma ORM, sanitasi input pada frontend dan backend.

## 5. Skema Data Berdasarkan Dataset (Initial Mapping)
Analisis dataset menunjukkan entitas kunci berikut wajib ada di PostgreSQL:
- **Users / Roles:** Mahasiswa (NIM), Dosen (NIDN), Admin, Kaprodi, Mutu.
- **Mahasiswa:** NIM, Nama, Angkatan (Tahun Masuk).
- **Course (Mata Kuliah):** Kode MK, Nama MK, SKS, Semester.
- **Class (Kelas Kuliah):** Kode MK, Dosen Pengampu, Kelas (A/B/C), Kuota, Status.
- **Enrollment (KRS / Nilai):** Relasi Mahasiswa ke Kelas, menampung nilai komponen.
- **CPMK/CPL:** Data narasi dengan opsi multibahasa (ID, EN).

## 6. Glosarium
- **ORM:** Object-Relational Mapping
- **NIM:** Nomor Induk Mahasiswa
- **NIDN:** Nomor Induk Dosen Nasional

## 7. Referensi
- Dataset `APSI 25_5_26`
- Referensi IEEE 830 untuk format SRS
