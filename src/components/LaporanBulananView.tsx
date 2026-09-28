import React, { useState, useMemo } from 'react';
import { 
  FileBarChart, 
  Calendar, 
  Download, 
  Printer, 
  Filter, 
  Building2, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Users, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { IbuHamilData, DAFTAR_DESA, DesaName, getDaftarPenyakitNakes } from '../types/simami';
import { SKRINING_ITEMS } from '../utils/calculator';
import { LogoSiMamiRisti } from './LogoSiMamiRisti';

interface LaporanBulananViewProps {
  data: IbuHamilData[];
  onSelectBumil: (bumil: IbuHamilData) => void;
}

const NAMA_BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export const LaporanBulananView: React.FC<LaporanBulananViewProps> = ({
  data,
  onSelectBumil
}) => {
  const currentDate = new Date();
  const [selectedBulan, setSelectedBulan] = useState<number>(currentDate.getMonth()); // 0-11
  const [selectedTahun, setSelectedTahun] = useState<number>(currentDate.getFullYear());
  const [selectedDesa, setSelectedDesa] = useState<DesaName | 'Semua'>('Semua');

  // Filter Data Berdasarkan Bulan & Tahun Pendaftaran
  const filteredData = useMemo(() => {
    return data.filter(item => {
      // Filter Desa
      if (selectedDesa !== 'Semua' && item.desa !== selectedDesa) {
        return false;
      }

      // Filter Tanggal
      if (!item.tanggalDaftar) return true; // jika tanggal tidak ada, masukkan ke laporan
      const dateParts = item.tanggalDaftar.split('-');
      if (dateParts.length >= 2) {
        const itemYear = parseInt(dateParts[0], 10);
        const itemMonth = parseInt(dateParts[1], 10) - 1; // 0-indexed

        // Jika user memilih bulan/tahun tertentu
        return itemYear === selectedTahun && itemMonth === selectedBulan;
      }
      return true;
    });
  }, [data, selectedBulan, selectedTahun, selectedDesa]);

  // Statistik Periode Terpilih
  const totalBumil = filteredData.length;
  const bumilHijau = filteredData.filter(b => b.warnaRisiko === 'hijau');
  const bumilKuning = filteredData.filter(b => b.warnaRisiko === 'kuning');
  const bumilMerah = filteredData.filter(b => b.warnaRisiko === 'merah');
  const rujukanCount = filteredData.filter(b => b.warnaRisiko !== 'hijau').length;

  // Analisis Frekuensi Faktor Risiko Terbanyak
  const faktorRisikoStats = useMemo(() => {
    const counts: Record<string, { label: string; count: number; skor: number }> = {};
    SKRINING_ITEMS.forEach(item => {
      counts[item.id] = { label: item.label, count: 0, skor: item.skor };
    });

    filteredData.forEach(bumil => {
      Object.keys(bumil.jawabanSkrining || {}).forEach(key => {
        if (bumil.jawabanSkrining[key] && counts[key]) {
          counts[key].count += 1;
        }
      });
    });

    return Object.values(counts)
      .filter(item => item.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [filteredData]);

  // Matriks per Desa
  const matriksDesa = useMemo(() => {
    return (Object.keys(DAFTAR_DESA) as DesaName[]).map(desaKey => {
      const listDesa = filteredData.filter(b => b.desa === desaKey);
      const hijau = listDesa.filter(b => b.warnaRisiko === 'hijau').length;
      const kuning = listDesa.filter(b => b.warnaRisiko === 'kuning').length;
      const merah = listDesa.filter(b => b.warnaRisiko === 'merah').length;
      const anemia = listDesa.filter(b => b.jawabanSkrining?.['penyakit_anemia']).length;
      const sc = listDesa.filter(b => b.jawabanSkrining?.['pernah_operasi_sesar']).length;
      const cpd = listDesa.filter(b => b.jawabanSkrining?.['terlalu_pendek']).length;
      const hipertensi = listDesa.filter(b => b.jawabanSkrining?.['bengkak_tensi_tinggi'] || b.jawabanSkrining?.['preeklampsia_berat']).length;

      return {
        desa: desaKey,
        bidan: DAFTAR_DESA[desaKey].penanggungJawab,
        total: listDesa.length,
        hijau,
        kuning,
        merah,
        anemia,
        sc,
        cpd,
        hipertensi,
        rujukan: kuning + merah
      };
    });
  }, [filteredData]);

  // Export Laporan Bulanan ke Excel
  const handleExportExcel = () => {
    // Sheet 1: Rekapitulasi Desa
    const rekapRows = matriksDesa.map((row, idx) => ({
      'No': idx + 1,
      'Wilayah Desa': row.desa,
      'Bidan Penanggung Jawab': row.bidan,
      'Total Ibu Hamil': row.total,
      'Risiko Rendah (KRR - Hijau)': row.hijau,
      'Risiko Tinggi (KRT - Kuning)': row.kuning,
      'Risiko Sangat Tinggi (KRST - Merah)': row.merah,
      'Kasus Anemia': row.anemia,
      'Riwayat SC': row.sc,
      'Tinggi Badan <145cm (CPD)': row.cpd,
      'Hipertensi / Preeklampsia': row.hipertensi,
      'Rujukan Terencana RSUD': row.rujukan
    }));

    // Sheet 2: Data Detail Pasien
    const detailRows = filteredData.map((b, idx) => ({
      'No': idx + 1,
      'Kode Register': b.kodeRegister,
      'Tanggal': b.tanggalDaftar,
      'Desa': b.desa,
      'Nama Ibu': b.namaIbu,
      'NIK Ibu': b.nikIbu,
      'Umur': b.umurIbu,
      'Nama Suami': b.namaSuami,
      'No. WA': b.noHp,
      'TB/BB': `${b.tb} cm / ${b.bbSebelumHamil} kg`,
      'IMT': b.imt,
      'HPHT': b.hpht,
      'HPL (TTP)': b.ttp,
      'Skor': b.totalSkor,
      'Warna Risiko': b.warnaRisiko.toUpperCase(),
      'Kategori': b.kategoriRisiko,
      'Pemeriksaan Nakes (Penyakit)': getDaftarPenyakitNakes(b.pemeriksaanNakes).join(', ') || 'Normal (Bebas Penyakit)',
      'Tempat Persalinan Dianjurkan': b.tempatPersalinanDianjurkan,
      'Rujukan': b.rujukan
    }));

    const wb = XLSX.utils.book_new();
    const wsRekap = XLSX.utils.json_to_sheet(rekapRows);
    const wsDetail = XLSX.utils.json_to_sheet(detailRows);

    XLSX.utils.book_append_sheet(wb, wsRekap, 'Rekapitulasi_5_Desa');
    XLSX.utils.book_append_sheet(wb, wsDetail, 'Register_Pasien_Bulanan');

    XLSX.writeFile(
      wb, 
      `Laporan_Bulanan_SiMamiRisti_${NAMA_BULAN[selectedBulan]}_${selectedTahun}.xlsx`
    );
  };

  // Cetak Dokumen Resmi
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header Laporan */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-teal-700 text-white flex items-center justify-center shadow-md shadow-teal-700/20">
            <FileBarChart className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-teal-100 text-teal-800 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                Kohort PWS-KIA
              </span>
              <span className="text-xs text-slate-400 font-medium">UPTD Puskesmas Nangkaan</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              Laporan Bulanan Pemantauan Ibu Hamil Risiko Tinggi
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Periode {NAMA_BULAN[selectedBulan]} {selectedTahun} • Wilayah Kerja 5 Desa Bondowoso
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Excel (.xlsx)</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Laporan Resmi</span>
          </button>
        </div>
      </div>

      {/* Filter Periode Bulan & Tahun & Desa */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
        {/* Pilih Bulan */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-teal-600 shrink-0" />
          <div className="flex-1">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
              Pilih Bulan
            </label>
            <select
              value={selectedBulan}
              onChange={(e) => setSelectedBulan(parseInt(e.target.value, 10))}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-teal-500"
            >
              {NAMA_BULAN.map((bln, idx) => (
                <option key={bln} value={idx}>
                  Bulan {bln}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Pilih Tahun */}
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
              Pilih Tahun
            </label>
            <select
              value={selectedTahun}
              onChange={(e) => setSelectedTahun(parseInt(e.target.value, 10))}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-teal-500"
            >
              <option value={2026}>Tahun 2026</option>
              <option value={2025}>Tahun 2025</option>
              <option value={2024}>Tahun 2024</option>
            </select>
          </div>
        </div>

        {/* Filter Desa */}
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
          <div className="flex-1">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
              Wilayah Desa
            </label>
            <select
              value={selectedDesa}
              onChange={(e) => setSelectedDesa(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-teal-500"
            >
              <option value="Semua">Semua 5 Wilayah (Puskesmas Nangkaan)</option>
              <option value="Kelurahan Nangkaan">Kelurahan Nangkaan</option>
              <option value="Kelurahan Badean">Kelurahan Badean</option>
              <option value="Desa Pancoran">Desa Pancoran</option>
              <option value="Desa Kembang">Desa Kembang</option>
              <option value="Desa Sukowiryo">Desa Sukowiryo</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards Ringkasan Periode */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Terdaftar */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Total Ibu Hamil Periode Ini
          </span>
          <div className="mt-3">
            <div className="text-3xl font-black text-slate-900">{totalBumil}</div>
            <p className="text-[11px] text-slate-400 mt-1">
              Bulan {NAMA_BULAN[selectedBulan]} {selectedTahun}
            </p>
          </div>
        </div>

        {/* Hijau (KRR) */}
        <div className="bg-emerald-50/70 border border-emerald-300 p-5 rounded-2xl shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              Risiko Rendah (KRR)
            </span>
            <span className="text-xs font-black text-emerald-700">
              {totalBumil > 0 ? `${((bumilHijau.length / totalBumil) * 100).toFixed(0)}%` : '0%'}
            </span>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-emerald-950">{bumilHijau.length}</div>
            <p className="text-[11px] text-emerald-800 mt-1">Skor 2 • Normal / Fisiologis</p>
          </div>
        </div>

        {/* Kuning (KRT) */}
        <div className="bg-amber-50/70 border border-amber-300 p-5 rounded-2xl shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              Risiko Tinggi (KRT)
            </span>
            <span className="text-xs font-black text-amber-800">
              {totalBumil > 0 ? `${((bumilKuning.length / totalBumil) * 100).toFixed(0)}%` : '0%'}
            </span>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-amber-950">{bumilKuning.length}</div>
            <p className="text-[11px] text-amber-800 mt-1">Skor 6 - 10 • Rujukan Terencana</p>
          </div>
        </div>

        {/* Merah (KRST) */}
        <div className="bg-rose-50/80 border border-rose-300 p-5 rounded-2xl shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-900 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse"></span>
              Risiko Sangat Tinggi (KRST)
            </span>
            <span className="text-xs font-black text-rose-800">
              {totalBumil > 0 ? `${((bumilMerah.length / totalBumil) * 100).toFixed(0)}%` : '0%'}
            </span>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-rose-950">{bumilMerah.length}</div>
            <p className="text-[11px] text-rose-800 mt-1">Skor &ge; 12 • Wajib Rujukan RSUD</p>
          </div>
        </div>
      </div>

      {/* Tabel Matriks 5 Desa (Format Resmi PWS-KIA) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              Matriks Pemantauan 5 Desa (PWS-KIA)
            </h2>
            <p className="text-xs text-slate-500">
              Distribusi kasus per desa dan indikator faktor risiko utama
            </p>
          </div>
          <span className="text-xs bg-slate-100 px-3 py-1 rounded-full font-bold text-slate-700">
            {NAMA_BULAN[selectedBulan]} {selectedTahun}
          </span>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-700 font-extrabold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-3">Desa Wilayah</th>
                <th className="py-3 px-3">Bidan Desa</th>
                <th className="py-3 px-3 text-center">Total</th>
                <th className="py-3 px-3 text-center text-emerald-800 bg-emerald-50">🟢 KRR (Hijau)</th>
                <th className="py-3 px-3 text-center text-amber-900 bg-amber-50">🟡 KRT (Kuning)</th>
                <th className="py-3 px-3 text-center text-rose-900 bg-rose-50">🔴 KRST (Merah)</th>
                <th className="py-3 px-3 text-center">Anemia</th>
                <th className="py-3 px-3 text-center">Riwayat SC</th>
                <th className="py-3 px-3 text-center">TB &lt;145cm</th>
                <th className="py-3 px-3 text-center">Hipertensi</th>
                <th className="py-3 px-3 text-center font-bold text-indigo-700">Total Rujukan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {matriksDesa.map((row) => (
                <tr key={row.desa} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3 font-extrabold text-slate-900">
                    Desa {row.desa}
                  </td>
                  <td className="py-3 px-3 text-slate-600 text-[11px]">
                    {row.bidan}
                  </td>
                  <td className="py-3 px-3 text-center font-black text-slate-900">
                    {row.total}
                  </td>
                  <td className="py-3 px-3 text-center font-bold text-emerald-700 bg-emerald-50/50">
                    {row.hijau}
                  </td>
                  <td className="py-3 px-3 text-center font-bold text-amber-700 bg-amber-50/50">
                    {row.kuning}
                  </td>
                  <td className="py-3 px-3 text-center font-bold text-rose-700 bg-rose-50/50">
                    {row.merah}
                  </td>
                  <td className="py-3 px-3 text-center text-slate-700 font-mono">
                    {row.anemia}
                  </td>
                  <td className="py-3 px-3 text-center text-slate-700 font-mono">
                    {row.sc}
                  </td>
                  <td className="py-3 px-3 text-center text-slate-700 font-mono">
                    {row.cpd}
                  </td>
                  <td className="py-3 px-3 text-center text-slate-700 font-mono">
                    {row.hipertensi}
                  </td>
                  <td className="py-3 px-3 text-center font-black text-indigo-700">
                    {row.rujukan}
                  </td>
                </tr>
              ))}
            </tbody>
            {/* Total Footer */}
            <tfoot className="bg-slate-100/90 font-black text-slate-900 border-t-2 border-slate-300">
              <tr>
                <td colSpan={2} className="py-3 px-3 uppercase text-[11px]">
                  Total Puskesmas Nangkaan
                </td>
                <td className="py-3 px-3 text-center">{totalBumil}</td>
                <td className="py-3 px-3 text-center text-emerald-800">{bumilHijau.length}</td>
                <td className="py-3 px-3 text-center text-amber-800">{bumilKuning.length}</td>
                <td className="py-3 px-3 text-center text-rose-800">{bumilMerah.length}</td>
                <td className="py-3 px-3 text-center">
                  {matriksDesa.reduce((acc, curr) => acc + curr.anemia, 0)}
                </td>
                <td className="py-3 px-3 text-center">
                  {matriksDesa.reduce((acc, curr) => acc + curr.sc, 0)}
                </td>
                <td className="py-3 px-3 text-center">
                  {matriksDesa.reduce((acc, curr) => acc + curr.cpd, 0)}
                </td>
                <td className="py-3 px-3 text-center">
                  {matriksDesa.reduce((acc, curr) => acc + curr.hipertensi, 0)}
                </td>
                <td className="py-3 px-3 text-center text-indigo-700">{rujukanCount}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Analisis Faktor Risiko Terbanyak */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-teal-600" />
          <span>Faktor Risiko Kehamilan Terbanyak (Poedji Rochjati)</span>
        </h2>

        {faktorRisikoStats.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">
            Belum ada faktor risiko yang tercatat pada periode bulan ini.
          </p>
        ) : (
          <div className="space-y-2.5">
            {faktorRisikoStats.map((item, idx) => {
              const persentase = totalBumil > 0 ? (item.count / totalBumil) * 100 : 0;
              return (
                <div key={item.label} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-800">
                    <span className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[10px]">
                        {idx + 1}
                      </span>
                      <span>{item.label}</span>
                      <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.2 rounded font-mono">
                        +{item.skor}
                      </span>
                    </span>
                    <span>
                      {item.count} Bumil ({persentase.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        item.skor === 8 ? 'bg-rose-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${Math.min(persentase, 100)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Rincian Pasien Bulan Ini */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-teal-600" />
            <span>Rincian Register Ibu Hamil Periode Ini ({filteredData.length} Orang)</span>
          </h2>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 max-h-96">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-700 font-extrabold uppercase text-[10px] sticky top-0 z-10">
              <tr>
                <th className="py-2.5 px-3">No</th>
                <th className="py-2.5 px-3">Kode Register</th>
                <th className="py-2.5 px-3">Desa</th>
                <th className="py-2.5 px-3">Nama Ibu</th>
                <th className="py-2.5 px-3">Umur</th>
                <th className="py-2.5 px-3">Suami</th>
                <th className="py-2.5 px-3">HPL (TTP)</th>
                <th className="py-2.5 px-3 text-center">Skor</th>
                <th className="py-2.5 px-3">Kategori</th>
                <th className="py-2.5 px-3">Rujukan / Tindakan</th>
                <th className="py-2.5 px-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-400">
                    Tidak ada ibu hamil yang terdaftar pada bulan {NAMA_BULAN[selectedBulan]} {selectedTahun}.
                  </td>
                </tr>
              ) : (
                filteredData.map((bumil, idx) => {
                  const isMerah = bumil.warnaRisiko === 'merah';
                  const isKuning = bumil.warnaRisiko === 'kuning';
                  return (
                    <tr key={bumil.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 text-slate-400 font-mono">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">{bumil.kodeRegister}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-800">Desa {bumil.desa}</td>
                      <td className="py-2.5 px-3 font-extrabold text-slate-900">{bumil.namaIbu}</td>
                      <td className="py-2.5 px-3 text-slate-700">{bumil.umurIbu} th</td>
                      <td className="py-2.5 px-3 text-slate-700">{bumil.namaSuami || '-'}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{bumil.ttp || '-'}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`inline-block font-black px-2 py-0.5 rounded text-xs text-white ${
                          isMerah ? 'bg-rose-600' : isKuning ? 'bg-amber-500' : 'bg-emerald-600'
                        }`}>
                          {bumil.totalSkor}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          isMerah ? 'bg-rose-100 text-rose-800' : isKuning ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {bumil.kategoriRisiko}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 max-w-xs truncate text-[11px] text-slate-600">
                        {bumil.rujukan}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => onSelectBumil(bumil)}
                          className="bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                        >
                          Lihat
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lembar Pengesahan / Tanda Tangan Cetak (Hanya Muncul di Tampilan Print) */}
      <div className="hidden print:block pt-8 space-y-6 text-xs text-slate-800">
        <div className="flex justify-between items-start text-center">
          <div className="space-y-16">
            <p>Mengetahui,<br /><strong>Kepala UPTD Puskesmas Nangkaan</strong></p>
            <div>
              <p className="font-extrabold underline">drg. SILFIA NUPULLA, M.Kes</p>
              <p>NIP. 197909052006042019</p>
            </div>
          </div>

          <div className="space-y-16">
            <p>Bondowoso, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}<br /><strong>Bidan Koordinator Puskesmas Nangkaan</strong></p>
            <div>
              <p className="font-extrabold underline">RA. Dinie Hekmawati, A.Md. Keb.</p>
              <p>NIP. 197505172014102001</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
