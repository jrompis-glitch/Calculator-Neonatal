# Neonatal Clinical Calculator Perinatology Sam Ratulangi — v1.2.6

## Modul
- Kalkulator GIR
- Hiperbilirubinemia AAP 2022
- Skor BIND-M
- Skor Thompson
- Bilirubin <35 minggu
- Fenton 2025: pemeriksaan serial, pencarian ID/nomor rekam medis, seluruh titik serial pada grafik berat badan/panjang badan/lingkar kepala, simpan lokal pada perangkat, hapus catatan, ekspor/impor cadangan.\n- Kalkulator PPI Neonatal: input PPI preduktal dan postduktal, kurva persentil usia gestasi 35–41 minggu, titik pasien pada grafik, dan interpretasi kategori persentil.

## Deploy Vercel
Unggah seluruh isi folder ini ke repository GitHub yang terhubung dengan Vercel. Framework Preset: Other; Build Command kosong; Output Directory `.`. `index.html` harus berada di root.

## Data Fenton dan keselamatan
Fenton menyimpan data pemeriksaan di localStorage browser/perangkat ini; tidak tersinkronisasi antarperangkat. Ekspor cadangan secara berkala. Prototipe Fenton yang disertakan menandai keterbatasan kurva: P10/P90 berat badan merupakan ukuran lahir yang tersedia di prototipe, sedangkan panjang badan dan lingkar kepala memakai estimasi interpolasi, bukan tabel numerik resmi tervalidasi. Jangan gunakan sebagai satu-satunya dasar keputusan klinis/klasifikasi SGA/AGA/LGA. Validasi dengan sumber resmi sebelum penggunaan klinis.

Produced by Johnny Rompis.

- Kalkulator Oxygen Index (OI): estimasi MAP dari PIP/PEEP/Ti/RR, OI dari FiO₂/MAP/PaO₂, interpretasi dan pertimbangan iNO berdasarkan workbook Kalkulator_Oxygen_Index_Neonatus_v2.xlsx.


## Modul PAIN (N-PASS dan NIPS)
Ditambahkan sebagai halaman terpisah `pain.html` dan dapat dibuka dari kartu Kalkulator PAIN di beranda. Modul menggunakan instrumen N-PASS dan NIPS sesuai implementasi paket PAIN v4.


Versi 1.2.9: input TSB/Bilirubin dan PaO₂ mendukung dua angka desimal; PaCO₂ opsional ditambahkan pada input gas darah. PaCO₂ hanya untuk pencatatan dan tidak memengaruhi rumus Oxygen Index.


## Integrasi Modified Finnegan NAS v4
- Menu **Skor Modified Finnegan** tersedia dari halaman utama.
- Penilaian Finnegan berjalan sebagai halaman tersendiri `finnegan.html`, terintegrasi dalam satu deployment Vercel.
- Riwayat penilaian disimpan di browser lokal; CSV dapat diekspor dari halaman Finnegan.
- Catatan klinis dan peringatan penggunaan dari modul Finnegan dipertahankan.
- Service worker dinaikkan ke cache v1-12 agar aset modul baru ikut dimuat.


## Integrasi Kalkulator PPI Neonatal
- Modul PPI ditambahkan ke halaman utama dan navigasi aplikasi.
- Menggunakan tabel numerik preduktal/postduktal usia gestasi 35–41 minggu dari workbook PPI yang disediakan.
- Interpretasi rentang persentil: di bawah P3 (sangat rendah), P3–<P10 (rendah), P10–<P25 (relatif rendah), P25–P75 (rentang tengah), >P75–P90 (relatif tinggi), >P90–P97 (tinggi), di atas P97 (sangat tinggi).
- Grafik SVG menampilkan sumbu angka, tujuh kurva persentil, dan titik merah pasien sesuai input. Di luar 35–41 minggu, hasil persentil tidak dihitung.


## Integrasi terbaru
Ditambahkan modul Kalkulator Cardiac Output/Cardiac Index untuk LV dan RV, dengan SV absolut dan terindeks, CO absolut dan terindeks, CI, serta kesimpulan otomatis. Angka ditampilkan 2 desimal. Navigasi melalui kartu Beranda atau tab CO–CI.
