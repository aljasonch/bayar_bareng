# Bilbil — Prompt Redesign untuk Antigravity

Gunakan prompt ini untuk melakukan redesign UI/UX Bilbil. Ini adalah pekerjaan pada presentasi, struktur komponen, dan pengalaman penggunaan—**bukan** perubahan pada logika bisnis atau angka perhitungan.

## Prompt Utama

Redesign seluruh antarmuka Bilbil, aplikasi pembagian tagihan/patungan, agar terasa matang, sangat mudah dipakai, dan konsisten di mobile maupun desktop. Gaya visual sepenuhnya bebas: pilih sendiri arah desain, palet warna, tipografi, bentuk, dan tingkat ekspresi yang paling cocok untuk produk ini. Jangan merasa perlu mempertahankan gaya antarmuka yang ada.

Bangun sistem visual yang konsisten melalui design tokens. Prioritaskan keterbacaan nominal, hierarki informasi, dan state interaksi; warna harus punya peran fungsional yang jelas, dengan aksen yang hemat dan CTA WhatsApp yang tetap mudah dikenali.

Hasil redesign harus membuat pengguna lebih cepat mencatat pesanan, memahami penyesuaian, dan membagikan tagihan. Jangan menghasilkan tampilan AI slop: hindari gradient dekoratif, bento-card berlebihan, rounded-pill di mana-mana, ikon yang tidak membantu, ilustrasi 3D, dan ornamen yang tidak mendukung tugas pengguna.

## Batasan yang Tidak Boleh Dilanggar

- Jangan mengubah rumus pembagian, diskon, cashback, biaya tambahan, ongkir, atau pembulatan.
- Jangan mengubah perilaku data riwayat, format pesan WhatsApp, atau struktur data yang tersimpan.
- Anggap area kalkulasi sebagai area terkunci, terutama `lib/calculate.ts`.
- Siapkan beberapa *golden cases* sebelum mulai: input lama harus menghasilkan total per-orang dan total akhir yang persis sama setelah redesign.

## Prinsip Desain yang Wajib Diikuti

- Pertahankan arah visual **“nota kasir”**, lalu rapikan agar lebih tenang dan mudah dipindai.
- Hindari AI slop: gradient dekoratif, kartu bento berlebihan, rounded-pill di mana-mana, ikon yang tidak membantu, ilustrasi 3D, dan aksen warna yang digunakan tanpa alasan.
- Prioritaskan hierarki informasi, jarak, tipografi, dan state interaksi dibanding ornamen.
- Mobile bukan desktop yang dipersempit. Gunakan komponen/form yang sama, tetapi atur ulang layout dan navigasinya menurut breakpoint.

## Kebebasan Arah Visual

Antigravity bebas menentukan palet warna, tipografi, bentuk sudut, dan detail visual. Namun, keputusan tersebut harus membentuk sebuah sistem yang jelas:

- Bedakan dengan tegas latar, permukaan, teks primer/sekunder, border, state terpilih, dan CTA utama.
- Gunakan aksen secara hemat untuk tindakan serta status, bukan dekorasi.
- Pastikan nominal, input harga, dan total selalu menjadi elemen yang paling mudah dipindai.
- Warna peserta boleh dipakai untuk avatar atau indikator pembagian, tetapi tidak boleh menjadi satu-satunya pembeda; nama/inisial wajib terlihat.
- Pastikan kontras mencukupi untuk penggunaan di bawah cahaya terang dan state disabled tetap terbaca.

## Arsitektur Informasi

### 1. Catat

- Identitas nota: jenis nota, tanggal, dan pihak yang menalangi.
- Daftar peserta serta item pesanan per peserta.
- Roster profil tetap mudah diakses, tetapi tidak mengalahkan area entri utama.
- Urutan visual kartu peserta: nama → item → harga → subtotal.

### 2. Sesuaikan

- Kelompokkan input berdasarkan dampaknya:
  - Mengurangi tagihan: diskon dan cashback.
  - Menambah tagihan: ongkir dan biaya tambahan.
  - Informasi pembagian: basis cashback atau penjelasan pembagian.
- Tampilkan ringkasan perubahan langsung: subtotal → pengurang → penambah → total akhir.
- Jelaskan basis pembagian secara singkat; jangan mengubah rumusnya.

### 3. Tagih

- Nominal tagihan per orang dan aksi kirim adalah fokus utama.
- Nota cetak tetap dipertahankan sebagai artefak yang bisa disimpan/dibagikan, tetapi bukan satu-satunya cara membaca hasil.
- Sediakan rincian “cara total terbentuk” yang dapat dibuka bila pengguna ingin memeriksa perhitungan.

### 4. Riwayat

- Desktop: daftar nota di kiri, detail terpilih di kanan.
- Mobile: daftar sederhana; detail terbuka sebagai layar/overlay penuh.
- Metadata yang terlihat langsung: tanggal, jumlah peserta, total, dan jenis nota.

