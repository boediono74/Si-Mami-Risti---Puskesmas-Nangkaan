import React from 'react';
import { 
  QrCode, 
  MapPin, 
  MessageCircle, 
  ExternalLink, 
  CheckCircle2, 
  ArrowRight,
  ShieldAlert,
  UserCheck,
  Heart,
  Sparkles,
  PhoneCall,
  FileText
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { DAFTAR_DESA, DesaName } from '../types/simami';

interface LandingPageProps {
  onOpenForm: () => void;
  onOpenLogin: () => void;
  onOpenScanner?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenForm,
  onOpenLogin
}) => {
  const baseUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}${window.location.pathname}`
    : 'https://si-mami-risti.bondowoso.go.id';
  const directFormUrl = `${baseUrl.replace(/\/$/, '')}?tab=form#form`;

  return (
    <div className="space-y-10 pb-16 max-w-5xl mx-auto">
      {/* Hero & Deskripsi Resmi Si Mami Risti */}
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10 lg:p-12 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-2.5 bg-linear-to-r from-emerald-600 via-teal-500 to-pink-500"></div>

        {/* Circular Logo Official (Large) */}
        <div className="flex justify-center mb-6">
          <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full p-1 bg-white shadow-xl border-4 border-emerald-500/20 hover:scale-105 transition-transform duration-300">
            <img 
              src="/logo-si-mami-risti.svg" 
              alt="Logo Resmi Si Mami Risti UPTD Puskesmas Nangkaan Bondowoso"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Badge Instansi */}
        <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-full text-xs font-bold text-emerald-800 mb-4">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>UPTD Puskesmas Nangkaan • Kabupaten Bondowoso</span>
        </div>

        {/* Judul & Deskripsi */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          <span className="text-emerald-800">Si Mami</span>{' '}
          <span className="text-pink-600">Risti</span>
        </h1>
        <p className="text-sm sm:text-base font-bold text-slate-700 mt-1 uppercase tracking-wide">
          Aplikasi Pemantauan Ibu Hamil Resiko Tinggi
        </p>

        <p className="mt-4 text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Selamat datang di portal pelayanan digital <strong>Si Mami Risti</strong> UPTD Puskesmas Nangkaan, 
          Kabupaten Bondowoso. Inovasi ini ditujukan bagi seluruh ibu hamil di <strong>5 wilayah binaan</strong> (Kelurahan Nangkaan, 
          Kelurahan Badean, Desa Pancoran, Desa Kembang, dan Desa Sukowiryo) untuk skrining dini faktor risiko kehamilan menggunakan 
          standar <strong>Skor Poedji Rochjati</strong>, pemetaan alamat rumah via GPS, serta pendampingan langsung oleh Bidan Desa.
        </p>

        {/* Barcode & Scan Section Khusus Ibu Hamil */}
        <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-center gap-8">
          {/* Box Barcode Besar */}
          <div 
            onClick={onOpenForm}
            className="bg-emerald-50/60 hover:bg-emerald-50 p-6 rounded-3xl border-2 border-emerald-300 shadow-sm flex flex-col items-center max-w-xs w-full text-center cursor-pointer transition-all hover:scale-102 group"
            title="Klik atau Scan untuk Langsung Menuju Form Isian Bumil"
          >
            <div className="bg-white p-3.5 rounded-2xl shadow-sm border border-emerald-200 group-hover:border-emerald-500 transition-colors">
              <QRCodeSVG
                value={directFormUrl}
                size={185}
                level="H"
                includeMargin={true}
              />
            </div>
            <div className="mt-3 space-y-1">
              <div className="inline-flex items-center gap-1 bg-emerald-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                <QrCode className="w-3 h-3" />
                <span>Scan &rarr; Langsung Form Isian</span>
              </div>
              <p className="text-xs font-black text-slate-900 mt-1">
                Barcode Pengisian Bumil
              </p>
              <p className="text-[11px] text-slate-600">
                Scan dengan kamera HP Anda untuk langsung membuka formulir pengisian data &amp; skrining
              </p>
            </div>
          </div>

          {/* Action Buttons for Ibu Hamil */}
          <div className="flex flex-col gap-3.5 max-w-sm w-full text-left">
            <div className="space-y-1">
              <h2 className="text-base font-extrabold text-slate-900">
                Langkah Pengisian Mandiri
              </h2>
              <p className="text-xs text-slate-500">
                Ibu hamil dapat langsung mengisi data atau kader Posyandu mendampingi pengisian:
              </p>
            </div>

            <button
              onClick={onOpenForm}
              className="w-full flex items-center justify-between gap-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm py-4 px-5 rounded-2xl shadow-lg shadow-emerald-600/25 transition-all transform hover:-translate-y-0.5 cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-emerald-200" />
                <span>Isi Formulir Data Bumil</span>
              </div>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onOpenLogin}
              className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-3 px-4 rounded-xl border border-slate-200 transition-colors cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>Login Bidan / Petugas Puskesmas</span>
            </button>
          </div>
        </div>
      </section>

      {/* 5 Grup WhatsApp Desa Resmi */}
      <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-emerald-600" />
              <span>Grup WhatsApp Resmi 5 Desa (Puskesmas Nangkaan)</span>
            </h2>
            <p className="text-xs text-slate-500">
              Silakan bergabung ke grup WhatsApp sesuai desa domisili ibu hamil untuk konsultasi dan pemantauan:
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
          {(Object.keys(DAFTAR_DESA) as DesaName[]).map((desaKey) => {
            const desa = DAFTAR_DESA[desaKey];
            return (
              <a
                key={desaKey}
                href={desa.waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-2xl flex flex-col justify-between transition-all hover:shadow-xs group"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-black text-slate-900 group-hover:text-emerald-800">
                      Desa {desa.name}
                    </span>
                    <ExternalLink className="w-3 h-3 text-emerald-600 opacity-60 group-hover:opacity-100" />
                  </div>
                  <p className="text-[10px] text-slate-600 leading-tight">
                    Bidan: {desa.penanggungJawab}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-emerald-200/60 flex items-center gap-1.5 text-[11px] font-bold text-emerald-700">
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Gabung Grup WA</span>
                </div>
              </a>
            );
          })}
        </div>
      </section>

      {/* Penjelasan 3 Kategori Risiko (Poedji Rochjati) */}
      <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <h2 className="text-base font-black text-slate-900">
          Penjelasan Kategori Risiko Kehamilan (Poedji Rochjati)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              <strong className="text-emerald-950 font-black text-sm">Warna HIJAU</strong>
            </div>
            <p className="font-bold text-emerald-900">Kehamilan Risiko Rendah (KRR)</p>
            <p className="text-emerald-800 leading-relaxed text-[11px]">
              Skor 2. Kehamilan tanpa penyulit. Persalinan dapat ditolong oleh Bidan atau Dokter di Puskesmas Nangkaan.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500"></span>
              <strong className="text-amber-950 font-black text-sm">Warna KUNING</strong>
            </div>
            <p className="font-bold text-amber-900">Kehamilan Risiko Tinggi (KRT)</p>
            <p className="text-amber-800 leading-relaxed text-[11px]">
              Skor 6 &ndash; 10. Terdapat satu atau lebih faktor bahaya. Membutuhkan rujukan terencana & konsultasi dokter SpOG.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-600 animate-pulse"></span>
              <strong className="text-rose-950 font-black text-sm">Warna MERAH</strong>
            </div>
            <p className="font-bold text-rose-900">Kehamilan Risiko Sangat Tinggi (KRST)</p>
            <p className="text-rose-800 leading-relaxed text-[11px]">
              Skor &ge; 12. Keadaan darurat atau komplikasi obstetri berat. Wajib Rujukan Dini Berencana ke RSUD Dr. H. Koesnadi.
            </p>
          </div>
        </div>
      </section>

      {/* Footer Puskesmas Nangkaan */}
      <footer className="text-center text-xs text-slate-500 space-y-1 pt-4">
        <p className="font-bold text-slate-700">
          UPTD Puskesmas Nangkaan • Dinas Kesehatan Kabupaten Bondowoso
        </p>
        <p className="text-[11px]">
          Jl. Brigpol Sudarlan No. 34, Nangkaan, Kec. Bondowoso, Kabupaten Bondowoso, Jawa Timur 68215
        </p>
      </footer>
    </div>
  );
};
