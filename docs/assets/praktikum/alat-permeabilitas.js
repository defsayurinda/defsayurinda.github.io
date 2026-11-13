/* Definisi alat: permeabilitas tinggi tekan tetap dan tinggi tekan turun. Halaman memilih lewat data-alat. */
(function () {
  'use strict';

  var H = window.HitungPermeabilitas, jenis = document.getElementById('alat-praktikum').dataset.alat;
  var f = Umum.f;

  // k sangat kecil: tulis a × 10^n (HTML dan TeX).
  function pangkat(v) { var n = Math.floor(Math.log10(Math.abs(v))); return { a: v / Math.pow(10, n), n: n }; }
  function sci(v) {
    if (!isFinite(v) || v === 0) return f(v, 3);
    var p = pangkat(v), sup = String(p.n).replace(/-/g, '⁻').replace(/\d/g, function (c) { return '⁰¹²³⁴⁵⁶⁷⁸⁹'[c]; });
    return f(p.a, 2) + ' × 10' + sup;
  }
  function sciT(v) { var p = pangkat(v); return Umum.t(p.a, 2) + '\\times 10^{' + p.n + '}'; }

  function barisKolom(daftar, uraian, simbol, satuan, ambil, d) {
    return [uraian, simbol, satuan].concat(daftar.map(function (x) { var v = ambil(x); return typeof v === 'string' ? v : f(v, d); }));
  }
  function kepalaKolom(daftar) { return ['Uraian', 'Simbol', 'Satuan'].concat(daftar.map(function (x) { return 'Percobaan ' + x.nama; })); }

  var PARAM_BENDA = [
    { id: 'D', label: 'Diameter dalam permeameter, D', satuan: 'cm' },
    { id: 'L', label: 'Tinggi benda uji, L', satuan: 'cm' },
    { id: 'W1', label: 'Berat permeameter + batu pori + kertas saring, W<sub>1</sub>', satuan: 'gram', bantuan: 'Opsional. Bersama W<sub>2</sub> dipakai untuk berat dan berat isi benda uji.' },
    { id: 'W2', label: 'Berat permeameter + batu pori + kertas saring + benda uji, W<sub>2</sub>', satuan: 'gram', bantuan: 'Opsional.' }];

  function tabelBenda(m, r, tambahan) {
    var b = (tambahan || []).concat([
      ['Diameter dalam permeameter', 'D', 'cm', f(m.param.D, 2)],
      ['Luas penampang benda uji', 'A = ¼ π D²', 'cm²', f(r.A, 3)],
      ['Tinggi benda uji', 'L', 'cm', f(m.param.L, 2)],
      ['Volume benda uji', 'V = A · L', 'cm³', f(r.V, 3)]]);
    if (r.W !== undefined) {
      b.push(['Berat permeameter + batu pori + kertas saring', 'W<sub>1</sub>', 'gram', f(m.param.W1, 3)],
        ['Berat permeameter + batu pori + kertas saring + benda uji', 'W<sub>2</sub>', 'gram', f(m.param.W2, 3)],
        ['Berat benda uji', 'W<sub>2</sub> − W<sub>1</sub>', 'gram', f(r.W, 3)],
        ['Berat isi basah benda uji', 'γ = W / V', 'g/cm³', f(r.gamma, 3)]);
    }
    return '<h3>A. Data alat dan benda uji</h3>' + U0tabel(['Uraian', 'Simbol', 'Satuan', 'Nilai'], b);
  }
  var U0tabel; // diisi dari U saat tampil

  function langkahLuas(U, nama, simbol, d, luas) {
    return U.langkah(nama, U.rumus(simbol + ' = \\tfrac{1}{4}\\,\\pi\\,' + (simbol === 'a' ? 'd' : 'D') + '^2 = \\tfrac{1}{4}\\times 3{,}1416 \\times ' + U.t(d, 2) + '^2 = ' + U.t(luas, 3) + '\\ \\text{cm}^2'));
  }

  function langkahBerat(U, m, r) {
    if (r.W === undefined) return '';
    return U.langkah('Berat isi basah benda uji',
      U.rumus('W = W_2 - W_1 = ' + U.t(m.param.W2, 3) + ' - ' + U.t(m.param.W1, 3) + ' = ' + U.t(r.W, 3) + '\\ \\text{gram}') +
      U.rumus('\\gamma = \\dfrac{W}{A\\,L} = \\dfrac{' + U.t(r.W, 3) + '}{' + U.t(r.A, 3) + '\\times' + U.t(m.param.L, 2) + '} = ' + U.t(r.gamma, 3) + '\\ \\text{g/cm}^3'));
  }

  function rataLangkah(U, r) {
    if (r.uji.length < 2) return '';
    return U.langkah('Koefisien permeabilitas rata-rata',
      U.rumus('\\bar{k} = \\dfrac{' + r.uji.map(function (u) { return sciT(u.k); }).join(' + ') + '}{' + r.uji.length + '} = ' + sciT(r.k) + '\\ \\text{cm/det}'));
  }

  function ringkas(U, r, ket) {
    return U.ringkasan([
      U.kartu('Koefisien permeabilitas rata-rata', sci(r.k) + ' <small>cm/det</small>', r.uji.length + ' percobaan · ' + ket),
      U.kartu('Dalam m/det', sci(r.k / 100) + ' <small>m/det</small>', 'k (cm/det) ÷ 100')]);
  }

  var CATATAN_SUHU = '<p class="kecil redup">k dilaporkan pada suhu air saat uji. Koreksi viskositas ke 20 °C seperti di ASTM tidak dilakukan; tambahkan secara manual bila diminta asisten. ' +
    'Luas dihitung dengan π penuh (3,14159…), sehingga hasil bisa sedikit berbeda dari hitungan tangan yang memakai π = 3,14.</p>';

  if (jenis === 'permeabilitas-tetap') {
    Praktikum.pasang({
      id: 'permeabilitas-tetap', judulEkspor: 'Pemeriksaan permeabilitas, constant head test (ASTM D2434)',
      parameter: PARAM_BENDA,
      tabel: [{ id: 'uji', judul: 'B. Data pembacaan', kolom: 'Percobaan', awal: 3, min: 1, maks: 6, baris: [
        { id: 'h', label: 'Beda tinggi muka air masuk dan keluar (tinggi tekan tetap)', simbol: 'h', satuan: 'cm' },
        { id: 'Q', label: 'Volume air tertampung di gelas ukur', simbol: 'Q', satuan: 'cm³' },
        { id: 't', label: 'Waktu penampungan', simbol: 't', satuan: 'detik' },
        { id: 'T', label: 'Suhu air', simbol: 'T', satuan: '°C', opsional: true }],
        keterangan: 'Bila memakai manometer, h = selisih bacaan manometer dan L = jarak antartitik manometer. 1 ml = 1 cm³.' }],
      contoh: { param: { D: 6.4, L: 6, W1: '', W2: '' }, tabel: { uji: [
        { nama: '1', h: 70, Q: 99, t: 30, T: '' }, { nama: '2', h: 70, Q: 105, t: 30, T: '' }, { nama: '3', h: 70, Q: 96, t: 30, T: '' }] } },
      kosong: { param: { D: '', L: '', W1: '', W2: '' } },
      hitung: function (m) { var p = m.param; return H.tetap({ D: p.D, L: p.L, W1: p.W1, W2: p.W2, uji: m.tabel.uji }); },
      hasil: function (m, r) { return { k: r.k }; },
      tampil: function (m, r, U) {
        U0tabel = U.tabel;
        var u = r.uji, u1 = u[0], L = m.param.L;
        return ringkas(U, r, 'tinggi tekan tetap') +
          tabelBenda(m, r) +
          '<h3>B. Data pembacaan dan hasil</h3>' + U.tabel(kepalaKolom(u), [
            barisKolom(u, 'Beda tinggi tekan', 'h', 'cm', function (x) { return x.h; }, 2),
            barisKolom(u, 'Volume air tertampung', 'Q', 'cm³', function (x) { return x.Q; }, 2),
            barisKolom(u, 'Waktu penampungan', 't', 'detik', function (x) { return x.t; }, 2),
            barisKolom(u, 'Suhu air', 'T', '°C', function (x) { return x.T === null ? '–' : f(x.T, 1); }),
            barisKolom(u, 'Debit', 'q = Q / t', 'cm³/det', function (x) { return x.q; }, 3),
            barisKolom(u, 'Gradien hidrolik', 'i = h / L', '–', function (x) { return x.i; }, 3),
            barisKolom(u, 'Koefisien permeabilitas', 'k', 'cm/det', function (x) { return sci(x.k); })]) +
          '<h3>Langkah hitungan (percobaan ' + u1.nama + ')</h3>' +
          langkahLuas(U, 'a. Luas penampang benda uji', 'A', m.param.D, r.A) +
          U.langkah('b. Debit air', U.rumus('q = \\dfrac{Q}{t} \\qquad (1)') +
            U.rumus('q = \\dfrac{' + U.t(u1.Q, 2) + '}{' + U.t(u1.t, 2) + '} = ' + U.t(u1.q, 3) + '\\ \\text{cm}^3/\\text{det}') +
            '<p class="ket">Q = volume air tertampung (cm³); t = waktu penampungan (detik).</p>') +
          U.langkah('c. Koefisien permeabilitas', U.rumus('k = \\dfrac{q\\,L}{A\\,h} \\qquad (2)') +
            U.rumus('k = \\dfrac{' + U.t(u1.q, 3) + '\\times' + U.t(L, 2) + '}{' + U.t(r.A, 3) + '\\times' + U.t(u1.h, 2) + '} = ' + sciT(u1.k) + '\\ \\text{cm/det}') +
            '<p class="ket">k = koefisien permeabilitas (cm/det); L = tinggi benda uji (cm); A = luas penampang benda uji (cm²); h = beda tinggi tekan (cm). Persamaan (2) berasal dari hukum Darcy q = k i A dengan i = h / L.</p>') +
          rataLangkah(U, r) + langkahBerat(U, m, r) + CATATAN_SUHU;
      },
      ekspor: function (m, r) {
        var u = r.uji;
        return [['Diameter permeameter D', 'cm', m.param.D], ['Luas A', 'cm2', r.A], ['Tinggi benda uji L', 'cm', m.param.L], [],
          ['Uraian', 'Satuan'].concat(u.map(function (x) { return 'Percobaan ' + x.nama; }))]
          .concat([['Beda tinggi tekan h', 'cm', 'h'], ['Volume air Q', 'cm3', 'Q'], ['Waktu t', 'detik', 't'], ['Suhu air T', '°C', 'T'],
            ['Debit q = Q/t', 'cm3/det', 'q'], ['Gradien i = h/L', '-', 'i'], ['Koefisien permeabilitas k', 'cm/det', 'k']]
            .map(function (b) { return [b[0], b[1]].concat(u.map(function (x) { return x[b[2]]; })); }))
          .concat([[], ['k rata-rata', 'cm/det', r.k]]);
      },
      sumber: ['ASTM D2434. <em>Standard Test Method for Permeability of Granular Soils (Constant Head)</em>.',
        'Das, B. M. <em>Principles of Geotechnical Engineering</em>, bab Permeability (uji tinggi tekan tetap). [BELUM TERVERIFIKASI: halaman]',
        'Hardiyatmo, H. C. <em>Mekanika Tanah I</em>. Gadjah Mada University Press, bab Permeabilitas. [BELUM TERVERIFIKASI: halaman]',
        'Form pemeriksaan permeabilitas, Laboratorium Mekanika Tanah, Teknik Sipil Universitas Jambi.']
    });
  }

  if (jenis === 'permeabilitas-turun') {
    Praktikum.pasang({
      id: 'permeabilitas-turun', judulEkspor: 'Pemeriksaan permeabilitas, falling head test (ASTM D5084)',
      parameter: [{ id: 'd', label: 'Diameter dalam buret, d', satuan: 'cm' }].concat(PARAM_BENDA),
      tabel: [{ id: 'uji', judul: 'B. Data pembacaan', kolom: 'Percobaan', awal: 3, min: 1, maks: 6, baris: [
        { id: 'h1', label: 'Tinggi muka air awal pada buret, dari ujung bawah benda uji', simbol: 'h<sub>1</sub>', satuan: 'cm' },
        { id: 'h2', label: 'Tinggi muka air akhir pada buret, dari ujung bawah benda uji', simbol: 'h<sub>2</sub>', satuan: 'cm' },
        { id: 't', label: 'Waktu penurunan muka air dari h₁ ke h₂', simbol: 't', satuan: 'detik' },
        { id: 'T', label: 'Suhu air dalam buret', simbol: 'T', satuan: '°C', opsional: true }],
        keterangan: 'Sesuai catatan form: h₁ dan h₂ diambil sama pada ketiga percobaan, dan benda uji dijenuhkan dahulu.' }],
      contoh: { param: { d: 1, D: 6.4, L: 6, W1: '', W2: '' }, tabel: { uji: [
        { nama: '1', h1: 100, h2: 50, t: 420, T: '' }, { nama: '2', h1: 100, h2: 50, t: 435, T: '' }, { nama: '3', h1: 100, h2: 50, t: 428, T: '' }] } },
      kosong: { param: { d: '', D: '', L: '', W1: '', W2: '' } },
      hitung: function (m) { var p = m.param; return H.turun({ d: p.d, D: p.D, L: p.L, W1: p.W1, W2: p.W2, uji: m.tabel.uji }); },
      hasil: function (m, r) { return { k: r.k }; },
      tampil: function (m, r, U) {
        U0tabel = U.tabel;
        var u = r.uji, u1 = u[0], L = m.param.L;
        return ringkas(U, r, 'tinggi tekan turun') +
          tabelBenda(m, r, [['Diameter dalam buret', 'd', 'cm', f(m.param.d, 2)], ['Luas penampang buret', 'a = ¼ π d²', 'cm²', f(r.a, 4)]]) +
          '<h3>B. Data pembacaan dan hasil</h3>' + U.tabel(kepalaKolom(u), [
            barisKolom(u, 'Tinggi muka air awal', 'h<sub>1</sub>', 'cm', function (x) { return x.h1; }, 2),
            barisKolom(u, 'Tinggi muka air akhir', 'h<sub>2</sub>', 'cm', function (x) { return x.h2; }, 2),
            barisKolom(u, 'Waktu penurunan', 't', 'detik', function (x) { return x.t; }, 2),
            barisKolom(u, 'Suhu air', 'T', '°C', function (x) { return x.T === null ? '–' : f(x.T, 1); }),
            barisKolom(u, 'ln (h₁ / h₂)', '–', '–', function (x) { return x.ln; }, 4),
            barisKolom(u, 'Koefisien permeabilitas', 'k', 'cm/det', function (x) { return sci(x.k); })]) +
          '<h3>Langkah hitungan (percobaan ' + u1.nama + ')</h3>' +
          langkahLuas(U, 'a. Luas penampang buret', 'a', m.param.d, r.a) +
          langkahLuas(U, 'b. Luas penampang benda uji', 'A', m.param.D, r.A) +
          U.langkah('c. Koefisien permeabilitas', U.rumus('k = \\dfrac{a\\,L}{A\\,t}\\,\\ln\\dfrac{h_1}{h_2} = 2{,}303\\,\\dfrac{a\\,L}{A\\,t}\\,\\log\\dfrac{h_1}{h_2} \\qquad (1)') +
            U.rumus('k = \\dfrac{' + U.t(r.a, 4) + '\\times' + U.t(L, 2) + '}{' + U.t(r.A, 3) + '\\times' + U.t(u1.t, 2) + '}\\times\\ln\\dfrac{' + U.t(u1.h1, 2) + '}{' + U.t(u1.h2, 2) + '} = ' + sciT(u1.k) + '\\ \\text{cm/det}') +
            '<p class="ket">a = luas penampang buret (cm²); A = luas penampang benda uji (cm²); L = tinggi benda uji (cm); t = waktu penurunan muka air dari h<sub>1</sub> ke h<sub>2</sub> (detik); h<sub>1</sub>, h<sub>2</sub> = tinggi muka air awal dan akhir, diukur dari ujung bawah benda uji (cm).</p>') +
          rataLangkah(U, r) + langkahBerat(U, m, r) + CATATAN_SUHU;
      },
      ekspor: function (m, r) {
        var u = r.uji;
        return [['Diameter buret d', 'cm', m.param.d], ['Luas buret a', 'cm2', r.a], ['Diameter permeameter D', 'cm', m.param.D], ['Luas A', 'cm2', r.A], ['Tinggi benda uji L', 'cm', m.param.L], [],
          ['Uraian', 'Satuan'].concat(u.map(function (x) { return 'Percobaan ' + x.nama; }))]
          .concat([['Tinggi awal h1', 'cm', 'h1'], ['Tinggi akhir h2', 'cm', 'h2'], ['Waktu t', 'detik', 't'], ['Suhu air T', '°C', 'T'],
            ['ln(h1/h2)', '-', 'ln'], ['Koefisien permeabilitas k', 'cm/det', 'k']]
            .map(function (b) { return [b[0], b[1]].concat(u.map(function (x) { return x[b[2]]; })); }))
          .concat([[], ['k rata-rata', 'cm/det', r.k]]);
      },
      sumber: ['ASTM D5084. <em>Standard Test Methods for Measurement of Hydraulic Conductivity of Saturated Porous Materials Using a Flexible Wall Permeameter</em>.',
        'Das, B. M. <em>Principles of Geotechnical Engineering</em>, bab Permeability (uji tinggi tekan turun). [BELUM TERVERIFIKASI: halaman]',
        'Hardiyatmo, H. C. <em>Mekanika Tanah I</em>. Gadjah Mada University Press, bab Permeabilitas. [BELUM TERVERIFIKASI: halaman]',
        'Form pemeriksaan permeabilitas, Laboratorium Mekanika Tanah, Teknik Sipil Universitas Jambi.']
    });
  }
})();
