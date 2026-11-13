# Catatan perubahan

Semua perubahan penting dicatat di sini. Format mengikuti [Keep a Changelog](https://keepachangelog.com/id-ID/1.1.0/) dan nomor versi mengikuti [Semantic Versioning](https://semver.org/lang/id/).

## [Belum dirilis]

### Ditambahkan
- Kalkulator tiang bor N-SPT, pondasi dangkal, dan penurunan konsolidasi dengan langkah hitungan.
- Bank soal latihan geoteknik dengan angka acak dan pembahasan.
- Enam belas alat pengolah data Praktikum Mekanika Tanah dengan ekspor Word dan Excel.
- Alat permeabilitas tinggi tekan tetap dan tinggi tekan turun; alat saringan, hidrometer, CBR, pemadatan, UCS, dan geser langsung disesuaikan dengan form lab (versi cache 0.9.1 supaya browser memuat skrip baru).
- Registri alat `konten/alat.json`, `skrip/buat.py`, uji registri, dan workflow yang membangun ulang situs saat `konten/` berubah.
- Skill proyek `/tambah-alat`, `/tambah-catatan`, `/tambah-soal`, `/audit-rumus`, `/rilis`, dan `PANDUAN.md`.
- Pencarian seluruh situs (`/cari/`), mode offline dengan service worker, tombol "Laporkan salah hitung" di setiap alat, dan lencana status sumber dari registri.
- `CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md` (Contributor Covenant 2.1, terjemahan resmi), templat Issue dan PR, `CITATION.cff`, Dependabot untuk GitHub Actions.

### Diubah
- Alamat situs menjadi https://defsayurinda.github.io/ dan akun menjadi `defsayurinda`.
- Tahanan ujung Reese & Wright disamakan dengan Lastiasih dkk. (2013), hlm. 136: (2/3)N/0,3048² t/m² untuk N ≤ 60 dan 40/0,3048² untuk N > 60.
- Lisensi dipisah: kode MIT, tulisan CC BY 4.0.
- KaTeX dan huruf Plus Jakarta Sans disimpan lokal, tanpa CDN.
- Klaim sumber dan pengujian di beranda dan README disesuaikan dengan status tiap alat.

### Diperbaiki
- Teks dari tautan berbagi dan isian formulir praktikum di-escape sebelum masuk HTML (XSS).
- Syarat data 4d di bawah ujung tiang hanya untuk Meyerhof.

### Dihapus
- Hasil Meyerhof (1976) dan soal `meyerhof-selimut` disembunyikan sampai rumusnya dicocokkan dengan PUPR (2019).
- Opsi tiang pancang di kalkulator tiang bor.
