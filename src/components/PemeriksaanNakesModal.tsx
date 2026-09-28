import React, { useState, useEffect } from 'react';
import { 
  X, 
  Stethoscope, 
  CheckCircle2, 
  AlertCircle, 
  Save, 
  ShieldAlert, 
  Check, 
  RotateCcw,
  Calendar,
  UserCheck
} from 'lucide-react';
import { 
  IbuHamilData, 
  DAFTAR_PEMERIKSAAN_NAKES, 
  PemeriksaanNakesKey, 
  PetugasUser,
  getDaftarPenyakitNakes 
} from '../types/simami';
import { saveBumilRecord } from '../services/firebase';

interface PemeriksaanNakesModalProps {
  isOpen: boolean;
  bumil: IbuHamilData | null;
  petugas?: PetugasUser | null;
  onClose: () => void;
  onSaved: (updatedBumil: IbuHamilData) => void;
}

export const PemeriksaanNakesModal: React.FC<PemeriksaanNakesModalProps> = ({
  isOpen,
  bumil,
  petugas,
  onClose,
  onSaved
}) => {
  const [pemeriksaan, setPemeriksaan] = useState<Partial<Record<PemeriksaanNakesKey, boolean>>>({});
  const [catatan, setCatatan] = useState('');
  const [tanggal, setTanggal] = useState('');
  const [pemeriksa, setPemeriksa] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (bumil) {
      setPemeriksaan(bumil.pemeriksaanNakes || {
        komplikasiKebidanan: false,
        kek: false,
        anemia: false,
        preEklampsi: false,
        infeksi: false,
        malaria: false,
        hiv: false,
        sifilis: false,
        hepatitisB: false,
        hipertensi: false,
        diabetesMellitus: false
      });
      setCatatan(bumil.catatanPemeriksaanNakes || '');
      setTanggal(bumil.tanggalPemeriksaanNakes || new Date().toISOString().split('T')[0]);
      setPemeriksa(bumil.pemeriksaNakes || petugas?.nama || 'Bidan Puskesmas Nangkaan');
      setSaveSuccess(false);
    }
  }, [bumil, petugas]);

  if (!isOpen || !bumil) return null;

  const handleToggle = (key: PemeriksaanNakesKey, value: boolean) => {
    setPemeriksaan(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSetAllNegative = () => {
    const allFalse: Partial<Record<PemeriksaanNakesKey, boolean>> = {};
    DAFTAR_PEMERIKSAAN_NAKES.forEach(item => {
      allFalse[item.key] = false;
    });
    setPemeriksaan(allFalse);
  };

  const handleSave = async () => {
    if (!bumil) return;
    setIsSaving(true);

    const updatedBumil: IbuHamilData = {
      ...bumil,
      pemeriksaanNakes: pemeriksaan,
      catatanPemeriksaanNakes: catatan,
      tanggalPemeriksaanNakes: tanggal,
      pemeriksaNakes: pemeriksa,
      updatedAt: new Date().toISOString()
    };

    const res = await saveBumilRecord(updatedBumil);
    setIsSaving(false);
    setSaveSuccess(true);

    setTimeout(() => {
      onSaved(res.data);
      onClose();
    }, 500);
  };

  const positiveDiseases = getDaftarPenyakitNakes(pemeriksaan);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-teal-50 via-emerald-50 to-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-600/20">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                  Pemeriksaan Nakes
                </h3>
                <span className="text-xs font-mono bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded-full">
                  {bumil.kodeRegister}
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium">
                Ibu <strong>{bumil.namaIbu}</strong> ({bumil.umurIbu} th) • {bumil.desa}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* Quick Summary Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Status Temuan Penyakit:
              </span>
              {positiveDiseases.length === 0 ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-700 mt-0.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Semua Indikator Negatif (Normal / Bebas Penyakit)
                </span>
              ) : (
                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                  <span className="text-xs font-black text-rose-700 mr-1">
                    {positiveDiseases.length} Ditemukan:
                  </span>
                  {positiveDiseases.map((penyakit, idx) => (
                    <span 
                      key={idx}
                      className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200"
                    >
                      {penyakit}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleSetAllNegative}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-300 transition-colors shrink-0 flex items-center gap-1 self-start sm:self-auto cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Pilih Semua "Tidak"</span>
            </button>
          </div>

          {/* 11 Items Table / Switch List */}
          <div className="space-y-2">
            <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
              Daftar 11 Pemeriksaan Nakes (Pilih Ya / Tidak):
            </h4>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
              {DAFTAR_PEMERIKSAAN_NAKES.map((item, index) => {
                const isPositive = pemeriksaan[item.key] === true;
                return (
                  <div
                    key={item.key}
                    className={`p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-colors ${
                      isPositive ? 'bg-rose-50/60' : index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                    }`}
                  >
                    <div className="flex-1 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-black flex items-center justify-center shrink-0">
                          {index + 1}
                        </span>
                        <span className={`text-xs sm:text-sm font-extrabold ${
                          isPositive ? 'text-rose-900' : 'text-slate-800'
                        }`}>
                          {item.label}
                        </span>
                        {isPositive && (
                          <span className="text-[10px] font-extrabold bg-rose-600 text-white px-2 py-0.2 rounded-full animate-pulse">
                            Positif
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 ml-7">
                        {item.deskripsi}
                      </p>
                    </div>

                    {/* Button Group Ya / Tidak */}
                    <div className="flex items-center gap-1.5 self-end sm:self-auto ml-7 sm:ml-0 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleToggle(item.key, true)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1 transition-all cursor-pointer ${
                          isPositive
                            ? 'bg-rose-600 text-white shadow-xs scale-105'
                            : 'bg-slate-100 text-slate-600 hover:bg-rose-100 hover:text-rose-800'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Ya</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggle(item.key, false)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1 transition-all cursor-pointer ${
                          !isPositive
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Tidak</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form Meta: Catatan, Tanggal & Pemeriksa */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Tanggal Pemeriksaan:
              </label>
              <input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                Nama Petugas / Bidan Pemeriksa:
              </label>
              <input
                type="text"
                value={pemeriksa}
                onChange={(e) => setPemeriksa(e.target.value)}
                placeholder="Contoh: Bd. Diana Yuli Aidhasari, A.Md. Keb."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Catatan / Keterangan Tambahan Nakes:
              </label>
              <textarea
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                rows={2}
                placeholder="Catatan hasil lab, terapi obat yang diberikan, saran tindak lanjut..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 flex items-center justify-between bg-slate-50">
          <p className="text-[11px] text-slate-500 hidden sm:block">
            *Hasil pemeriksaan akan otomatis disinkronkan ke peta geospasial dan register kohort.
          </p>

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2.5 text-xs font-extrabold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-md shadow-teal-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Menyimpan...' : saveSuccess ? 'Tersimpan!' : 'Simpan Pemeriksaan'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
