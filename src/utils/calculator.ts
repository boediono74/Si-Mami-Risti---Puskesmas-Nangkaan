import { PoedjiRochjatiItem, KategoriRisiko } from '../types/simami';

export const SKRINING_ITEMS: PoedjiRochjatiItem[] = [
  // KELOMPOK I: Ada Potensi Bahaya (Skor 4)
  {
    id: 'terlalu_muda',
    nomor: 1,
    label: 'Terlalu muda, hamil I ≤ 16 Tahun',
    skor: 4,
    kelompok: 'I',
    deskripsi: 'Rahim dan panggul belum tumbuh mencapai ukuran dewasa.',
    autoCheckField: 'umur_muda'
  },
  {
    id: 'terlalu_lambat_hamil',
    nomor: 2,
    label: 'Terlalu lambat hamil I, kawin ≥ 4 Tahun',
    skor: 4,
    kelompok: 'I',
    deskripsi: 'Kemungkinan ada kelainan organ reproduksi atau hormonal.'
  },
  {
    id: 'terlalu_tua_hamil_1',
    nomor: 3,
    label: 'Terlalu tua, hamil I ≥ 35 Tahun',
    skor: 4,
    kelompok: 'I',
    deskripsi: 'Kondisi kesehatan dan elastisitas jalan lahir mulai menurun.'
  },
  {
    id: 'terlalu_cepat_hamil',
    nomor: 4,
    label: 'Terlalu cepat hamil lagi (< 2 Tahun)',
    skor: 4,
    kelompok: 'I',
    deskripsi: 'Kondisi rahim belum pulih sepenuhnya dari kehamilan sebelumnya.'
  },
  {
    id: 'terlalu_lama_hamil',
    nomor: 5,
    label: 'Terlalu lama hamil lagi (≥ 10 Tahun)',
    skor: 4,
    kelompok: 'I',
    deskripsi: 'Kondisi kehamilan hampir sama dengan primigravida tua.'
  },
  {
    id: 'terlalu_banyak_anak',
    nomor: 6,
    label: 'Terlalu banyak anak, 4 anak atau lebih',
    skor: 4,
    kelompok: 'I',
    deskripsi: 'Dinding rahim menipis, risiko atonia uteri dan perdarahan.'
  },
  {
    id: 'terlalu_tua_umur',
    nomor: 7,
    label: 'Terlalu tua, umur ≥ 35 Tahun',
    skor: 4,
    kelompok: 'I',
    deskripsi: 'Peningkatan risiko hipertensi, diabetes gestasional, dan kelainan kromosom.',
    autoCheckField: 'umur_tua'
  },
  {
    id: 'terlalu_pendek',
    nomor: 8,
    label: 'Terlalu pendek (Tinggi Badan < 145 cm)',
    skor: 4,
    kelompok: 'I',
    deskripsi: 'Kecurigaan panggul sempit (Cephalopelvic Disproportion / CPD).',
    autoCheckField: 'tb_pendek'
  },
  {
    id: 'pernah_gagal_hamil',
    nomor: 9,
    label: 'Pernah gagal kehamilan (Keguguran / Abortus)',
    skor: 4,
    kelompok: 'I',
    deskripsi: 'Riwayat abortus sebelumnya meningkatkan risiko abortus berulang.'
  },
  {
    id: 'pernah_tarikan_tang_vakum',
    nomor: 10,
    label: 'Pernah melahirkan dengan tarikan tang / vakum',
    skor: 4,
    kelompok: 'I',
    deskripsi: 'Riwayat partus lama atau macet pada persalinan sebelumnya.'
  },
  {
    id: 'pernah_plasenta_manual',
    nomor: 11,
    label: 'Pernah melahirkan dengan uri dirogoh / plasenta manual',
    skor: 4,
    kelompok: 'I',
    deskripsi: 'Retensio plasenta atau perlengketan plasenta abnormal.'
  },
  {
    id: 'pernah_infus_transfusi',
    nomor: 12,
    label: 'Pernah melahirkan diberi infus / transfusi darah',
    skor: 4,
    kelompok: 'I',
    deskripsi: 'Riwayat perdarahan pasca persalinan (HPP) atau syok.'
  },
  {
    id: 'pernah_operasi_sesar',
    nomor: 13,
    label: 'Pernah Operasi Sesar (SC)',
    skor: 8,
    kelompok: 'I',
    deskripsi: 'Terdapat parut luka pada rahim, risiko ruptur uteri.'
  },

  // KELOMPOK II: Ada Bahaya (Skor 4 & 8)
  {
    id: 'penyakit_anemia',
    nomor: 14,
    label: 'Penyakit Ibu: Kurang Darah (Anemia)',
    skor: 4,
    kelompok: 'II',
    deskripsi: 'Hb < 11 gr%, risiko perdarahan, syok, dan BBLR.'
  },
  {
    id: 'penyakit_malaria',
    nomor: 15,
    label: 'Penyakit Ibu: Malaria',
    skor: 4,
    kelompok: 'II',
    deskripsi: 'Dapat menyebabkan anemia berat dan keguguran.'
  },
  {
    id: 'penyakit_tbc',
    nomor: 16,
    label: 'Penyakit Ibu: TBC Paru',
    skor: 4,
    kelompok: 'II',
    deskripsi: 'Batuk kronis, penurunan gizi ibu dan penularan.'
  },
  {
    id: 'penyakit_jantung',
    nomor: 17,
    label: 'Penyakit Ibu: Payah Jantung',
    skor: 4,
    kelompok: 'II',
    deskripsi: 'Beban hemodinamik meningkat saat hamil dan bersalin.'
  },
  {
    id: 'penyakit_diabetes',
    nomor: 18,
    label: 'Penyakit Ibu: Kencing Manis (Diabetes)',
    skor: 4,
    kelompok: 'II',
    deskripsi: 'Risiko makrosomia, cacat bawaan, preeklampsia.'
  },
  {
    id: 'penyakit_pms',
    nomor: 19,
    label: 'Penyakit Ibu: Menular Seksual (PMS)',
    skor: 4,
    kelompok: 'II',
    deskripsi: 'Sifilis, Gonore, HIV/AIDS risiko penularan vertikal ke janin.'
  },
  {
    id: 'bengkak_tensi_tinggi',
    nomor: 20,
    label: 'Bengkak pada muka / tungkai dan Tekanan Darah Tinggi',
    skor: 4,
    kelompok: 'II',
    deskripsi: 'Gejala preeklampsia ringan (TD ≥ 140/90 mmHg, edema).'
  },
  {
    id: 'hamil_kembar',
    nomor: 21,
    label: 'Hamil Kembar 2 (Gemelli) atau lebih',
    skor: 4,
    kelompok: 'II',
    deskripsi: 'Peregangan rahim berlebih, risiko prematuritas dan HPP.'
  },
  {
    id: 'hamil_kembar_air',
    nomor: 22,
    label: 'Hamil Kembar Air (Hydramnion)',
    skor: 4,
    kelompok: 'II',
    deskripsi: 'Cairan ketuban berlebih, curiga kelainan kongenital janin.'
  },
  {
    id: 'bayi_mati_kandungan',
    nomor: 23,
    label: 'Bayi Mati Dalam Kandungan (IUFD)',
    skor: 4,
    kelompok: 'II',
    deskripsi: 'Kematian janin intrauterin, risiko gangguan koagulasi.'
  },
  {
    id: 'hamil_lebih_bulan',
    nomor: 24,
    label: 'Kehamilan Lebih Bulan (Serotinus / Postterm)',
    skor: 4,
    kelompok: 'II',
    deskripsi: 'Usia kehamilan > 42 minggu, fungsi plasenta menurun.'
  },
  {
    id: 'letak_sungsang',
    nomor: 25,
    label: 'Letak Sungsang',
    skor: 8,
    kelompok: 'II',
    deskripsi: 'Presentasi bokong / kaki, risiko trauma jalan lahir & after-coming head.'
  },
  {
    id: 'letak_lintang',
    nomor: 26,
    label: 'Letak Lintang',
    skor: 8,
    kelompok: 'II',
    deskripsi: 'Janin melintang, persalinan per vaginam tidak dimungkinkan.'
  },

  // KELOMPOK III: Ada Bahaya Sangat Besar (Skor 8)
  {
    id: 'perdarahan_antepartum',
    nomor: 27,
    label: 'Perdarahan dalam kehamilan ini (Antepartum)',
    skor: 8,
    kelompok: 'III',
    deskripsi: 'Kemungkinan Plasenta Previa atau Solusio Plasenta.'
  },
  {
    id: 'preeklampsia_berat',
    nomor: 28,
    label: 'Preeklampsia Berat (PEB) / Kejang-kejang (Eklampsi)',
    skor: 8,
    kelompok: 'III',
    deskripsi: 'Tekanan darah ≥ 160/110 mmHg, protein urin +++, kejang darurat obstetri.'
  }
];

