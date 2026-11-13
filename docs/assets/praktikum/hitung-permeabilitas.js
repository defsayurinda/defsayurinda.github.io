/*
 * Koefisien permeabilitas (rembesan) di laboratorium, mengikuti form Mekanika Tanah UNJA.
 *
 * Tinggi tekan tetap (constant head, ASTM D2434):
 *   A = ¼ π D²                       (1)
 *   q = Q / t                        (2)  debit, Q = volume air tertampung selama t
 *   k = q · L / (A · h)              (3)  hukum Darcy, i = h / L
 *
 * Tinggi tekan turun (falling head, ASTM D5084 / form lab):
 *   a = ¼ π d²,  A = ¼ π D²          (1)
 *   k = (a · L) / (A · t) · ln(h1 / h2)   (2)  = 2,303 a L /(A t) · log(h1/h2)
 *
 * Sumber rumus: Das, B. M. Principles of Geotechnical Engineering, bab Permeability
 * (uji tinggi tekan tetap dan tinggi tekan turun); Hardiyatmo, H. C. Mekanika Tanah I,
 * bab Permeabilitas. Halaman belum dicatat: [BELUM TERVERIFIKASI].
 * k dilaporkan pada suhu uji; koreksi viskositas ke 20 °C tidak dilakukan.
 */
(function (root) {
  'use strict';

  function luas(d) { return Math.PI * d * d / 4; }
  function rata(x) { return x.reduce(function (a, b) { return a + b; }, 0) / x.length; }

  function bendaUji(m, galat) {
    if (!(m.D > 0)) galat.push('Diameter dalam permeameter D harus lebih dari 0.');
    if (!(m.L > 0)) galat.push('Tinggi benda uji L harus lebih dari 0.');
    var A = luas(m.D), hasil = { A: A, V: A * m.L };
    if (m.W1 > 0 && m.W2 > 0) {
      if (!(m.W2 > m.W1)) galat.push('W2 (permeameter + benda uji) harus lebih besar dari W1.');
      hasil.W = m.W2 - m.W1;
      hasil.gamma = hasil.W / hasil.V; // g/cm³
    }
    return hasil;
  }

  function sebaran(uji, peringatan) {
    var nilai = uji.map(function (u) { return u.k; });
    var k = rata(nilai), maks = Math.max.apply(null, nilai), min = Math.min.apply(null, nilai);
    if (uji.length > 1 && (maks - min) > 0.2 * k) {
      peringatan.push('Selisih k antarpercobaan lebih dari 20% nilai rata-rata. Periksa kejenuhan benda uji, kebocoran di dinding permeameter, atau pembacaan waktu.');
    }
    return k;
  }

  function tetap(m) {
    var galat = [], peringatan = [];
    var b = bendaUji(m, galat);
    var uji = (m.uji || []).map(function (u) {
      if (!(u.h > 0)) galat.push('Percobaan ' + u.nama + ': beda tinggi tekan h harus lebih dari 0.');
      if (!(u.Q > 0)) galat.push('Percobaan ' + u.nama + ': volume air Q harus lebih dari 0.');
      if (!(u.t > 0)) galat.push('Percobaan ' + u.nama + ': waktu t harus lebih dari 0.');
      var q = u.Q / u.t;
      return Object.assign({}, u, { q: q, i: u.h / m.L, k: q * m.L / (b.A * u.h) });
    });
    if (!uji.length) galat.push('Isi data minimal satu percobaan.');
    if (galat.length) return { galat: galat };
    return Object.assign({ galat: [], peringatan: peringatan, uji: uji, k: sebaran(uji, peringatan) }, b);
  }

  function turun(m) {
    var galat = [], peringatan = [];
    if (!(m.d > 0)) galat.push('Diameter dalam buret d harus lebih dari 0.');
    var b = bendaUji(m, galat), a = luas(m.d);
    var uji = (m.uji || []).map(function (u) {
      if (!(u.h1 > 0 && u.h2 > 0)) galat.push('Percobaan ' + u.nama + ': h1 dan h2 harus lebih dari 0.');
      else if (!(u.h1 > u.h2)) galat.push('Percobaan ' + u.nama + ': h1 (awal) harus lebih besar dari h2 (akhir).');
      if (!(u.t > 0)) galat.push('Percobaan ' + u.nama + ': waktu t harus lebih dari 0.');
      var ln = Math.log(u.h1 / u.h2);
      return Object.assign({}, u, { ln: ln, k: a * m.L / (b.A * u.t) * ln });
    });
    if (!uji.length) galat.push('Isi data minimal satu percobaan.');
    if (galat.length) return { galat: galat };
    return Object.assign({ galat: [], peringatan: peringatan, uji: uji, a: a, k: sebaran(uji, peringatan) }, b);
  }

  var api = { luas: luas, tetap: tetap, turun: turun };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.HitungPermeabilitas = api;
})(this);
