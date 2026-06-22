# Project Charter
## Sistem Informasi Akademik (SIAKAD)

**Versi:** 1.1.0
**Tanggal:** 6 Juni 2026
**Nama Sistem:** SIAKAD (Sistem Informasi Akademik)
**Klien:** Universitas / Institusi Pendidikan

---

## Daftar Isi
1. Ringkasan Eksekutif
2. Objektif Proyek
3. Ruang Lingkup (Scope)
4. Asumsi dan Kendala
5. Milestone Proyek (Level Tinggi)
6. Glosarium
7. Referensi

## Riwayat Revisi
- 1.0.0 (6 Juni 2026): Draft Awal
- 1.1.0 (6 Juni 2026): Pembaruan spesifikasi teknologi dan dataset
- 1.2.0 (23 Juni 2026): Penambahan fitur Registrasi, Import CPMK Excel, Filter Semester/Angkatan, Edit Kuota, Entry Manual, dan Pengayaan Menu.

---

## 1. Ringkasan Eksekutif
Proyek ini bertujuan untuk mengembangkan Sistem Informasi Akademik (SIAKAD) komprehensif, mengadaptasi fungsionalitas, antarmuka pengguna (UI), dan skalabilitas yang setara dengan sistem akademik universitas terkemuka (khususnya SIAKAD UNS). Sistem ini akan dibangun menggunakan teknologi modern (*Next.js, TypeScript, Prisma ORM, PostgreSQL*) guna memfasilitasi administrasi akademik, manajemen perkuliahan, dan pelaporan secara terintegrasi dan real-time.

## 2. Objektif Proyek
- Menyediakan platform terpadu untuk 3 entitas utama: Dosen, Mahasiswa, dan Karyawan.
- Mendemokratisasi akses data akademik dengan antarmuka yang modern, responsif, dan mudah digunakan (User-Friendly), mengacu pada referensi UI SIAKAD UNS.
- Meningkatkan efisiensi manajemen KRS (Kartu Rencana Studi), KHS (Kartu Hasil Studi), presensi, penjadwalan, dan pengelolaan nilai komponen.
- Memastikan keamanan data tingkat tinggi dengan sistem autentikasi dan otorisasi berbasis *Role-Based Access Control* (RBAC).

## 3. Ruang Lingkup (Scope)
Sistem ini mencakup pengembangan fitur inti untuk tiga *role* otoritas:
1. **Mahasiswa:** Registrasi akun, registrasi semester, pengisian KRS, melihat KHS/Transkrip, jadwal kuliah, absensi, dan pengajuan akademik. Akses menu yang lebih kaya pada portal.
2. **Dosen:** Registrasi akun, manajemen nilai (termasuk breakdown komponen nilai: Tugas, UTS, UAS, Partisipasi, Proyek), absensi mahasiswa, jadwal mengajar, dan bimbingan akademik.
3. **Karyawan (Admin/Tendik):** Manajemen master data (mahasiswa, dosen, mata kuliah, ruangan, kurikulum) dengan opsi tambah data di luar database (manual entry), konfigurasi periode akademik, persetujuan administratif, dan pelaporan dengan filter semester serta angkatan.
4. **Kaprodi:** Manajemen kuota kelas secara mandiri, import data narasi CPMK/CPL (bilingual) via Excel, dan dashboard pemetaan CPMK ke CPL.

## 4. Asumsi dan Kendala
- **Asumsi:** Klien memiliki dataset mentah (format Excel) yang merepresentasikan data mahasiswa, dosen, mata kuliah, dan daftar nilai kelas, yang akan digunakan sebagai data acuan utama (seeding) untuk skema database relasional.
- **Kendala:** Migrasi data dari file Excel dengan format beragam harus dipetakan secara akurat menggunakan *script* seeding ke dalam skema database *PostgreSQL*.

## 5. Milestone Proyek (Level Tinggi)
1. **Fase 1:** Pengumpulan Kebutuhan & Desain Dokumen (Charter, PRD, SRS) - *Selesai*
2. **Fase 2:** Analisis Dataset Excel & Screenshot UI (Penyesuaian Skema Database) - *Selesai*
3. **Fase 3:** Setup Arsitektur & Lingkungan Pengembangan (Next.js, Prisma, PostgreSQL).
4. **Fase 4:** Pengembangan Backend & Frontend Core (Auth, Master Data).
5. **Fase 5:** Pengembangan Fitur Mahasiswa, Dosen, Karyawan.
6. **Fase 6:** Pengujian, UAT, dan Deploy.

## 6. Glosarium
- **SIAKAD:** Sistem Informasi Akademik
- **KRS:** Kartu Rencana Studi
- **KHS:** Kartu Hasil Studi
- **SKS:** Satuan Kredit Semester
- **RBAC:** Role-Based Access Control

## 7. Referensi
- Dataset Excel Kelas, Dosen, dan Kurikulum dari Klien (APSI 25_5_26).
- Screenshot Referensi UI SIAKAD UNS.
