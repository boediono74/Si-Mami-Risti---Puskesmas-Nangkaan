import React, { useState, useEffect } from 'react';
import { 
  X, 
  Baby, 
  CheckCircle2, 
  Calendar, 
  Building2, 
  UserCheck, 
  Heart, 
  Save, 
  RotateCcw,
  Info,
  ShieldCheck
} from 'lucide-react';
import { IbuHamilData, PetugasUser, isSudahBersalin } from '../types/simami';
import { saveBumilRecord } from '../services/firebase';

interface StatusBersalinModalProps {
  isOpen: boolean;
  bumil: IbuHamilData | null;
  petugas?: PetugasUser | null;
  onClose: () => void;
  onSaved: (updatedBumil: IbuHamilData) => void;
}

export const StatusBersalinModal: React.FC<StatusBersalinModalProps> = ({
  isOpen,
  bumil,
  petugas,
  onClose,
  onSaved
}) => {
  const [sudahBersalin, setSudahBersalin] = useState<boolean>(true);
  const [tanggalBersalin, setTanggalBersalin] = useState<string>('');
  const [tempatPersalinan, setTempatPersalinan] = useState<string>('Puskesmas Nangkaan');
  const [penolong, setPenolong] = useState<string>('Bidan Puskesmas');
  const [caraPersalinan, setCaraPersalinan] = useState<'Spontan / Normal' | 'Sectio Caesarea (SC)' | 'Tindakan (Vakum/Forceps)'>('Spontan / Normal');
  const [keadaanIbu, setKeadaanIbu] = useState<'Sehat' | 'Ada Komplikasi' | 'Meninggal'>('Sehat');
  const [keadaanBayi, setKeadaanBayi] = useState<'Lahir Hidup Sehat' | 'BBLR' | 'Asfiksia' | 'Meninggal (IUFD/Neonatal)'>('Lahir Hidup Sehat');
  const [beratLahirGram, setBeratLahirGram] = useState<number | ''>(3100);
  const [panjangBadanCm, setPanjangBadanCm] = useState<number | ''>(49);
  const [jenisKelaminBayi, setJenisKelaminBayi] = useState<'Laki-laki' | 'Perempuan'>('Laki-laki');
  const [catatanBersalin, setCatatanBersalin] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    if (bumil) {
      const alreadyBersalin = isSudahBersalin(bumil);
      setSudahBersalin(alreadyBersalin ? true : true); // Default to true when opening this modal
      setTanggalBersalin(bumil.tanggalBersalin || new Date().toISOString().split('T')[0]);
      setTempatPersalinan(bumil.kondisiBersalin?.tempatPersalinan || bumil.tempatPersalinanDianjurkan || 'Puskesmas Nangkaan');
      setPenolong(bumil.kondisiBersalin?.penolong || bumil.penolongPersalinanDianjurkan || 'Bidan Puskesmas');
      setCaraPersalinan(bumil.kondisiBersalin?.caraPersalinan || 'Spontan / Normal');
      setKeadaanIbu(bumil.kondisiBersalin?.keadaanIbu || 'Sehat');
      setKeadaanBayi(bumil.kondisiBersalin?.keadaanBayi || 'Lahir Hidup Sehat');
      setBeratLahirGram(bumil.kondisiBersalin?.beratLahirGram || 3100);
      setPanjangBadanCm(bumil.kondisiBersalin?.panjangBadanCm || 49);
      setJenisKelaminBayi(bumil.kondisiBersalin?.jenisKelaminBayi || 'Laki-laki');
      setCatatanBersalin(bumil.kondisiBersalin?.catatanBersalin || '');
    }
  }, [bumil]);

  if (!isOpen || !bumil) return null;

  const handleSave = async () => {
    setIsSaving(true);

    const updatedBumil: IbuHamilData = {
      ...bumil,
      sudahBersalin: sudahBersalin,
      tanggalBersalin: sudahBersalin ? tanggalBersalin : undefined,
      statusKunjungan: sudahBersalin ? 'Selesai Bersalin' : (bumil.statusKunjungan === 'Selesai Bersalin' ? 'K4' : bumil.statusKunjungan || 'K1'),
      kondisiBersalin: sudahBersalin ? {
        tempatPersalinan,
        penolong,
        caraPersalinan,
        keadaanIbu,
        keadaanBayi,
        beratLahirGram: typeof beratLahirGram === 'number' ? beratLahirGram : undefined,
        panjangBadanCm: typeof panjangBadanCm === 'number' ? panjangBadanCm : undefined,
        jenisKelaminBayi,
        catatanBersalin
      } : undefined,
      updatedAt: new Date().toISOString()
    };

    const res = await saveBumilRecord(updatedBumil);
    setIsSaving(false);
    onSaved(res.data);
    onClose();
  };

  const handleResetToHamil = async () => {
    if (confirm(`Kembalikan status ibu ${bumil.namaIbu} menjadi 'Sedang Hamil' (aktif dipantau di peta)?`)) {
      setIsSaving(true);
      const updatedBumil: IbuHamilData = {
        ...bumil,
        sudahBersalin: false,
        statusKunjungan: 'K4',
        tanggalBersalin: undefined,
        kondisiBersalin: undefined,
        updatedAt: new Date().toISOString()
      };
      const res = await saveBumilRecord(updatedBumil);
      setIsSaving(false);
      onSaved(res.data);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50 via-teal-50 to-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20">
              <Baby className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                  Konfirmasi Status Persalinan
                </h3>
                <span className="text-xs font-mono bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
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

        {/* Body Form */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
          {/* Info Banner */}
          <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-2xl flex items-start gap-2.5 text-amber-950">
            <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Aturan Pemantauan Peta:</strong> Setelah ditandai <strong>"Sudah Bersalin"</strong>, titik pin ibu ini <strong>tidak akan dimunculkan lagi di peta aktif</strong>, namun data kohort dan rekapitulasi tetap tersimpan lengkap di laporan bulanan dan spreadsheet.
            </p>
          </div>

          {/* Toggle Sudah Bersalin */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-extrabold text-slate-800 block">
                Apakah Ibu Ini Sudah Melahirkan?
              </span>
              <span className="text-[11px] text-slate-500">
                Pilih status persalinan ibu hamil saat ini
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setSudahBersalin(true)}
                className={`px-3 py-1.5 rounded-xl font-black transition-all cursor-pointer flex items-center gap-1 ${
                  sudahBersalin
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-200 text-slate-600 hover:bg-blue-100 hover:text-blue-800'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Sudah Bersalin</span>
              </button>

              <button
                type="button"
                onClick={() => setSudahBersalin(false)}
                className={`px-3 py-1.5 rounded-xl font-black transition-all cursor-pointer ${
                  !sudahBersalin
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                }`}
              >
                Masih Hamil
              </button>
            </div>
          </div>

          {sudahBersalin && (
            <div className="space-y-3.5 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Tanggal Bersalin */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Tanggal Bersalin / Melahirkan:
                  </label>
                  <input
                    type="date"
                    value={tanggalBersalin}
                    onChange={(e) => setTanggalBersalin(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium"
                    required
                  />
                </div>

                {/* Cara Persalinan */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Cara Persalinan:
                  </label>
                  <select
                    value={caraPersalinan}
                    onChange={(e) => setCaraPersalinan(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium"
                  >
                    <option value="Spontan / Normal">Spontan / Normal (Pervaginam)</option>
                    <option value="Sectio Caesarea (SC)">Sectio Caesarea (SC / Operasi)</option>
                    <option value="Tindakan (Vakum/Forceps)">Tindakan (Vakum / Forceps)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Tempat Persalinan */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    Tempat Persalinan:
                  </label>
                  <input
                    type="text"
                    value={tempatPersalinan}
                    onChange={(e) => setTempatPersalinan(e.target.value)}
                    placeholder="Contoh: Puskesmas Nangkaan / RSUD Koesnadi"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium"
                  />
                </div>

                {/* Penolong Persalinan */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                    Penolong Persalinan:
                  </label>
                  <input
                    type="text"
                    value={penolong}
                    onChange={(e) => setPenolong(e.target.value)}
                    placeholder="Contoh: Bidan Puskesmas / Dokter SpOG"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium"
                  />
                </div>
              </div>

              {/* Data Bayi & Ibu */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <span className="font-extrabold text-slate-700 block uppercase tracking-wider text-[10px]">
                  Kondisi Kelahiran Bayi & Ibu:
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">Jenis Kelamin</label>
                    <select
                      value={jenisKelaminBayi}
                      onChange={(e) => setJenisKelaminBayi(e.target.value as any)}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs bg-white font-bold"
                    >
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">Berat Lahir (gr)</label>
                    <input
                      type="number"
                      value={beratLahirGram}
                      onChange={(e) => setBeratLahirGram(e.target.value ? Number(e.target.value) : '')}
                      placeholder="Contoh: 3100"
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs bg-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">Panjang (cm)</label>
                    <input
                      type="number"
                      value={panjangBadanCm}
                      onChange={(e) => setPanjangBadanCm(e.target.value ? Number(e.target.value) : '')}
                      placeholder="Contoh: 49"
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs bg-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">Keadaan Bayi</label>
                    <select
                      value={keadaanBayi}
                      onChange={(e) => setKeadaanBayi(e.target.value as any)}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs bg-white font-bold"
                    >
                      <option value="Lahir Hidup Sehat">Hidup Sehat</option>
                      <option value="BBLR">BBLR (&lt; 2500g)</option>
                      <option value="Asfiksia">Asfiksia</option>
                      <option value="Meninggal (IUFD/Neonatal)">Meninggal</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-500 mb-0.5">Catatan / Keterangan Persalinan Tambahan:</label>
                  <input
                    type="text"
                    value={catatanBersalin}
                    onChange={(e) => setCatatanBersalin(e.target.value)}
                    placeholder="Kondisi nifas, IMD, komplikasi pasca salin jika ada..."
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 flex items-center justify-between bg-slate-50">
          {isSudahBersalin(bumil) ? (
            <button
              type="button"
              onClick={handleResetToHamil}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 hover:underline cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Kembalikan ke 'Sedang Hamil'</span>
            </button>
          ) : (
            <span className="text-[11px] text-slate-400">
              *Data tersimpan permanen di register kohort.
            </span>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Tutup
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2.5 text-xs font-extrabold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Status Persalinan'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
