# Project Requirements Document (PRD)
## Sistem Informasi Akademik (SIAKAD)

**Versi:** 1.1.0
**Tanggal:** 6 Juni 2026
**Nama Sistem:** SIAKAD (Sistem Informasi Akademik)
**Klien:** Universitas / Institusi Pendidikan

---

## Daftar Isi
1. Pendahuluan
2. User Personas & Otoritas
3. Fitur Utama (Core Features)
4. Referensi Data & Antarmuka
5. Glosarium
6. Referensi

## Riwayat Revisi
- 1.0.0 (6 Juni 2026): Draft Awal
- 1.1.0 (6 Juni 2026): Penambahan detail teknologi, dataset, dan UI referensi.
- 1.2.0 (6 Juni 2026): Penambahan fitur export PDF, monitoring CPL, input nilai non-pengajaran, dan penyesuaian beranda/monitoring.
- 1.3.0 (23 Juni 2026): Penambahan fitur Registrasi, Import CPMK Excel, Dashboard Pemetaan CPMK-CPL, Filter Semester/Angkatan, Edit Kuota oleh Kaprodi, Entry Manual, dan Pengayaan Menu.

---

## 1. Pendahuluan
Dokumen ini mendefinisikan persyaratan tingkat produk untuk pengembangan SIAKAD. Sistem akan dibangun sebagai web app *Fullstack* dengan Next.js dan TypeScript, dirancang untuk menangani kompleksitas manajemen data akademik dengan memberikan hak akses spesifik kepada Mahasiswa, Dosen, dan Karyawan.

## 2. User Personas & Otoritas
### 2.1. Mahasiswa
- **Tujuan:** Mengelola perjalanan akademik pribadi secara mandiri.
- **Pain Points:** Proses KRS yang sering down, informasi jadwal tidak update.
- **Akses:** Read-only master data terkait dirinya, Write untuk pengisian KRS.

### 2.2. Dosen
- **Tujuan:** Fokus pengajaran dengan meminimalisir beban administrasi kelas.
- **Pain Points:** Kesulitan memantau daftar presensi dan rekapitulasi nilai komponen.
- **Akses:** Read/Write untuk nilai komponen mata kuliah yang diampu, presensi kelas, persetujuan KRS.

### 2.3. Karyawan (Admin/Tendik/TU)
- **Tujuan:** Mengelola sistem akademik, jadwal perkuliahan, serta master data.
- **Pain Points:** Kesulitan mengelola data massal yang tersebar di file Excel.
- **Akses:** Full CRUD master data, kontrol periode semester, persetujuan global, input nilai non-pengajaran, dan monitoring CPL.

## 3. Fitur Utama (Core Features)

### A. Modul Autentikasi & Keamanan
- Login berbasis Role.
- Halaman Registrasi pengguna baru.
- Password hashing & manajemen sesi (diimplementasikan dengan pustaka standar keamanan).

### B. Modul Mahasiswa
- **Dashboard/Beranda:** Visualisasi akademik yang interaktif dan menu lengkap.
- **Monitoring:** Menampilkan ringkasan akademik, jadwal hari ini, beserta visualisasi data (termasuk Pie Chart), dengan fitur export ke PDF.
- **Akademik:** Pengisian KRS, melihat KHS, serta melihat dan mengunduh (download) Transkrip Nilai Kumulatif.

### C. Modul Dosen
- **Dashboard/Beranda:** Menampilkan menu lengkap dan ringkasan akademik dosen.
- **Monitoring:** Menampilkan capaian pembelajaran kelas dengan fitur export ke PDF.
- **Perkuliahan:** Cetak/input presensi, input nilai komponen rinci (Tugas, UTS, UAS, Partisipatif, Proyek), approval KRS.

### D. Modul Karyawan (Tata Usaha)
- **Dashboard/Beranda:** Menu komprehensif untuk operasional akademik.
- **Monitoring:** Fitur monitoring global, monitoring capaian CPL dengan fitur filter semester dan angkatan, visualisasi grafik, dan export PDF.
- **Manajemen Master Data:** Fakultas, Prodi, Mahasiswa, Dosen, Mata Kuliah, Ruangan, Kurikulum. Termasuk fitur untuk menambahkan data spesifik secara manual (di luar database default).
- **Manajemen Semester:** Buka/tutup periode pengisian KRS, buka/tutup masa input nilai.
- **Penjadwalan:** Pembuatan jadwal kuliah dan plot ruangan.
- **Penilaian Khusus:** Input nilai mata kuliah non-pengajaran (Kerja Praktik/KP, Skripsi, MBKM, dll).

### E. Modul Kaprodi (Program Studi)
- **Manajemen Kuota Kelas:** Mengedit dan menetapkan kuota kelas secara mandiri.
- **Pengelolaan CPMK:** Import data narasi CPMK dan CPL dalam bahasa Indonesia dan Inggris (Bilingual) melalui template Excel.
- **Dashboard Pemetaan:** Visualisasi pemetaan antara CPMK dan CPL untuk analisis kurikulum.

## 4. Referensi Data & Antarmuka
- **Data:** Menggunakan skema yang di-reverse-engineer dari dataset Excel (seperti `Data Pengampu.xlsx` dan form penilaian per mata kuliah). Dataset difungsikan sebagai seed awal pada database PostgreSQL.
- **Antarmuka (UI):** Mengacu ketat pada tangkapan layar SIAKAD UNS yang diberikan, mereplikasi layout, warna, dan pengalaman pengguna semirip mungkin. Prioritas pada UI/UX yang modern.

## 5. Glosarium
- **MVP:** Minimum Viable Product
- **CRUD:** Create, Read, Update, Delete

## 6. Referensi
- Screenshot UI Google Drive
- Dokumen Kebutuhan Bisnis Klien
