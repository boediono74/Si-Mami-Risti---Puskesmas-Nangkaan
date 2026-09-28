import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  MapPin, 
  Phone, 
  MessageCircle, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Edit3, 
  Calendar,
  Building2,
  HeartHandshake,
  Stethoscope,
  Check,
  AlertCircle,
  Baby
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  IbuHamilData, 
  DAFTAR_DESA, 
  DAFTAR_PEMERIKSAAN_NAKES, 
  getDaftarPenyakitNakes, 
  PetugasUser,
  isSudahBersalin 
} from '../types/simami';
import { SKRINING_ITEMS } from '../utils/calculator';
import { PemeriksaanNakesModal } from './PemeriksaanNakesModal';
import { StatusBersalinModal } from './StatusBersalinModal';

interface BumilDetailModalProps {
  bumil: IbuHamilData | null;
  onClose: () => void;
  onEdit: (item: IbuHamilData) => void;
  onSaveBumil?: (item: IbuHamilData) => void;
  petugas?: PetugasUser | null;
}

export const BumilDetailModal: React.FC<BumilDetailModalProps> = ({
  bumil,
  onClose,
  onEdit,
  onSaveBumil,
  petugas
}) => {
  const [isPeriksaModalOpen, setIsPeriksaModalOpen] = useState(false);
  const [isBersalinModalOpen, setIsBersalinModalOpen] = useState(false);

  if (!bumil) return null;

  const desaInfo = DAFTAR_DESA[bumil.desa];
  const isMerah = bumil.warnaRisiko === 'merah';
  const isKuning = bumil.warnaRisiko === 'kuning';

  // Daftar faktor risiko yang positif (Ya) dari Poedji Rochjati
  const faktorRisikoPositif = SKRINING_ITEMS.filter(
    (item) => !!bumil.jawabanSkrining[item.id]
  );

  // Daftar penyakit positif dari Pemeriksaan Nakes
  const daftarPenyakit = getDaftarPenyakitNakes(bumil.pemeriksaanNakes);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-white ${
              isMerah ? 'bg-rose-600' : isKuning ? 'bg-amber-500' : 'bg-emerald-600'
            }`}>
              {bumil.totalSkor}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                  {bumil.namaIbu}
                </h3>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                  isMerah ? 'bg-rose-100 text-rose-800' : isKuning ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {bumil.kategoriRisiko} ({bumil.warnaRisiko.toUpperCase()})
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono">
                {bumil.kodeRegister} • {bumil.desa}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => window.print()}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              title="Cetak Kartu"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                onClose();
                onEdit(bumil);
              }}
              className="p-2 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
              title="Edit Data"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* Status Box */}
          <div className={`p-4 rounded-2xl border ${
            isMerah 
              ? 'bg-rose-50 border-rose-300 text-rose-950' 
              : isKuning 
                ? 'bg-amber-50 border-amber-300 text-amber-950' 
                : 'bg-emerald-50 border-emerald-300 text-emerald-950'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-75">
                  Klasifikasi Risiko Poedji Rochjati
                </span>
                <p className="text-base font-extrabold mt-0.5">
                  {isMerah ? 'Kehamilan Risiko Sangat Tinggi (KRST)' : isKuning ? 'Kehamilan Risiko Tinggi (KRT)' : 'Kehamilan Risiko Rendah (KRR)'}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-75">Skor Akhir</span>
                <p className="text-2xl font-black">{bumil.totalSkor}</p>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-black/10 text-xs space-y-1">
              <p>• Tempat Persalinan Dianjurkan: <strong>{bumil.tempatPersalinanDianjurkan}</strong></p>
              <p>• Penolong: <strong>{bumil.penolongPersalinanDianjurkan}</strong></p>
              <p>• Rujukan: <strong>{bumil.rujukan}</strong></p>
            </div>
          </div>

          {/* Status Persalinan Card */}
          {isSudahBersalin(bumil) ? (
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <Baby className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase text-blue-900">
                      Status: Sudah Bersalin / Melahirkan
                    </span>
                    <span className="text-[10px] bg-blue-200 text-blue-900 font-bold px-2 py-0.2 rounded-full">
                      Tgl: {bumil.tanggalBersalin || '-'}
                    </span>
                  </div>
                  <p className="text-[11px] text-blue-800 mt-0.5">
                    {bumil.kondisiBersalin?.tempatPersalinan ? `Tempat: ${bumil.kondisiBersalin.tempatPersalinan} • ` : ''}
                    {bumil.kondisiBersalin?.caraPersalinan ? `Cara: ${bumil.kondisiBersalin.caraPersalinan} • ` : ''}
                    Bayi: {bumil.kondisiBersalin?.keadaanBayi || 'Lahir Hidup'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsBersalinModalOpen(true)}
                className="text-xs font-bold text-blue-700 bg-white hover:bg-blue-100 px-3 py-1.5 rounded-xl border border-blue-300 transition-colors shrink-0 cursor-pointer"
              >
                Ubah Data Persalinan
              </button>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <div>
                  <span className="text-xs font-extrabold text-emerald-900">
                    Status: Sedang Hamil (Aktif Dipantau di Peta)
                  </span>
                  <p className="text-[10px] text-emerald-700">
                    Titik GPS ibu hamil ini saat ini aktif ditampilkan di peta sebaran.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsBersalinModalOpen(true)}
                className="text-xs font-extrabold text-white bg-blue-600 hover:bg-blue-700 px-3.5 py-1.5 rounded-xl shadow-xs transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
              >
                <Baby className="w-3.5 h-3.5" />
                <span>Tandai Sudah Bersalin</span>
              </button>
            </div>
          )}

          {/* PEMERIKSAAN NAKES (11 Indikator Penyakit / Komplikasi) */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-teal-700" />
                <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                  Hasil Pemeriksaan Nakes (11 Indikator)
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsPeriksaModalOpen(true)}
                className="text-xs font-bold text-teal-700 bg-white hover:bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-300 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Edit3 className="w-3 h-3" />
                <span>Ubah / Periksa (Ya/Tidak)</span>
              </button>
            </div>

            {/* List 11 Indikator */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {DAFTAR_PEMERIKSAAN_NAKES.map((item) => {
                const isPositive = bumil.pemeriksaanNakes?.[item.key] === true;
                return (
                  <div
                    key={item.key}
                    className={`p-2 rounded-xl border flex items-center justify-between transition-colors ${
                      isPositive 
                        ? 'bg-rose-50 border-rose-200 text-rose-950 font-bold' 
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    <span className="text-[11px] truncate mr-2" title={item.label}>
                      {item.label}
                    </span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${
                      isPositive
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {isPositive ? 'YA' : 'TIDAK'}
                    </span>
                  </div>
                );
              })}
            </div>

            {bumil.catatanPemeriksaanNakes && (
              <div className="mt-3 pt-2.5 border-t border-slate-200 text-[11px] text-slate-600">
                <strong>Catatan Nakes:</strong> {bumil.catatanPemeriksaanNakes}
                {bumil.pemeriksaNakes && (
                  <span className="text-slate-400 block mt-0.5">Oleh: {bumil.pemeriksaNakes} ({bumil.tanggalPemeriksaanNakes || '-'})</span>
                )}
              </div>
            )}
          </div>

          {/* Data Lengkap Ibu & Suami */}
          <div>
            <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-3">
              Identitas & Antropometri
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div>
                <span className="text-slate-400 block text-[10px]">NIK Ibu</span>
                <strong className="text-slate-800 font-mono">{bumil.nikIbu}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Umur Ibu</span>
                <strong className="text-slate-800">{bumil.umurIbu} Tahun</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Pekerjaan Ibu</span>
                <strong className="text-slate-800">{bumil.pekerjaanIbu || '-'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Nama Suami</span>
                <strong className="text-slate-800">{bumil.namaSuami || '-'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">NIK Suami</span>
                <strong className="text-slate-800 font-mono">{bumil.nikSuami || '-'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Pekerjaan Suami</span>
                <strong className="text-slate-800">{bumil.pekerjaanSuami || '-'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Tinggi / Berat Badan</span>
                <strong className="text-slate-800">{bumil.tb} cm / {bumil.bbSebelumHamil} kg</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">IMT & Status</span>
                <strong className="text-slate-800">{bumil.imt} ({bumil.imtStatus})</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">HPHT / HPL (TTP)</span>
                <strong className="text-slate-800">{bumil.hpht} / {bumil.ttp}</strong>
              </div>
            </div>
          </div>

          {/* Faktor Risiko Terdeteksi Poedji Rochjati */}
          <div>
            <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">
              Faktor Risiko Positif (Poedji Rochjati)
            </h4>
            <div className="space-y-1.5 text-xs">
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex justify-between items-center text-emerald-900">
                <span className="font-semibold">Skor Awal Ibu Hamil</span>
                <span className="font-bold bg-emerald-200 px-2 py-0.5 rounded text-[11px]">+2</span>
              </div>

              {faktorRisikoPositif.length === 0 ? (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 text-center text-[11px]">
                  Tidak ada faktor risiko tambahan terdeteksi (Kehamilan Fisiologis Normal).
                </div>
              ) : (
                faktorRisikoPositif.map((item) => (
                  <div 
                    key={item.id}
                    className={`p-2.5 rounded-xl border flex justify-between items-center ${
                      item.skor === 8 
                        ? 'bg-rose-50 border-rose-200 text-rose-900' 
                        : 'bg-amber-50 border-amber-200 text-amber-900'
                    }`}
                  >
                    <div>
                      <p className="font-bold text-xs">{item.label}</p>
                      {item.deskripsi && (
                        <p className="text-[10px] opacity-75">{item.deskripsi}</p>
                      )}
                    </div>
                    <span className="font-black px-2 py-0.5 rounded text-xs bg-white/80 shrink-0">
                      +{item.skor}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Lokasi & WhatsApp Group Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {/* Grup WA Desa */}
            <a
              href={desaInfo?.waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl shadow-xs transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <MessageCircle className="w-5 h-5 text-emerald-300" />
                <div className="text-left">
                  <p className="text-xs font-bold">Grup WA Desa {bumil.desa}</p>
                  <p className="text-[10px] text-emerald-200">Bidan: {desaInfo?.penanggungJawab}</p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 opacity-80" />
            </a>

            {/* Google Maps Navigasi */}
            {bumil.mapsUrl ? (
              <a
                href={bumil.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl shadow-xs transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-5 h-5 text-rose-200" />
                  <div className="text-left">
                    <p className="text-xs font-bold">Navigasi Peta Rumah</p>
                    <p className="text-[10px] text-rose-100">Buka di Google Maps</p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 opacity-80" />
              </a>
            ) : (
              <div className="flex items-center p-3.5 bg-slate-100 text-slate-500 rounded-2xl text-xs">
                <MapPin className="w-4 h-4 mr-2" />
                <span>Titik GPS belum diatur</span>
              </div>
            )}
          </div>

          {/* Barcode Display */}
          <div className="text-center pt-2 border-t border-slate-100">
            <div className="inline-block bg-slate-50 p-3 rounded-xl border border-slate-200">
              <QRCodeSVG
                value={JSON.stringify({
                  id: bumil.id,
                  nama: bumil.namaIbu,
                  nik: bumil.nikIbu,
                  desa: bumil.desa,
                  skor: bumil.totalSkor
                })}
                size={110}
                level="M"
              />
            </div>
            <p className="text-[10px] text-slate-500 font-mono mt-1">
              Barcode ID: {bumil.kodeRegister}
            </p>
          </div>
        </div>
      </div>

      {/* Modal Pemeriksaan Nakes (Pilih Ya/Tidak) */}
      <PemeriksaanNakesModal
        isOpen={isPeriksaModalOpen}
        bumil={bumil}
        petugas={petugas}
        onClose={() => setIsPeriksaModalOpen(false)}
        onSaved={(updated) => {
          if (onSaveBumil) {
            onSaveBumil(updated);
          }
          setIsPeriksaModalOpen(false);
        }}
      />

      {/* Modal Status Persalinan (Sudah Bersalin) */}
      <StatusBersalinModal
        isOpen={isBersalinModalOpen}
        bumil={bumil}
        petugas={petugas}
        onClose={() => setIsBersalinModalOpen(false)}
        onSaved={(updated) => {
          if (onSaveBumil) {
            onSaveBumil(updated);
          }
          setIsBersalinModalOpen(false);
        }}
      />
    </div>
  );
};
