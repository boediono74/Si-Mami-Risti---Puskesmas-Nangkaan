export type DesaName = 
  | 'Kelurahan Nangkaan' 
  | 'Kelurahan Badean' 
  | 'Desa Pancoran' 
  | 'Desa Kembang' 
  | 'Desa Sukowiryo';

export interface DesaInfo {
  name: DesaName;
  wilayahLengkap: string;
  kecamatan: string;
  kabupaten: string;
  waLink: string;
  lat: number;
  lng: number;
  radius: number; // in meters for map boundary circle
  color: string;
  fillColor: string;
  penanggungJawab: string;
  kontakBidan: string;
}

export const DAFTAR_DESA: Record<DesaName, DesaInfo> = {
  'Kelurahan Nangkaan': {
    name: 'Kelurahan Nangkaan',
    wilayahLengkap: 'Kelurahan Nangkaan Kecamatan Bondowoso Kabupaten Bondowoso',
    kecamatan: 'Kecamatan Bondowoso',
    kabupaten: 'Kabupaten Bondowoso',
    waLink: 'https://chat.whatsapp.com/LkGTW7fgAe0IrXoN9rqPIq',
    lat: -7.9280,
    lng: 113.8115,
    radius: 950,
    color: '#059669',
    fillColor: '#10b981',
    penanggungJawab: 'Diana Yuli Aidhasari, A.Md. Keb.',
    kontakBidan: '081259458886'
  },
  'Kelurahan Badean': {
    name: 'Kelurahan Badean',
    wilayahLengkap: 'Kelurahan Badean Kecamatan Bondowoso Kabupaten Bondowoso',
    kecamatan: 'Kecamatan Bondowoso',
    kabupaten: 'Kabupaten Bondowoso',
    waLink: 'https://chat.whatsapp.com/Inb7FrcYUtsLfvtOIKv3xm',
    lat: -7.9165,
    lng: 113.8160,
    radius: 900,
    color: '#0284c7',
    fillColor: '#38bdf8',
    penanggungJawab: 'Anggun Dwi Cahyaningtyas, A.Md. Keb.',
    kontakBidan: '082302153753'
  },
  'Desa Pancoran': {
    name: 'Desa Pancoran',
    wilayahLengkap: 'Desa Pancoran Kecamatan Bondowoso Kabupaten Bondowoso',
    kecamatan: 'Kecamatan Bondowoso',
    kabupaten: 'Kabupaten Bondowoso',
    waLink: 'https://chat.whatsapp.com/CScYBdn8A2GCveHeSMoIwK',
    lat: -7.9607174,
    lng: 113.8079057,
    radius: 1200,
    color: '#7c3aed',
    fillColor: '#a78bfa',
    penanggungJawab: 'Nicky Pristanti Widyasari, A.Md. Keb.',
    kontakBidan: '082332919486'
  },
  'Desa Kembang': {
    name: 'Desa Kembang',
    wilayahLengkap: 'Desa Kembang Kecamatan Bondowoso Kabupaten Bondowoso',
    kecamatan: 'Kecamatan Bondowoso',
    kabupaten: 'Kabupaten Bondowoso',
    waLink: 'https://chat.whatsapp.com/G4LEFhtxvkf7wtpeh6dC2U',
    lat: -7.9403,
    lng: 113.8014,
    radius: 1150,
    color: '#ea580c',
    fillColor: '#fb923c',
    penanggungJawab: 'Suyatmi, A.Md. Keb.',
    kontakBidan: '08123456359'
  },
  'Desa Sukowiryo': {
    name: 'Desa Sukowiryo',
    wilayahLengkap: 'Desa Sukowiryo Kecamatan Bondowoso Kabupaten Bondowoso',
    kecamatan: 'Kecamatan Bondowoso',
    kabupaten: 'Kabupaten Bondowoso',
    waLink: 'https://chat.whatsapp.com/EXmVtZAj4FA0oxwSd0raCS',
    lat: -7.9444,
    lng: 113.8153,
    radius: 1050,
    color: '#0d9488',
    fillColor: '#2dd4bf',
    penanggungJawab: 'Ninin Wahyuni, A.Md. Keb.',
    kontakBidan: '083847383560'
  }
};

export function normalizeDesaName(desa: string): DesaName {
  if (desa === 'Nangkaan' || desa === 'Kelurahan Nangkaan') return 'Kelurahan Nangkaan';
  if (desa === 'Badean' || desa === 'Kelurahan Badean') return 'Kelurahan Badean';
  if (desa === 'Pancoran' || desa === 'Desa Pancoran') return 'Desa Pancoran';
  if (desa === 'Kembang' || desa === 'Desa Kembang') return 'Desa Kembang';
  if (desa === 'Sukowiryo' || desa === 'Sukwiryo' || desa === 'Desa Sukowiryo') return 'Desa Sukowiryo';
  return 'Kelurahan Nangkaan';
}