## Komponen yang Perlu Distandardkan

Bangun *design system* kecil dengan perilaku konsisten:

- `AppShell` — header, lebar konten, dan navigasi riwayat.
- `StepProgress` — status langkah 1–3: aktif, selesai, dan terkunci.
- `SectionHeader` — label kecil, judul, deskripsi, dan aksi opsional.
- `MoneyField` — input Rupiah dengan format serta state konsisten.
- `PersonEntryCard` — nama, avatar warna peserta, item, dan subtotal.
- `FeeRow` / `FeeSection` — diskon, cashback, dan biaya tambahan.
- `CalculationSummary` — ringkasan pembentuk total; dipakai di preview dan hasil.
- `ReceiptSummary` — nota cetak untuk hasil dan riwayat.
- `PrimaryActionBar` — aksi utama yang *sticky* dan kontekstual.
- `EmptyState` — pola empty state untuk peserta, item, dan riwayat.
- `ConfirmAction` — konfirmasi untuk aksi yang rawan salah tekan, khususnya hapus.

## Aturan Layout Desktop

- Lebar konten maksimum sekitar 1280–1440 px, dengan ruang kosong yang cukup.
- Pada **Catat**, tampilkan roster/profil sebagai panel kiri yang ringan, kartu peserta di area kerja utama, dan ringkasan total kecil yang tetap terlihat.
- Pada **Sesuaikan**, letakkan pengaturan di kiri dan preview perhitungan yang *sticky* di kanan.
- Pada **Tagih**, letakkan nota/total di kolom pertama dan kartu tagihan peserta serta aksi share di kolom utama.
- CTA primer harus ada di posisi yang konsisten: sisi kanan bawah alur kerja atau *action bar* sticky.

## Aturan Layout Mobile

- Gunakan satu kolom dengan target sentuh minimum 44–48 px.
- Bottom bar hanya berisi jumlah peserta/item, subtotal, dan satu CTA kontekstual.
- Jangan gunakan drawer untuk semua interaksi. Drawer cukup untuk pilihan singkat seperti pemilihan profil; pengisian item tetap berada di alur halaman.
- Saat keyboard terbuka, CTA tidak boleh menutup input harga terakhir.
- Tombol hapus item serta input harga tetap mudah disentuh tanpa membuat baris terlalu tinggi.
- Detail riwayat dibuka penuh agar fokus dan tombol kembali jelas.

## Detail Pengalaman yang Dipertahankan atau Dibenahi

- Alur tiga langkah tetap dipertahankan, tetapi tampilannya lebih sederhana daripada tab dashboard.
- Subtotal per peserta selalu terlihat setelah menambah item.
- Tombol “Tambah item” berada di dalam konteks kartu peserta, bukan sebagai aksi global yang ambigu.
- CTA “Hitung pembagian” tetap hanya aktif ketika ada item valid.
- Feedback setelah menyimpan riwayat tidak boleh menggeser layout secara drastis.
- Perbaiki semua teks dengan masalah encoding, misalnya karakter `â€”`, `âœ“`, dan `â†’`.

## Aksesibilitas dan Quality Bar

- Pastikan kontras teks, border, dan state disabled tetap terbaca di bawah cahaya terang.
- Gunakan nama/inisial selain warna untuk membedakan peserta.
- Fokus keyboard harus jelas; semua tombol ikon wajib punya `aria-label`.
- Hormati `prefers-reduced-motion`.
- Uji pada lebar 320, 375, 390, 768, 1024, 1280, dan 1440 px.
- Uji nama panjang, 15+ peserta, 30+ item, nominal besar, dan banyak biaya tambahan.

## Urutan Implementasi Aman

1. Bekukan perilaku dengan test atau screenshot untuk kasus perhitungan representatif.
2. Rapikan token warna, tipografi, spacing, border, dan state komponen.
3. Bangun komponen dasar tanpa menyentuh fungsi kalkulasi.
4. Terapkan ke alur Catat → Sesuaikan → Tagih.
5. Terapkan pola visual yang sama pada Riwayat.
6. Konsolidasikan tampilan desktop dan mobile agar tidak ada dua implementasi form yang mudah menyimpang.
7. Lakukan QA visual, keyboard, mobile keyboard, serta regression total perhitungan.
8. Setelah hasil nominal terbukti identik, lakukan polish kecil seperti animasi dan microcopy.

## Definition of Done

- Pengguna dapat mencatat nota dengan cepat di ponsel dan memeriksa rincian dengan nyaman di desktop.
- Tampilan konsisten di seluruh langkah dan halaman riwayat.
- Tidak ada unsur visual generik atau dekoratif yang tidak mendukung tugas pengguna.
- Semua nominal per peserta dan total akhir tetap persis sama dengan versi sebelum redesign.