// Hitung IMT
export function hitungIMT(bbKg: number, tbCm: number): { imt: number; status: 'Kurus' | 'Normal' | 'Kelebihan BB' | 'Obesitas' } {
  if (!bbKg || !tbCm || tbCm <= 0) {
    return { imt: 0, status: 'Normal' };
  }
  const tinggiMeter = tbCm / 100;
  const imtVal = parseFloat((bbKg / (tinggiMeter * tinggiMeter)).toFixed(2));
  
  let status: 'Kurus' | 'Normal' | 'Kelebihan BB' | 'Obesitas' = 'Normal';
  if (imtVal < 18.5) {
    status = 'Kurus';
  } else if (imtVal >= 18.5 && imtVal < 25.0) {
    status = 'Normal';
  } else if (imtVal >= 25.0 && imtVal < 30.0) {
    status = 'Kelebihan BB';
  } else {
    status = 'Obesitas';
  }
  
  return { imt: imtVal, status };
}

// Rumus Naegele untuk menghitung TTP (Tafsiran Tanggal Persalinan) dari HPHT
export function hitungTTP(hphtStr: string): string {
  if (!hphtStr) return '';
  try {
    const parts = hphtStr.split('-');
    if (parts.length !== 3) return '';
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // 0-indexed
    const day = parseInt(parts[2], 10);
    
    const hphtDate = new Date(year, month, day);
    if (isNaN(hphtDate.getTime())) return '';
    
    // Naegele: + 280 hari (40 minggu)
    const ttpDate = new Date(hphtDate);
    ttpDate.setDate(ttpDate.getDate() + 280);
    
    const y = ttpDate.getFullYear();
    const m = String(ttpDate.getMonth() + 1).padStart(2, '0');
    const d = String(ttpDate.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  } catch {
    return '';
  }
}

// Hitung Usia Kehamilan dalam Minggu
export function hitungUsiaKehamilan(hphtStr: string): number {
  if (!hphtStr) return 0;
  try {
    const parts = hphtStr.split('-');
    if (parts.length !== 3) return 0;
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    
    const hphtDate = new Date(year, month, day);
    const today = new Date();
    const diffTime = today.getTime() - hphtDate.getTime();
    if (diffTime < 0) return 0;
    
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.floor(diffDays / 7);
  } catch {
    return 0;
  }
}

// Hitung Total Skor Poedji Rochjati & Kategori
export function hitungSkorRisiko(jawaban: Record<string, boolean>): {
  totalSkor: number;
  kategoriRisiko: KategoriRisiko;
  warnaRisiko: 'hijau' | 'kuning' | 'merah';
  labelKategori: string;
  rekomendasi: {
    tempat: string;
    penolong: string;
    rujukan: string;
  };
} {
  // Skor Awal selalu 2
  let skor = 2;

  SKRINING_ITEMS.forEach((item) => {
    if (jawaban[item.id]) {
      skor += item.skor;
    }
  });

  let kategoriRisiko: KategoriRisiko = 'KRR';
  let warnaRisiko: 'hijau' | 'kuning' | 'merah' = 'hijau';
  let labelKategori = 'Kehamilan Risiko Rendah (KRR)';
  let rekomendasi = {
    tempat: 'Puskesmas / Polindes / Bidan Praktik Mandiri (BPM)',
    penolong: 'Bidan atau Dokter Umum Puskesmas',
    rujukan: 'Tidak perlu rujukan darurat, pemantauan berkala ANC terpadu'
  };

  if (skor === 2) {
    kategoriRisiko = 'KRR';
    warnaRisiko = 'hijau';
    labelKategori = 'Kehamilan Risiko Rendah (KRR)';
    rekomendasi = {
      tempat: 'Puskesmas Nangkaan / Poskesdes',
      penolong: 'Bidan / Dokter Puskesmas',
      rujukan: 'Dapat bersalin di fasilitas kesehatan tingkat pertama (FKTP)'
    };
  } else if (skor >= 6 && skor <= 10) {
    kategoriRisiko = 'KRT';
    warnaRisiko = 'kuning';
    labelKategori = 'Kehamilan Risiko Tinggi (KRT)';
    rekomendasi = {
      tempat: 'Puskesmas PONED / Rumah Sakit Umum Bondowoso',
      penolong: 'Bidan Terlatih & Dokter Spesialis Obsgyn / SpOG',
      rujukan: 'Rujukan terencana / Konsultasi SpOG di RSUD Koesnadi Bondowoso'
    };
  } else if (skor >= 12) {
    kategoriRisiko = 'KRST';
    warnaRisiko = 'merah';
    labelKategori = 'Kehamilan Risiko Sangat Tinggi (KRST)';
    rekomendasi = {
      tempat: 'Rumah Sakit Rujukan (RSUD Dr. H. Koesnadi Bondowoso)',
      penolong: 'Dokter Spesialis Obstetri & Ginekologi (SpOG) Tim Medis RS',
      rujukan: 'Wajib Rujukan Dini Berencana (RDB) atau Rujukan Segera / Emergensi'
    };
  }

  return {
    totalSkor: skor,
    kategoriRisiko,
    warnaRisiko,
    labelKategori,
    rekomendasi
  };
}
