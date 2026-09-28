import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  FileSpreadsheet, 
  MapPin, 
  QrCode, 
  PlusCircle, 
  ArrowRight, 
  ExternalLink, 
  Phone, 
  Database,
  Calendar,
  MessageCircle,
  RefreshCw,
  Search,
  Activity,
  FileBarChart,
  Stethoscope,
  Baby
} from 'lucide-react';
import { 
  IbuHamilData, 
  DAFTAR_DESA, 
  DesaName, 
  PetugasUser, 
  DAFTAR_PEMERIKSAAN_NAKES, 
  getDaftarPenyakitNakes,
  isSudahBersalin 
} from '../types/simami';
import { FIREBASE_RTDB_URL } from '../services/firebase';

interface DashboardPetugasProps {
  data: IbuHamilData[];
  petugas: PetugasUser | null;
  onNavigate: (tab: 'home' | 'form' | 'spreadsheet' | 'map' | 'dashboard' | 'petugas' | 'laporan') => void;
  onSelectDesa: (desa: DesaName) => void;
  onSelectBumil: (bumil: IbuHamilData) => void;
  onRefresh: () => void;
  isSyncing: boolean;
  syncSource: string;
}

export const DashboardPetugas: React.FC<DashboardPetugasProps> = ({
  data,
  petugas,
  onNavigate,
  onSelectDesa,
  onSelectBumil,
  onRefresh,
  isSyncing,
  syncSource
}) => {
  const [desaFilter, setDesaFilter] = useState<DesaName | 'Semua'>('Semua');

  // Metrik Utama
  const totalBumil = data.length;
  const countBersalin = data.filter(b => isSudahBersalin(b)).length;
  const countAktif = totalBumil - countBersalin;
  const bumilHijau = data.filter(b => b.warnaRisiko === 'hijau');
  const bumilKuning = data.filter(b => b.warnaRisiko === 'kuning');
  const bumilMerah = data.filter(b => b.warnaRisiko === 'merah');

  // Daftar Ibu Hamil Risti (Kuning & Merah) yang membutuhkan pantauan ekstra
  const bumilPrioritas = [...bumilMerah, ...bumilKuning].sort(
    (a, b) => b.totalSkor - a.totalSkor
  );

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner Dashboard Petugas */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="bg-blue-100 text-blue-800 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Portal Bidan & Petugas KIA
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Puskesmas Nangkaan Kab. Bondowoso
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Dashboard Pemantauan Si Mami Risti
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
              Sistem informasi pemantauan ibu hamil risiko tinggi, koordinasi rujukan dini berencana (RDB), 
              dan register kohort elektronik 5 desa wilayah kerja Puskesmas Nangkaan.
            </p>
          </div>

          {/* User Badge / Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onNavigate('form')}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Pendaftaran Bumil</span>
            </button>

            <button
              onClick={() => onNavigate('spreadsheet')}
              className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Buka Spreadsheet Kohort</span>
            </button>

            <button
              onClick={() => onNavigate('laporan')}
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <FileBarChart className="w-4 h-4 text-amber-400" />
              <span>Laporan Bulanan</span>
            </button>
          </div>
        </div>

        {/* Database Connection Card */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-600" />
            <span className="text-slate-500 font-medium">Koneksi Database:</span>
            <a 
              href={FIREBASE_RTDB_URL} 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-mono text-emerald-700 font-bold hover:underline flex items-center gap-1"
            >
              <span>{FIREBASE_RTDB_URL}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-500">
              Penyimpanan: <strong className="text-slate-800">{syncSource}</strong>
            </span>
            <button
              onClick={onRefresh}
              disabled={isSyncing}
              className="flex items-center gap-1 text-slate-600 hover:text-emerald-700 bg-slate-100 px-2.5 py-1 rounded-lg font-bold cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>Sinkron Ulang</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards (Total & Status, Sudah Bersalin, Hijau, Kuning, Merah) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Total & Aktif */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Bumil Aktif di Peta</span>
            <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900">{countAktif}</div>
            <p className="text-[10px] text-teal-700 font-bold mt-0.5">Dari Total {totalBumil} Terdaftar</p>
          </div>
        </div>

        {/* Sudah Bersalin (Arsip Rekap) */}
        <div className="bg-blue-50/70 border border-blue-200 p-4.5 rounded-2xl shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1">
              <Baby className="w-3 h-3 text-blue-600" />
              Sudah Bersalin
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-200 text-blue-900 flex items-center justify-center">
              <Baby className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-blue-950">{countBersalin}</div>
            <p className="text-[10px] text-blue-800 font-medium mt-0.5">Tersimpan di Rekap Kohort</p>
          </div>
        </div>

        {/* Hijau (KRR) */}
        <div className="bg-emerald-50/70 border border-emerald-300 p-5 rounded-2xl shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              Risiko Rendah (KRR)
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-200 text-emerald-800 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-emerald-950">{bumilHijau.length}</div>
            <p className="text-[11px] text-emerald-800 mt-0.5">
              Skor 2 • Persalinan di Puskesmas Nangkaan
            </p>
          </div>
        </div>

        {/* Kuning (KRT) */}
        <div className="bg-amber-50/70 border border-amber-300 p-5 rounded-2xl shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              Risiko Tinggi (KRT)
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-amber-950">{bumilKuning.length}</div>
            <p className="text-[11px] text-amber-800 mt-0.5">
              Skor 6 - 10 • Rujukan Terencana SpOG
            </p>
          </div>
        </div>

        {/* Merah (KRST) */}
        <div className="bg-rose-50/80 border border-rose-300 p-5 rounded-2xl shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-900 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse"></span>
              Risiko Sangat Tinggi (KRST)
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-200 text-rose-900 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-rose-950">{bumilMerah.length}</div>
            <p className="text-[11px] text-rose-800 mt-0.5">
              Skor ≥ 12 • Wajib Rujukan RSUD Koesnadi
            </p>
          </div>
        </div>
      </div>

      {/* Rincian 5 Desa Wilayah Puskesmas Nangkaan */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-600" />
              <span>Monitoring 5 Desa Wilayah Kerja Puskesmas Nangkaan</span>
            </h2>
            <p className="text-xs text-slate-500">
              Status persebaran ibu hamil, penanggung jawab bidan, dan link grup komunikasi WhatsApp
            </p>
          </div>

          <button
            onClick={() => onNavigate('map')}
            className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer"
          >
            <span>Tampilkan di Peta GPS</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {(Object.keys(DAFTAR_DESA) as DesaName[]).map((desaKey) => {
            const desa = DAFTAR_DESA[desaKey];
            const desabumils = data.filter(b => b.desa === desaKey);
            const hijau = desabumils.filter(b => b.warnaRisiko === 'hijau').length;
            const kuning = desabumils.filter(b => b.warnaRisiko === 'kuning').length;
            const merah = desabumils.filter(b => b.warnaRisiko === 'merah').length;

            return (
              <div 
                key={desaKey}
                className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-extrabold text-sm text-slate-900">
                      {desa.name}
                    </h3>
                    <span className="text-xs font-black bg-white px-2 py-0.5 rounded-full border border-slate-200">
                      {desabumils.length}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 mb-3">
                    <strong>Bidan:</strong> {desa.penanggungJawab}
                  </p>

                  {/* Indikator Warna */}
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center justify-between text-emerald-700">
                      <span>🟢 Hijau (KRR):</span>
                      <strong className="font-mono">{hijau}</strong>
                    </div>
                    <div className="flex items-center justify-between text-amber-700">
                      <span>🟡 Kuning (KRT):</span>
                      <strong className="font-mono">{kuning}</strong>
                    </div>
                    <div className="flex items-center justify-between text-rose-700">
                      <span>🔴 Merah (KRST):</span>
                      <strong className="font-mono">{merah}</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-200 space-y-1.5">
                  <a
                    href={desa.waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold py-1.5 px-2 rounded-lg transition-colors"
                  >
                    <MessageCircle className="w-3 h-3" />
                    <span>Grup WA Desa</span>
                  </a>

                  <button
                    onClick={() => {
                      onSelectDesa(desaKey);
                      onNavigate('spreadsheet');
                    }}
                    className="w-full text-center text-[10px] font-bold text-slate-500 hover:text-emerald-700 py-1 transition-colors cursor-pointer"
                  >
                    Buka Register &rarr;
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Rekapitulasi 11 Indikator Pemeriksaan Nakes */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-teal-600" />
              <span>Rekapitulasi 11 Indikator Pemeriksaan Nakes & Komplikasi</span>
            </h2>
            <p className="text-xs text-slate-500">
              Jumlah kasus terdeteksi pada ibu hamil di 5 wilayah kerja Puskesmas Nangkaan
            </p>
          </div>

          <button
            onClick={() => onNavigate('spreadsheet')}
            className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1 cursor-pointer"
          >
            <span>Periksa Nakes di Spreadsheet</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {DAFTAR_PEMERIKSAAN_NAKES.map((item) => {
            const count = data.filter(d => d.pemeriksaanNakes && d.pemeriksaanNakes[item.key] === true).length;
            const hasKasus = count > 0;
            return (
              <div
                key={item.key}
                onClick={() => onNavigate('spreadsheet')}
                className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                  hasKasus 
                    ? 'bg-rose-50/70 border-rose-300 hover:shadow-sm' 
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate mr-1" title={item.label}>
                    {item.singkatan}
                  </span>
                  {hasKasus && (
                    <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping"></span>
                  )}
                </div>
                <div className={`text-2xl font-black mt-1 ${hasKasus ? 'text-rose-700' : 'text-slate-700'}`}>
                  {count}
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5 truncate" title={item.label}>
                  {item.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabel Prioritas Risiko Tinggi (Kuning & Merah) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Activity className="w-5 h-5 text-rose-500" />
              <span>Daftar Ibu Hamil Pantauan Khusus (Kuning & Merah)</span>
            </h2>
            <p className="text-xs text-slate-500">
              Kasus dengan skor Poedji Rochjati tinggi yang membutuhkan penanganan medis & rujukan terencana
            </p>
          </div>

          <button
            onClick={() => onNavigate('spreadsheet')}
            className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1 cursor-pointer"
          >
            <span>Buka Semua di Spreadsheet</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Risiko</th>
                <th className="py-2.5 px-3">Nama Ibu</th>
                <th className="py-2.5 px-3">Desa</th>
                <th className="py-2.5 px-3">Umur</th>
                <th className="py-2.5 px-3">HPL (TTP)</th>
                <th className="py-2.5 px-3">Faktor Risiko / Rekomendasi</th>
                <th className="py-2.5 px-3 text-center">Kontak & Lokasi</th>
                <th className="py-2.5 px-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bumilPrioritas.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Tidak ada kasus risiko tinggi atau sangat tinggi saat ini.
                  </td>
                </tr>
              ) : (
                bumilPrioritas.map((bumil) => {
                  const isMerah = bumil.warnaRisiko === 'merah';
                  return (
                    <tr 
                      key={bumil.id}
                      className={`hover:bg-slate-50 transition-colors ${
                        isMerah ? 'bg-rose-50/30' : 'bg-amber-50/20'
                      }`}
                    >
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          isMerah ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-900'
                        }`}>
                          {isMerah ? 'KRST' : 'KRT'} (Skor {bumil.totalSkor})
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <strong className="text-slate-900 block">{bumil.namaIbu}</strong>
                        <span className="text-[10px] text-slate-500 font-mono">{bumil.nikIbu}</span>
                      </td>

                      <td className="py-3 px-3 font-semibold text-slate-800">
                        Desa {bumil.desa}
                      </td>

                      <td className="py-3 px-3 text-slate-700">
                        {bumil.umurIbu} th
                      </td>

                      <td className="py-3 px-3 font-mono font-bold text-slate-900">
                        {bumil.ttp || '-'}
                      </td>

                      <td className="py-3 px-3 max-w-xs text-slate-700">
                        {(() => {
                          const penyakitList = getDaftarPenyakitNakes(bumil.pemeriksaanNakes);
                          return (
                            <>
                              {penyakitList.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-1">
                                  {penyakitList.map((p, i) => (
                                    <span key={i} className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 border border-rose-200">
                                      ⚠️ {p}
                                    </span>
                                  ))}
                                </div>
                              )}
                              <p className="line-clamp-2 font-medium">{bumil.rujukan}</p>
                              <p className="text-[10px] text-slate-500">{bumil.tempatPersalinanDianjurkan}</p>
                            </>
                          );
                        })()}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {bumil.noHp && (
                            <a
                              href={`https://wa.me/${bumil.noHp.replace(/^0/, '62')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg hover:bg-emerald-200 transition-colors"
                              title="Chat WhatsApp"
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {bumil.mapsUrl && (
                            <a
                              href={bumil.mapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 bg-rose-100 text-rose-800 rounded-lg hover:bg-rose-200 transition-colors"
                              title="Buka Lokasi Google Maps"
                            >
                              <MapPin className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => onSelectBumil(bumil)}
                          className="bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold px-3 py-1 rounded-lg transition-colors cursor-pointer"
                        >
                          Detail
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
    </div>
  );
};
