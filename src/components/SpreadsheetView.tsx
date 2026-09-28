import React, { useState, useMemo } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  Printer, 
  Search, 
  Filter, 
  MapPin, 
  ExternalLink, 
  Edit3, 
  Trash2, 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Phone,
  RefreshCw,
  Eye,
  Building2,
  Stethoscope,
  Check,
  Baby
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { 
  IbuHamilData, 
  DesaName, 
  DAFTAR_DESA, 
  DAFTAR_PEMERIKSAAN_NAKES, 
  PemeriksaanNakesKey,
  getDaftarPenyakitNakes,
  isSudahBersalin,
  PetugasUser
} from '../types/simami';
import { PemeriksaanNakesModal } from './PemeriksaanNakesModal';
import { StatusBersalinModal } from './StatusBersalinModal';

interface SpreadsheetViewProps {
  data: IbuHamilData[];
  onAddNew: () => void;
  onEdit: (item: IbuHamilData) => void;
  onViewDetail: (item: IbuHamilData) => void;
  onDelete: (id: string) => void;
  onRefresh: () => void;
  isSyncing: boolean;
  selectedDesaFilter?: DesaName | 'Semua';
  onSaveBumil?: (item: IbuHamilData) => void;
  petugas?: PetugasUser | null;
}

export const SpreadsheetView: React.FC<SpreadsheetViewProps> = ({
  data,
  onAddNew,
  onEdit,
  onViewDetail,
  onDelete,
  onRefresh,
  isSyncing,
  selectedDesaFilter: initialDesaFilter = 'Semua',
  onSaveBumil,
  petugas
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDesa, setFilterDesa] = useState<DesaName | 'Semua'>(initialDesaFilter);
  const [filterRisiko, setFilterRisiko] = useState<'Semua' | 'hijau' | 'kuning' | 'merah'>('Semua');
  const [filterPenyakit, setFilterPenyakit] = useState<PemeriksaanNakesKey | 'Semua' | 'ada_penyakit' | 'normal'>('Semua');
  const [filterBersalin, setFilterBersalin] = useState<'Semua' | 'sedang_hamil' | 'sudah_bersalin'>('Semua');

  // Modal Pemeriksaan Nakes & Status Bersalin
  const [activeBumilPeriksa, setActiveBumilPeriksa] = useState<IbuHamilData | null>(null);
  const [activeBumilBersalin, setActiveBumilBersalin] = useState<IbuHamilData | null>(null);

  // Metrik Aktif vs Bersalin
  const countBersalin = data.filter(b => isSudahBersalin(b)).length;
  const countAktif = data.length - countBersalin;

  // Filter Data
  const filteredData = useMemo(() => {
    return data.filter(item => {
      // Filter Status Persalinan
      if (filterBersalin === 'sedang_hamil' && isSudahBersalin(item)) {
        return false;
      }
      if (filterBersalin === 'sudah_bersalin' && !isSudahBersalin(item)) {
        return false;
      }

      // Filter Desa
      if (filterDesa !== 'Semua' && item.desa !== filterDesa) {
        return false;
      }
      // Filter Risiko
      if (filterRisiko !== 'Semua' && item.warnaRisiko !== filterRisiko) {
        return false;
      }
      // Filter Pemeriksaan Nakes / Penyakit
      if (filterPenyakit === 'ada_penyakit') {
        const penyakit = getDaftarPenyakitNakes(item.pemeriksaanNakes);
        if (penyakit.length === 0) return false;
      } else if (filterPenyakit === 'normal') {
        const penyakit = getDaftarPenyakitNakes(item.pemeriksaanNakes);
        if (penyakit.length > 0) return false;
      } else if (filterPenyakit !== 'Semua') {
        if (!item.pemeriksaanNakes || !item.pemeriksaanNakes[filterPenyakit]) {
          return false;
        }
      }

      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchNama = item.namaIbu.toLowerCase().includes(query);
        const matchNik = item.nikIbu.includes(query);
        const matchSuami = item.namaSuami?.toLowerCase().includes(query);
        const matchKode = item.kodeRegister?.toLowerCase().includes(query);
        const matchAlamat = item.alamatLengkap?.toLowerCase().includes(query);
        const penyakitList = getDaftarPenyakitNakes(item.pemeriksaanNakes).join(' ').toLowerCase();
        const matchPenyakit = penyakitList.includes(query);
        return matchNama || matchNik || matchSuami || matchKode || matchAlamat || matchPenyakit;
      }
      return true;
    });
  }, [data, filterDesa, filterRisiko, filterPenyakit, filterBersalin, searchQuery]);

  // Export to Excel (.xlsx)
  const handleExportExcel = () => {
    const exportRows = filteredData.map((b, idx) => {
      const penyakitList = getDaftarPenyakitNakes(b.pemeriksaanNakes);
      const bersalin = isSudahBersalin(b);

      return {
        'No': idx + 1,
        'Kode Register': b.kodeRegister,
        'Tanggal Daftar': b.tanggalDaftar,
        'Desa / Kelurahan': b.desa,
        'Nama Ibu': b.namaIbu,
        'NIK Ibu': b.nikIbu,
        'Umur (Th)': b.umurIbu,
        'Status Persalinan': bersalin ? 'Sudah Bersalin' : 'Sedang Hamil',
        'Tanggal Bersalin': b.tanggalBersalin || '-',
        'Tempat Bersalin': b.kondisiBersalin?.tempatPersalinan || b.tempatPersalinanDianjurkan || '-',
        'Penolong Bersalin': b.kondisiBersalin?.penolong || b.penolongPersalinanDianjurkan || '-',
        'Cara Persalinan': b.kondisiBersalin?.caraPersalinan || '-',
        'Keadaan Bayi': b.kondisiBersalin?.keadaanBayi || '-',
        'Keadaan Ibu': b.kondisiBersalin?.keadaanIbu || '-',
        'Nama Suami': b.namaSuami,
        'NIK Suami': b.nikSuami,
        'No. HP / WA': b.noHp,
        'TB (cm)': b.tb,
        'BB Sebelum (kg)': b.bbSebelumHamil,
        'IMT': b.imt,
        'Status IMT': b.imtStatus,
        'HPHT': b.hpht,
        'TTP / HPL': b.ttp,
        'Usia Hamil (Minggu)': b.usiaKehamilanMinggu || 0,
        'Skor Poedji Rochjati': b.totalSkor,
        'Kategori Risiko': b.kategoriRisiko === 'KRR' ? 'Risiko Rendah (KRR)' : b.kategoriRisiko === 'KRT' ? 'Risiko Tinggi (KRT)' : 'Risiko Sangat Tinggi (KRST)',
        'Warna Risiko': b.warnaRisiko.toUpperCase(),
        
        // 11 Pemeriksaan Nakes
        'Pemeriksaan Nakes (Temuan)': penyakitList.length > 0 ? penyakitList.join(', ') : 'Tidak Ada Penyakit (Normal)',
        'Komplikasi Kebidanan': b.pemeriksaanNakes?.komplikasiKebidanan ? 'Ya' : 'Tidak',
        'KEK': b.pemeriksaanNakes?.kek ? 'Ya' : 'Tidak',
        'Anemia': b.pemeriksaanNakes?.anemia ? 'Ya' : 'Tidak',
        'Pre Eklampsi / Eklampsi': b.pemeriksaanNakes?.preEklampsi ? 'Ya' : 'Tidak',
        'Infeksi': b.pemeriksaanNakes?.infeksi ? 'Ya' : 'Tidak',
        'Malaria': b.pemeriksaanNakes?.malaria ? 'Ya' : 'Tidak',
        'HIV': b.pemeriksaanNakes?.hiv ? 'Ya' : 'Tidak',
        'Sifilis': b.pemeriksaanNakes?.sifilis ? 'Ya' : 'Tidak',
        'Hepatitis B': b.pemeriksaanNakes?.hepatitisB ? 'Ya' : 'Tidak',
        'Hipertensi': b.pemeriksaanNakes?.hipertensi ? 'Ya' : 'Tidak',
        'Diabetes Mellitus': b.pemeriksaanNakes?.diabetesMellitus ? 'Ya' : 'Tidak',
        'Catatan Pemeriksaan Nakes': b.catatanPemeriksaanNakes || '-',
        'Pemeriksa Nakes': b.pemeriksaNakes || '-',
        'Tanggal Pemeriksaan Nakes': b.tanggalPemeriksaanNakes || '-',

        'Status Kunjungan': b.statusKunjungan || 'K1',
        'Rujukan / Tindakan': b.rujukan,
        'Tempat Bersalin Dianjurkan': b.tempatPersalinanDianjurkan,
        'Alamat Rumah': b.alamatLengkap,
        'Maps URL': b.mapsUrl || ''
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Register_Kohort_Bumil');
    
    XLSX.writeFile(workbook, `Register_Kohort_Puskesmas_Nangkaan_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSaveUpdatedBumil = (updatedBumil: IbuHamilData) => {
    if (onSaveBumil) {
      onSaveBumil(updatedBumil);
    }
    setActiveBumilPeriksa(null);
    setActiveBumilBersalin(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Action Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-600/20">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Lihat Data Bumil & Register Kohort
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Data Lengkap 5 Wilayah Kerja • Dilengkapi Pemeriksaan Nakes & Tombol Status Bersalin
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onRefresh}
            disabled={isSyncing}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-2.5 rounded-xl transition-colors cursor-pointer"
            title="Refresh & Ambil Data Terbaru dari Firebase RTDB"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Sync Firebase</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Excel (.xlsx)</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Register</span>
          </button>

          <button
            onClick={onAddNew}
            className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-teal-600/20 transition-all transform hover:-translate-y-0.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tambah Bumil</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        {/* Search */}
        <div className="md:col-span-3 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari Nama, NIK, Penyakit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-800 focus:outline-teal-500 focus:bg-white font-medium"
          />
        </div>

        {/* Filter Wilayah Kerja Desa */}
        <div className="md:col-span-3 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={filterDesa}
            onChange={(e) => setFilterDesa(e.target.value as DesaName | 'Semua')}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-800 focus:outline-teal-500"
          >
            <option value="Semua">Semua 5 Wilayah Kerja</option>
            <option value="Kelurahan Nangkaan">Kelurahan Nangkaan</option>
            <option value="Kelurahan Badean">Kelurahan Badean</option>
            <option value="Desa Pancoran">Desa Pancoran</option>
            <option value="Desa Kembang">Desa Kembang</option>
            <option value="Desa Sukowiryo">Desa Sukowiryo</option>
          </select>
        </div>

        {/* Filter Status Persalinan (Semua, Sedang Hamil, Sudah Bersalin) */}
        <div className="md:col-span-2 flex items-center gap-2">
          <Baby className="w-4 h-4 text-blue-600 shrink-0" />
          <select
            value={filterBersalin}
            onChange={(e) => setFilterBersalin(e.target.value as any)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-800 focus:outline-blue-500"
          >
            <option value="Semua">Semua Status ({data.length})</option>
            <option value="sedang_hamil">🤰 Sedang Hamil ({countAktif})</option>
            <option value="sudah_bersalin">👶 Sudah Bersalin ({countBersalin})</option>
          </select>
        </div>

        {/* Filter Risiko (Hijau, Kuning, Merah) */}
        <div className="md:col-span-2 flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={filterRisiko}
            onChange={(e) => setFilterRisiko(e.target.value as 'Semua' | 'hijau' | 'kuning' | 'merah')}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-800 focus:outline-teal-500"
          >
            <option value="Semua">Semua Risiko</option>
            <option value="hijau">🟢 Hijau (KRR)</option>
            <option value="kuning">🟡 Kuning (KRT)</option>
            <option value="merah">🔴 Merah (KRST)</option>
          </select>
        </div>

        {/* Filter Pemeriksaan Nakes / Penyakit */}
        <div className="md:col-span-2 flex items-center gap-2">
          <Stethoscope className="w-4 h-4 text-rose-600 shrink-0" />
          <select
            value={filterPenyakit}
            onChange={(e) => setFilterPenyakit(e.target.value as any)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-800 focus:outline-teal-500"
          >
            <option value="Semua">Semua Penyakit</option>
            <option value="ada_penyakit">⚠️ Ada Penyakit</option>
            <option value="normal">✅ Normal</option>
            <optgroup label="Indikator:">
              {DAFTAR_PEMERIKSAAN_NAKES.map(item => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </optgroup>
          </select>
        </div>
      </div>

      {/* Spreadsheet Grid Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Table Summary Bar */}
        <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2 font-medium">
          <div className="flex flex-wrap items-center gap-2">
            <span>Menampilkan <strong>{filteredData.length}</strong> data pasien</span>
            <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full text-[10px]">
              🤰 {countAktif} Sedang Hamil (Tampil di Peta)
            </span>
            <span className="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full text-[10px]">
              👶 {countBersalin} Sudah Bersalin (Arsip Rekap)
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-emerald-700 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Hijau: {data.filter(d => d.warnaRisiko === 'hijau').length}
            </span>
            <span className="flex items-center gap-1 text-amber-700 font-bold">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span> Kuning: {data.filter(d => d.warnaRisiko === 'kuning').length}
            </span>
            <span className="flex items-center gap-1 text-rose-700 font-bold">
              <span className="w-2 h-2 rounded-full bg-rose-600"></span> Merah: {data.filter(d => d.warnaRisiko === 'merah').length}
            </span>
          </div>
        </div>

        {/* The Spreadsheet Table */}
        <div className="overflow-x-auto max-h-[640px] scrollbar-thin">
          <table className="w-full text-left text-xs border-collapse">
            {/* Table Header */}
            <thead className="bg-slate-100/90 text-slate-700 sticky top-0 z-20 border-b border-slate-300 font-extrabold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-3 w-12 text-center border-r border-slate-200">No</th>
                <th className="py-3 px-3 w-28 border-r border-slate-200">Risiko</th>
                <th className="py-3 px-3 w-16 text-center border-r border-slate-200">Skor</th>

                {/* Kolom Status Bersalin (Tombol Sudah Bersalin) */}
                <th className="py-3 px-3.5 min-w-[170px] border-r border-slate-200 bg-blue-50/70 text-blue-950">
                  <div className="flex items-center gap-1.5">
                    <Baby className="w-3.5 h-3.5 text-blue-700" />
                    <span>Status Persalinan</span>
                  </div>
                </th>

                <th className="py-3 px-3 w-32 border-r border-slate-200">Wilayah Kerja</th>
                <th className="py-3 px-4 min-w-[170px] border-r border-slate-200">Nama Ibu</th>
                <th className="py-3 px-3 w-36 border-r border-slate-200">NIK Ibu</th>
                <th className="py-3 px-3 w-16 text-center border-r border-slate-200">Umur</th>
                
                {/* Kolom Pemeriksaan Nakes (Ya / Tidak) */}
                <th className="py-3 px-4 min-w-[240px] border-r border-slate-200 bg-teal-50/70 text-teal-900">
                  <div className="flex items-center gap-1.5">
                    <Stethoscope className="w-3.5 h-3.5 text-teal-700" />
                    <span>Pemeriksaan Nakes (Pilih Ya/Tidak)</span>
                  </div>
                </th>

                <th className="py-3 px-4 min-w-[150px] border-r border-slate-200">Suami</th>
                <th className="py-3 px-3 w-32 border-r border-slate-200">No. WA</th>
                <th className="py-3 px-3 w-24 text-center border-r border-slate-200">TB / BB</th>
                <th className="py-3 px-3 w-24 text-center border-r border-slate-200">IMT</th>
                <th className="py-3 px-3 w-28 border-r border-slate-200">HPL (TTP)</th>
                <th className="py-3 px-3 w-24 text-center border-r border-slate-200">Usia Hml</th>
                <th className="py-3 px-4 min-w-[180px] border-r border-slate-200">Rekomendasi Rujukan</th>
                <th className="py-3 px-4 min-w-[180px] border-r border-slate-200">Alamat & Maps</th>
                <th className="py-3 px-3 w-28 text-center sticky right-0 bg-slate-100 z-30 shadow-xs">Aksi</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-200">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={18} className="py-12 text-center text-slate-400">
                    <p className="text-sm font-semibold">Tidak ada data ibu hamil yang sesuai dengan kriteria filter.</p>
                  </td>
                </tr>
              ) : (
                filteredData.map((bumil, index) => {
                  const isMerah = bumil.warnaRisiko === 'merah';
                  const isKuning = bumil.warnaRisiko === 'kuning';
                  const daftarPenyakit = getDaftarPenyakitNakes(bumil.pemeriksaanNakes);
                  const hasPenyakit = daftarPenyakit.length > 0;
                  const bersalin = isSudahBersalin(bumil);

                  return (
                    <tr 
                      key={bumil.id}
                      className={`hover:bg-slate-50/90 transition-colors font-medium ${
                        bersalin 
                          ? 'bg-blue-50/20' 
                          : isMerah ? 'bg-rose-50/40' : isKuning ? 'bg-amber-50/40' : ''
                      }`}
                    >
                      {/* No */}
                      <td className="py-3 px-3 text-center border-r border-slate-200 font-mono text-slate-500">
                        {index + 1}
                      </td>

                      {/* Risiko Badge */}
                      <td className="py-3 px-3 border-r border-slate-200">
                        {isMerah ? (
                          <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-rose-300">
                            <ShieldAlert className="w-3 h-3 text-rose-600" />
                            <span>KRST (Merah)</span>
                          </span>
                        ) : isKuning ? (
                          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-amber-300">
                            <AlertTriangle className="w-3 h-3 text-amber-700" />
                            <span>KRT (Kuning)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-300">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>KRR (Hijau)</span>
                          </span>
                        )}
                      </td>

                      {/* Skor */}
                      <td className="py-3 px-3 text-center border-r border-slate-200">
                        <span className={`inline-block font-black px-2 py-0.5 rounded-md text-xs ${
                          isMerah ? 'bg-rose-600 text-white' : isKuning ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white'
                        }`}>
                          {bumil.totalSkor}
                        </span>
                      </td>

                      {/* Kolom Status Persalinan & Tombol Sudah Bersalin */}
                      <td className="py-3 px-3.5 border-r border-slate-200 bg-blue-50/20">
                        {bersalin ? (
                          <div className="flex flex-col gap-1 items-start">
                            <span className="inline-flex items-center gap-1 text-[10px] font-black bg-blue-100 text-blue-900 border border-blue-200 px-2 py-0.5 rounded-full">
                              <Baby className="w-3 h-3 text-blue-700" />
                              <span>Sudah Bersalin</span>
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              Tgl: {bumil.tanggalBersalin || '-'}
                            </span>
                            <button
                              type="button"
                              onClick={() => setActiveBumilBersalin(bumil)}
                              className="text-[10px] text-blue-600 hover:text-blue-800 font-bold hover:underline cursor-pointer"
                            >
                              Edit Data Bersalin
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-1.5 items-start">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                              <span>Sedang Hamil</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => setActiveBumilBersalin(bumil)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-blue-50 text-blue-700 border border-blue-300 hover:border-blue-500 rounded-lg text-[10px] font-black transition-colors shadow-2xs cursor-pointer"
                              title="Klik jika ibu ini sudah melahirkan"
                            >
                              <Baby className="w-3 h-3 text-blue-600" />
                              <span>Sudah Bersalin?</span>
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Wilayah Kerja Desa */}
                      <td className="py-3 px-3 border-r border-slate-200 font-bold text-slate-800">
                        {bumil.desa}
                      </td>

                      {/* Nama Ibu */}
                      <td className="py-3 px-4 border-r border-slate-200">
                        <div className="font-extrabold text-slate-900 text-xs">
                          {bumil.namaIbu}
                        </div>
                        <span className="text-[10px] text-slate-500">
                          {bumil.kodeRegister}
                        </span>
                      </td>

                      {/* NIK Ibu */}
                      <td className="py-3 px-3 border-r border-slate-200 font-mono text-[11px] text-slate-700">
                        {bumil.nikIbu}
                      </td>

                      {/* Umur */}
                      <td className="py-3 px-3 text-center border-r border-slate-200 font-bold text-slate-800">
                        {bumil.umurIbu} th
                      </td>

                      {/* Pemeriksaan Nakes (11 Penyakit: Ya / Tidak) */}
                      <td className="py-3 px-4 border-r border-slate-200 bg-teal-50/30">
                        <div className="flex flex-col gap-1.5">
                          {hasPenyakit ? (
                            <div className="flex flex-wrap items-center gap-1">
                              {daftarPenyakit.map((p, idx) => (
                                <span 
                                  key={idx}
                                  className="text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-200 px-2 py-0.5 rounded-md"
                                >
                                  ⚠️ {p}
                                </span>
                              ))}
                            </div>
                          ) : bumil.pemeriksaanNakes ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 w-fit">
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span>Normal (Tidak Ada Penyakit)</span>
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">
                              Belum diperiksa nakes
                            </span>
                          )}

                          {/* Tombol Buka Modal Pilih Ya / Tidak */}
                          <button
                            type="button"
                            onClick={() => setActiveBumilPeriksa(bumil)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-teal-50 text-teal-700 border border-teal-300 hover:border-teal-500 rounded-lg text-[11px] font-extrabold transition-all shadow-2xs w-fit cursor-pointer mt-0.5"
                            title="Klik untuk memilih Ya/Tidak pada 11 indikator pemeriksaan nakes"
                          >
                            <Stethoscope className="w-3 h-3 text-teal-600" />
                            <span>Pemeriksaan Nakes (Pilih Ya/Tidak)</span>
                          </button>
                        </div>
                      </td>

                      {/* Nama Suami */}
                      <td className="py-3 px-4 border-r border-slate-200 text-slate-800">
                        <div>{bumil.namaSuami || '-'}</div>
                        <span className="text-[10px] text-slate-500">{bumil.pekerjaanSuami}</span>
                      </td>

                      {/* No. WA */}
                      <td className="py-3 px-3 border-r border-slate-200">
                        {bumil.noHp ? (
                          <a
                            href={`https://wa.me/${bumil.noHp.replace(/^0/, '62')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-bold hover:underline"
                          >
                            <Phone className="w-3 h-3" />
                            <span>{bumil.noHp}</span>
                          </a>
                        ) : (
                          '-'
                        )}
                      </td>

                      {/* TB / BB */}
                      <td className="py-3 px-3 text-center border-r border-slate-200 text-slate-700">
                        <span>{bumil.tb} cm</span> / <span>{bumil.bbSebelumHamil} kg</span>
                      </td>

                      {/* IMT */}
                      <td className="py-3 px-3 text-center border-r border-slate-200">
                        <span className="font-bold">{bumil.imt}</span>
                        <span className="block text-[10px] text-slate-500">{bumil.imtStatus}</span>
                      </td>

                      {/* HPL (TTP) */}
                      <td className="py-3 px-3 border-r border-slate-200 font-mono text-[11px] font-bold text-slate-900">
                        {bumil.ttp || '-'}
                      </td>

                      {/* Usia Hamil */}
                      <td className="py-3 px-3 text-center border-r border-slate-200 font-bold text-slate-800">
                        {bumil.usiaKehamilanMinggu ? `${bumil.usiaKehamilanMinggu} Mgg` : '-'}
                      </td>

                      {/* Rekomendasi Rujukan */}
                      <td className="py-3 px-4 border-r border-slate-200 text-slate-700 max-w-xs">
                        <p className="line-clamp-2 text-[11px] font-semibold text-slate-800">
                          {bumil.tempatPersalinanDianjurkan}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate">
                          {bumil.rujukan}
                        </p>
                      </td>

                      {/* Alamat & Maps */}
                      <td className="py-3 px-4 border-r border-slate-200 text-slate-700">
                        <div className="line-clamp-1 text-[11px]">{bumil.alamatLengkap}</div>
                        {bumil.mapsUrl && (
                          <a
                            href={bumil.mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] text-rose-600 hover:text-rose-700 font-bold mt-0.5 hover:underline"
                          >
                            <MapPin className="w-3 h-3" />
                            <span>Peta GPS</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </td>

                      {/* Aksi (Detail, Edit, Hapus) */}
                      <td className="py-3 px-3 text-center sticky right-0 bg-white/95 backdrop-blur-xs shadow-xs">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onViewDetail(bumil)}
                            className="p-1.5 text-slate-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                            title="Lihat Detail Kartu Skrining"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onEdit(bumil)}
                            className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Data Bumil"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Yakin ingin menghapus data ${bumil.namaIbu}?`)) {
                                onDelete(bumil.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Hapus Data Bumil"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Pemeriksaan Nakes (Pilih Ya / Tidak) */}
      <PemeriksaanNakesModal
        isOpen={!!activeBumilPeriksa}
        bumil={activeBumilPeriksa}
        petugas={petugas}
        onClose={() => setActiveBumilPeriksa(null)}
        onSaved={handleSaveUpdatedBumil}
      />

      {/* Modal Status Persalinan (Tombol Sudah Bersalin) */}
      <StatusBersalinModal
        isOpen={!!activeBumilBersalin}
        bumil={activeBumilBersalin}
        petugas={petugas}
        onClose={() => setActiveBumilBersalin(null)}
        onSaved={handleSaveUpdatedBumil}
      />
    </div>
  );
};