export type KategoriRisiko = 'KRR' | 'KRT' | 'KRST';
// KRR: Kehamilan Risiko Rendah (Hijau)
// KRT: Kehamilan Risiko Tinggi (Kuning)
// KRST: Kehamilan Risiko Sangat Tinggi (Merah)

export interface PoedjiRochjatiItem {
  id: string;
  nomor: number;
  label: string;
  skor: number;
  kelompok: 'I' | 'II' | 'III';
  deskripsi?: string;
  autoCheckField?: 'umur_muda' | 'umur_tua' | 'tb_pendek';
}

// 11 Indikator Pemeriksaan Nakes
export type PemeriksaanNakesKey = 
  | 'komplikasiKebidanan'
  | 'kek'
  | 'anemia'
  | 'preEklampsi'
  | 'infeksi'
  | 'malaria'
  | 'hiv'
  | 'sifilis'
  | 'hepatitisB'
  | 'hipertensi'
  | 'diabetesMellitus';

export interface PemeriksaanNakesItemDef {
  key: PemeriksaanNakesKey;
  label: string;
  singkatan: string;
  deskripsi: string;
  kategori: 'kebidanan' | 'gizi' | 'darah' | 'infeksi' | 'penyakit_dalam';
  colorBadge: string;
}

export const DAFTAR_PEMERIKSAAN_NAKES: PemeriksaanNakesItemDef[] = [
  { 
    key: 'komplikasiKebidanan', 
    label: 'Komplikasi Kebidanan', 
    singkatan: 'Komp. Kebidanan',
    deskripsi: 'Pendarahan, letak lintang/sungsang, KPD, riwayat SC, penyulit obstetri',
    kategori: 'kebidanan',
    colorBadge: 'bg-rose-100 text-rose-800 border-rose-300'
  },
  { 
    key: 'kek', 
    label: 'KEK', 
    singkatan: 'KEK',
    deskripsi: 'Kekurangan Energi Kronis (LiLA < 23.5 cm)',
    kategori: 'gizi',
    colorBadge: 'bg-amber-100 text-amber-800 border-amber-300'
  },
  { 
    key: 'anemia', 
    label: 'Anemia', 
    singkatan: 'Anemia',
    deskripsi: 'Kadar Hb < 11 g/dL (Trimester 1 & 3) atau < 10.5 g/dL (Trimester 2)',
    kategori: 'darah',
    colorBadge: 'bg-rose-100 text-rose-800 border-rose-300'
  },
  { 
    key: 'preEklampsi', 
    label: 'Pre Eklampsi / Eklampsi', 
    singkatan: 'Pre Eklampsi / Eklampsi',
    deskripsi: 'Hipertensi kehamilan (TD ≥ 140/90 mmHg) + proteinuria atau gejala penyerta',
    kategori: 'kebidanan',
    colorBadge: 'bg-purple-100 text-purple-800 border-purple-300'
  },
  { 
    key: 'infeksi', 
    label: 'Infeksi', 
    singkatan: 'Infeksi',
    deskripsi: 'Infeksi Saluran Kemih (ISK), TORCH, TBC, atau infeksi sistemik aktif',
    kategori: 'infeksi',
    colorBadge: 'bg-orange-100 text-orange-800 border-orange-300'
  },
  { 
    key: 'malaria', 
    label: 'Malaria', 
    singkatan: 'Malaria',
    deskripsi: 'RDT atau mikroskopis malaria positif / reaktif',
    kategori: 'infeksi',
    colorBadge: 'bg-emerald-100 text-emerald-800 border-emerald-300'
  },
  { 
    key: 'hiv', 
    label: 'HIV', 
    singkatan: 'HIV',
    deskripsi: 'Triple Eliminasi: Tes cepat antibodi HIV Reaktif',
    kategori: 'infeksi',
    colorBadge: 'bg-red-100 text-red-800 border-red-300'
  },
  { 
    key: 'sifilis', 
    label: 'Sifilis', 
    singkatan: 'Sifilis',
    deskripsi: 'Triple Eliminasi: Rapid test Treponema (TP Rapid) Reaktif',
    kategori: 'infeksi',
    colorBadge: 'bg-pink-100 text-pink-800 border-pink-300'
  },
  { 
    key: 'hepatitisB', 
    label: 'Hepatitis B', 
    singkatan: 'Hepatitis B',
    deskripsi: 'Triple Eliminasi: HBsAg Reaktif / Positif',
    kategori: 'infeksi',
    colorBadge: 'bg-blue-100 text-blue-800 border-blue-300'
  },
  { 
    key: 'hipertensi', 
    label: 'Hipertensi', 
    singkatan: 'Hipertensi',
    deskripsi: 'Tekanan darah sistolik ≥ 140 mmHg dan/atau diastolik ≥ 90 mmHg',
    kategori: 'penyakit_dalam',
    colorBadge: 'bg-rose-100 text-rose-800 border-rose-300'
  },
  { 
    key: 'diabetesMellitus', 
    label: 'Diabetes Mellitus', 
    singkatan: 'Diabetes Mellitus',
    deskripsi: 'GDP ≥ 126 mg/dL atau GDS ≥ 200 mg/dL (DM Gestasional / Pregestasional)',
    kategori: 'penyakit_dalam',
    colorBadge: 'bg-amber-100 text-amber-800 border-amber-300'
  }
];

export function getDaftarPenyakitNakes(pemeriksaan?: Partial<Record<PemeriksaanNakesKey, boolean>>): string[] {
  if (!pemeriksaan) return [];
  const list: string[] = [];
  DAFTAR_PEMERIKSAAN_NAKES.forEach((item) => {
    if (pemeriksaan[item.key] === true) {
      list.push(item.label);
    }
  });
  return list;
}

export interface IbuHamilData {
  id: string;
  kodeRegister: string;
  tanggalDaftar: string;
  desa: DesaName;
  
  // Data Ibu & Suami
  namaIbu: string;
  nikIbu: string;
  namaSuami: string;
  nikSuami: string;
  noHp: string;
  umurIbu: number;
  pendidikanIbu: string;
  pekerjaanIbu: string;
  pekerjaanSuami: string;
  alamatLengkap: string;
  
  // Maps / Lokasi
  latitude?: number;
  longitude?: number;
  mapsUrl?: string;
  
  // Antropometri & Kebidanan
  tb: number;
  bbSebelumHamil: number;
  bbSekarang?: number;
  imt: number;
  imtStatus: 'Kurus' | 'Normal' | 'Kelebihan BB' | 'Obesitas';
  hpht: string;
  ttp: string;
  usiaKehamilanMinggu?: number;
  gravida?: number;
  para?: number;
  abortus?: number;
  
  // Skrining Poedji Rochjati
  skorAwal: number;
  jawabanSkrining: Record<string, boolean>;
  totalSkor: number;
  kategoriRisiko: KategoriRisiko;
  warnaRisiko: 'hijau' | 'kuning' | 'merah';
  
  // Pemeriksaan Nakes (11 Indikator Penyakit / Komplikasi)
  pemeriksaanNakes?: Partial<Record<PemeriksaanNakesKey, boolean>>;
  catatanPemeriksaanNakes?: string;
  tanggalPemeriksaanNakes?: string;
  pemeriksaNakes?: string;

  // Rujukan & Tindakan
  rujukan?: string;
  tempatPersalinanDianjurkan?: string;
  penolongPersalinanDianjurkan?: string;
  catatanPetugas?: string;
  // Status Persalinan & Kunjungan
  sudahBersalin?: boolean;
  tanggalBersalin?: string;
  kondisiBersalin?: {
    tempatPersalinan?: string;
    penolong?: string;
    caraPersalinan?: 'Spontan / Normal' | 'Sectio Caesarea (SC)' | 'Tindakan (Vakum/Forceps)';
    keadaanIbu?: 'Sehat' | 'Ada Komplikasi' | 'Meninggal';
    keadaanBayi?: 'Lahir Hidup Sehat' | 'BBLR' | 'Asfiksia' | 'Meninggal (IUFD/Neonatal)';
    beratLahirGram?: number;
    panjangBadanCm?: number;
    jenisKelaminBayi?: 'Laki-laki' | 'Perempuan';
    catatanBersalin?: string;
  };
  statusKunjungan?: 'K1' | 'K2' | 'K3' | 'K4' | 'K5' | 'K6' | 'Selesai Bersalin';
  
  // Sinkronisasi
  syncedToFirebase?: boolean;
  updatedAt?: string;
}

export function isSudahBersalin(bumil: IbuHamilData): boolean {
  return bumil.sudahBersalin === true || bumil.statusKunjungan === 'Selesai Bersalin';
}

export interface PetugasUser {
  id: string;
  username: string;
  password?: string;
  nama: string;
  nip?: string;
  role: 'Admin' | 'Bidan Koordinator' | 'Bidan Desa' | 'Dokter Puskesmas';
  desaTugas?: DesaName | 'Semua Wilayah';
  noHp?: string;
  isCustom?: boolean;
}

export const DEFAULT_PETUGAS_LIST: PetugasUser[] = [
  {
    id: 'user-admin',
    username: 'admin',
    password: 'admin123',
    nama: 'Admin KIA Puskesmas Nangkaan',
    nip: '19820311 200501 1 008',
    role: 'Admin',
    desaTugas: 'Semua Wilayah',
    noHp: '081234567000'
  },
  {
    id: 'user-petugas-1',
    username: 'petugas1',
    password: 'nangkaan123',
    nama: 'Bd. Nurul Hidayati, S.Tr.Keb',
    nip: '19870512 201001 2 004',
    role: 'Bidan Koordinator',
    desaTugas: 'Kelurahan Nangkaan',
    noHp: '081234567892'
  },
  {
    id: 'user-petugas-2',
    username: 'petugas2',
    password: 'badean123',
    nama: 'Bd. Siti Aminah, S.Tr.Keb',
    nip: '19890415 201201 2 006',
    role: 'Bidan Desa',
    desaTugas: 'Kelurahan Badean',
    noHp: '081234567891'
  }
];
