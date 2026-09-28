import React, { useState, useEffect } from 'react';
import { 
  HeartHandshake, 
  MapPin, 
  Navigation, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  MessageCircle, 
  ExternalLink, 
  Calculator, 
  User, 
  Calendar, 
  Save, 
  Sparkles,
  QrCode,
  ArrowRight,
  RefreshCw,
  Info,
  Stethoscope
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { QRCodeSVG } from 'qrcode.react';
import { 
  DesaName, 
  DAFTAR_DESA, 
  IbuHamilData, 
  DAFTAR_PEMERIKSAAN_NAKES, 
  PemeriksaanNakesKey 
} from '../types/simami';
import { SKRINING_ITEMS, hitungIMT, hitungTTP, hitungUsiaKehamilan, hitungSkorRisiko } from '../utils/calculator';
import { saveBumilRecord } from '../services/firebase';

interface BumilFormProps {
  initialData?: IbuHamilData | null;
  onSaved: (newData: IbuHamilData) => void;
  onCancel?: () => void;
}

export const BumilForm: React.FC<BumilFormProps> = ({
  initialData,
  onSaved,
  onCancel
}) => {
  // 1. Data Identitas & Wilayah
  const [desa, setDesa] = useState<DesaName>(initialData?.desa || 'Kelurahan Nangkaan');
  const [namaIbu, setNamaIbu] = useState(initialData?.namaIbu || '');
  const [nikIbu, setNikIbu] = useState(initialData?.nikIbu || '');
  const [namaSuami, setNamaSuami] = useState(initialData?.namaSuami || '');
  const [nikSuami, setNikSuami] = useState(initialData?.nikSuami || '');
  const [noHp, setNoHp] = useState(initialData?.noHp || '');
  const [umurIbu, setUmurIbu] = useState<number | ''>(initialData?.umurIbu || '');
  const [pendidikanIbu, setPendidikanIbu] = useState(initialData?.pendidikanIbu || 'SMA/SMK');
  const [pekerjaanIbu, setPekerjaanIbu] = useState(initialData?.pekerjaanIbu || 'Ibu Rumah Tangga');
  const [pekerjaanSuami, setPekerjaanSuami] = useState(initialData?.pekerjaanSuami || 'Wiraswasta');
  const [alamatLengkap, setAlamatLengkap] = useState(initialData?.alamatLengkap || '');

  // 2. Maps / Lokasi GPS
  const [latitude, setLatitude] = useState<number | undefined>(initialData?.latitude);
  const [longitude, setLongitude] = useState<number | undefined>(initialData?.longitude);
  const [mapsUrl, setMapsUrl] = useState<string>(initialData?.mapsUrl || '');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationSuccessMsg, setLocationSuccessMsg] = useState('');

  // 3. Data Kebidanan & Antropometri
  const [tb, setTb] = useState<number | ''>(initialData?.tb || '');
  const [bbSebelumHamil, setBbSebelumHamil] = useState<number | ''>(initialData?.bbSebelumHamil || '');
  const [bbSekarang, setBbSekarang] = useState<number | ''>(initialData?.bbSekarang || '');
  const [hpht, setHpht] = useState(initialData?.hpht || '');
  const [ttp, setTtp] = useState(initialData?.ttp || '');
  const [gravida, setGravida] = useState<number>(initialData?.gravida || 1);
  const [para, setPara] = useState<number>(initialData?.para || 0);
  const [abortus, setAbortus] = useState<number>(initialData?.abortus || 0);

  // 4. Skrining Poedji Rochjati (Pertanyaan Ya/Tidak)
  const [jawabanSkrining, setJawabanSkrining] = useState<Record<string, boolean>>(
    initialData?.jawabanSkrining || {}
  );

  // 5. Pemeriksaan Nakes (11 Indikator Penyakit / Komplikasi)
  const [pemeriksaanNakes, setPemeriksaanNakes] = useState<Partial<Record<PemeriksaanNakesKey, boolean>>>(
    initialData?.pemeriksaanNakes || {
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
    }
  );
  const [catatanPemeriksaanNakes, setCatatanPemeriksaanNakes] = useState(initialData?.catatanPemeriksaanNakes || '');
  const [tanggalPemeriksaanNakes, setTanggalPemeriksaanNakes] = useState(initialData?.tanggalPemeriksaanNakes || new Date().toISOString().split('T')[0]);
  const [pemeriksaNakes, setPemeriksaNakes] = useState(initialData?.pemeriksaNakes || '');

  // Status & Hasil Submit
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<IbuHamilData | null>(null);

  // Efek Otomatis: Hitung TTP saat HPHT diisi
  useEffect(() => {
    if (hpht) {
      const calculatedTtp = hitungTTP(hpht);
      setTtp(calculatedTtp);
    }
  }, [hpht]);

  // Efek Otomatis: Auto-check pertanyaan skrining tertentu berdasarkan Umur & TB
  useEffect(() => {
    const newJawaban = { ...jawabanSkrining };
    let changed = false;

    // Umur <= 16 th
    if (typeof umurIbu === 'number' && umurIbu > 0) {
      if (umurIbu <= 16) {
        if (!newJawaban['terlalu_muda']) {
          newJawaban['terlalu_muda'] = true;
          changed = true;
        }
      }
      if (umurIbu >= 35) {
        if (!newJawaban['terlalu_tua_umur']) {
          newJawaban['terlalu_tua_umur'] = true;
          changed = true;
        }
      }
    }

    // TB < 145 cm
    if (typeof tb === 'number' && tb > 0) {
      if (tb < 145) {
        if (!newJawaban['terlalu_pendek']) {
          newJawaban['terlalu_pendek'] = true;
          changed = true;
        }
      }
    }

    if (changed) {
      setJawabanSkrining(newJawaban);
    }
  }, [umurIbu, tb]);

  // Hitung IMT real-time
  const imtResult = hitungIMT(Number(bbSebelumHamil) || 0, Number(tb) || 0);

  // Hitung Skor Poedji Rochjati real-time
  const skorResult = hitungSkorRisiko(jawabanSkrining);
  const usiaKehamilan = hitungUsiaKehamilan(hpht);

  // Fungsi Ambil Lokasi GPS Saat Ini
  const handleAmbilLokasiGPS = () => {
    if (!navigator.geolocation) {
      alert('Perangkat Anda tidak mendukung fitur Geolocation GPS.');
      return;
    }

    setIsGettingLocation(true);
    setLocationSuccessMsg('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setLatitude(lat);
        setLongitude(lng);
        const url = `https://maps.google.com/?q=${lat},${lng}`;
        setMapsUrl(url);
        setIsGettingLocation(false);
        setLocationSuccessMsg(`Lokasi GPS berhasil diambil (${lat.toFixed(5)}, ${lng.toFixed(5)})`);
      },
      (error) => {
        setIsGettingLocation(false);
        console.warn('Gagal mendapatkan GPS:', error.message);
        // Fallback koordinat default desa yang dipilih
        const defaultDesaCoords = DAFTAR_DESA[desa];
        setLatitude(defaultDesaCoords.lat);
        setLongitude(defaultDesaCoords.lng);
        const url = `https://maps.google.com/?q=${defaultDesaCoords.lat},${defaultDesaCoords.lng}`;
        setMapsUrl(url);
        setLocationSuccessMsg(`Menggunakan titik koordinat Pusat Desa ${desa}`);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Toggle Jawaban Skrining
  const handleToggleSkrining = (id: string) => {
    setJawabanSkrining(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!namaIbu.trim()) {
      alert('Mohon isi Nama Lengkap Ibu Hamil!');
      return;
    }

    if (!nikIbu.trim() || nikIbu.length < 16) {
      alert('NIK Ibu Hamil harus 16 digit angka!');
      return;
    }

    setIsSubmitting(true);

    const generatedId = initialData?.id || `bumil-${Date.now()}`;
    const generatedKode = initialData?.kodeRegister || `REG-${desa.substring(0, 3).toUpperCase()}-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    const newRecord: IbuHamilData = {
      id: generatedId,
      kodeRegister: generatedKode,
      tanggalDaftar: initialData?.tanggalDaftar || new Date().toISOString().split('T')[0],
      desa,
      namaIbu: namaIbu.trim(),
      nikIbu: nikIbu.trim(),
      namaSuami: namaSuami.trim() || '-',
      nikSuami: nikSuami.trim() || '-',
      noHp: noHp.trim(),
      umurIbu: Number(umurIbu) || 0,
      pendidikanIbu,
      pekerjaanIbu,
      pekerjaanSuami,
      alamatLengkap: alamatLengkap.trim() || `Desa ${desa}, Kec. Bondowoso`,
      latitude: latitude || DAFTAR_DESA[desa].lat,
      longitude: longitude || DAFTAR_DESA[desa].lng,
      mapsUrl: mapsUrl || `https://maps.google.com/?q=${latitude || DAFTAR_DESA[desa].lat},${longitude || DAFTAR_DESA[desa].lng}`,
      tb: Number(tb) || 0,
      bbSebelumHamil: Number(bbSebelumHamil) || 0,
      bbSekarang: Number(bbSekarang) || Number(bbSebelumHamil) || 0,
      imt: imtResult.imt,
      imtStatus: imtResult.status,
      hpht,
      ttp,
      usiaKehamilanMinggu: usiaKehamilan,
      gravida,
      para,
      abortus,
      skorAwal: 2,
      jawabanSkrining,
      totalSkor: skorResult.totalSkor,
      kategoriRisiko: skorResult.kategoriRisiko,
      warnaRisiko: skorResult.warnaRisiko,
      tempatPersalinanDianjurkan: skorResult.rekomendasi.tempat,
      penolongPersalinanDianjurkan: skorResult.rekomendasi.penolong,
      rujukan: skorResult.rekomendasi.rujukan,
      statusKunjungan: initialData?.statusKunjungan || 'K1',
      catatanPetugas: initialData?.catatanPetugas || `Pemeriksaan awal Puskesmas Nangkaan, skor ${skorResult.totalSkor} (${skorResult.labelKategori}).`,
      pemeriksaanNakes,
      catatanPemeriksaanNakes,
      tanggalPemeriksaanNakes,
      pemeriksaNakes
    };

    const res = await saveBumilRecord(newRecord);
    setIsSubmitting(false);

    if (res.success) {
      setSubmittedData(res.data);
      onSaved(res.data);

      // Pesta konfeti jika berhasil
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // Abaikan jika tidak didukung
      }
    } else {
      alert(`Terjadi kesalahan penyimpanan: ${res.error}`);
    }
  };

  // Tampilan SUKSES setelah mendaftar
  if (submittedData) {
    const infoDesa = DAFTAR_DESA[submittedData.desa];
    const isMerah = submittedData.warnaRisiko === 'merah';
    const isKuning = submittedData.warnaRisiko === 'kuning';

    return (
      <div className="max-w-3xl mx-auto py-6 px-4 animate-in fade-in duration-300">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-6 sm:p-10 space-y-8">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Data Ibu Hamil Berhasil Disimpan!
            </h2>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Tersinkronisasi ke Firebase RTDB Puskesmas Nangkaan & Register Kohort
            </p>
          </div>

          {/* Kartu Hasil Skrining Poedji Rochjati */}
          <div className={`p-6 rounded-2xl border-2 transition-all ${
            isMerah 
              ? 'bg-rose-50/80 border-rose-400 text-rose-950' 
              : isKuning 
                ? 'bg-amber-50/80 border-amber-400 text-amber-950' 
                : 'bg-emerald-50/80 border-emerald-400 text-emerald-950'
          }`}>
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-black/10 pb-4">
              <div>
                <span className="text-xs uppercase font-extrabold tracking-wider opacity-75">
                  Hasil Skrining Skor Poedji Rochjati
                </span>
                <h3 className="text-xl sm:text-2xl font-black mt-0.5">
                  {skorResult.labelKategori}
                </h3>
              </div>
              <div className="text-right">
                <span className="text-xs uppercase font-extrabold tracking-wider opacity-75">Total Skor</span>
                <div className="text-3xl sm:text-4xl font-black">
                  {submittedData.totalSkor}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 text-xs">
              <div>
                <p className="font-semibold opacity-80">Nama Ibu:</p>
                <p className="text-sm font-extrabold">{submittedData.namaIbu}</p>
                <p className="opacity-75">NIK: {submittedData.nikIbu}</p>
              </div>

              <div>
                <p className="font-semibold opacity-80">Desa Domisili:</p>
                <p className="text-sm font-extrabold">Desa {submittedData.desa}</p>
                <p className="opacity-75">No. HP: {submittedData.noHp}</p>
              </div>

              <div>
                <p className="font-semibold opacity-80">HPL / TTP (Tafsiran Persalinan):</p>
                <p className="text-sm font-extrabold">{submittedData.ttp || 'Belum dihitung'}</p>
                <p className="opacity-75">Usia Hamil: {submittedData.usiaKehamilanMinggu} Minggu</p>
              </div>

              <div>
                <p className="font-semibold opacity-80">Rekomendasi Tempat Persalinan:</p>
                <p className="text-sm font-extrabold">{submittedData.tempatPersalinanDianjurkan}</p>
                <p className="opacity-75">Penolong: {submittedData.penolongPersalinanDianjurkan}</p>
              </div>
            </div>
          </div>

          {/* WA GROUP INVITATION (MANDATORY BENEFIT) */}
          <div className="bg-linear-to-r from-emerald-600 to-teal-700 rounded-2xl p-6 text-white shadow-lg space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <MessageCircle className="w-7 h-7 text-emerald-200" />
              </div>
              <div>
                <h4 className="text-lg font-bold">Wajib Bergabung ke Grup WhatsApp Desa {submittedData.desa}</h4>
                <p className="text-xs text-emerald-100 mt-1 leading-relaxed">
                  Bidan desa {infoDesa.penanggungJawab} memantau kesehatan kehamilan, 
                  jadwal posyandu, dan konsultasi darurat melalui grup WhatsApp ini.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <a
                href={infoDesa.waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-white text-emerald-900 hover:bg-emerald-50 font-extrabold py-3.5 px-4 rounded-xl shadow-md transition-all text-sm group"
              >
                <MessageCircle className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform" />
                <span>Klik di Sini untuk Masuk Grup WhatsApp Desa {submittedData.desa}</span>
                <ExternalLink className="w-4 h-4 text-emerald-700" />
              </a>
            </div>
          </div>

          {/* Barcode Kartu Bumil */}
          <div className="border border-slate-200 rounded-2xl p-6 text-center space-y-4 bg-slate-50">
            <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">
              Kode Barcode Digital Bumil
            </p>
            <div className="bg-white p-4 rounded-xl inline-block border border-slate-200 shadow-xs">
              <QRCodeSVG
                value={JSON.stringify({
                  id: submittedData.id,
                  nama: submittedData.namaIbu,
                  nik: submittedData.nikIbu,
                  desa: submittedData.desa,
                  skor: submittedData.totalSkor,
                  risiko: submittedData.warnaRisiko
                })}
                size={160}
                level="M"
              />
            </div>
            <p className="text-xs font-mono font-bold text-slate-800">
              {submittedData.kodeRegister}
            </p>
            <p className="text-[11px] text-slate-500">
              Simpan tangkapan layar (screenshot) barcode ini untuk ditunjukkan saat pemeriksaan di Posyandu / Puskesmas.
            </p>
          </div>

          {/* Tombol Navigasi Lanjutan */}
          <div className="flex flex-wrap gap-3 justify-center pt-2">
            <button
              onClick={() => {
                setSubmittedData(null);
                setNamaIbu('');
                setNikIbu('');
                setNamaSuami('');
                setNikSuami('');
                setNoHp('');
                setUmurIbu('');
                setTb('');
                setBbSebelumHamil('');
                setBbSekarang('');
                setHpht('');
                setTtp('');
                setJawabanSkrining({});
              }}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
            >
              + Input Ibu Hamil Baru
            </button>

            {onCancel && (
              <button
                onClick={onCancel}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Lihat di Register Kohort
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-4 px-3 sm:px-6">
      {/* Header Formulir */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
              <HeartHandshake className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {initialData ? 'Ubah Data Ibu Hamil' : 'Formulir Pendaftaran & Skrining Bumil'}
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Si Mami Risti • UPTD Puskesmas Nangkaan Kab. Bondowoso
              </p>
            </div>
          </div>

          {/* Live Indicator Skor */}
          <div className={`px-4 py-2.5 rounded-2xl border flex items-center gap-3 ${
            skorResult.warnaRisiko === 'merah'
              ? 'bg-rose-50 border-rose-300 text-rose-800'
              : skorResult.warnaRisiko === 'kuning'
                ? 'bg-amber-50 border-amber-300 text-amber-800'
                : 'bg-emerald-50 border-emerald-300 text-emerald-800'
          }`}>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider block">Skor Sementara</span>
              <span className="text-xl font-black">{skorResult.totalSkor}</span>
            </div>
            <div className="text-right">
              <span className="text-xs font-extrabold block">{skorResult.labelKategori}</span>
              <span className="text-[10px] opacity-80">Warna: {skorResult.warnaRisiko.toUpperCase()}</span>
            </div>
          </div>
        </div>

        {/* DAFTAR GRUP WHATSAPP 5 DESA PUSKESMAS NANGKAAN */}
        <div className="mt-6 bg-linear-to-r from-emerald-50 via-teal-50 to-emerald-50 border-2 border-emerald-200/90 rounded-2xl p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-200 pb-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-black text-sm text-emerald-950">
                  Daftar Grup WhatsApp 5 Desa (Puskesmas Nangkaan)
                </h3>
                <p className="text-[11px] text-emerald-700">
                  Ibu hamil silakan bergabung ke grup WA desa Anda untuk konsultasi &amp; informasi posyandu bidan desa:
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-emerald-800 bg-white px-2.5 py-1 rounded-full border border-emerald-300 self-start sm:self-auto">
              Desa Terpilih: <strong>{desa}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
            {(Object.keys(DAFTAR_DESA) as DesaName[]).map((desaKey) => {
              const dInfo = DAFTAR_DESA[desaKey];
              const isSelected = desa === desaKey;
              return (
                <div
                  key={desaKey}
                  className={`p-3 rounded-xl border transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-md transform -translate-y-0.5'
                      : 'bg-white hover:bg-emerald-50/70 border-emerald-200 text-slate-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-black text-xs">
                        Desa {dInfo.name}
                      </span>
                      {isSelected && (
                        <span className="bg-white/20 text-[9px] font-extrabold px-1.5 py-0.2 rounded text-white">
                          Dipilih
                        </span>
                      )}
                    </div>
                    <p className={`text-[10px] mt-0.5 leading-tight ${isSelected ? 'text-emerald-100' : 'text-slate-500'}`}>
                      {dInfo.penanggungJawab}
                    </p>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-black/10 flex items-center justify-between gap-1">
                    <button
                      type="button"
                      onClick={() => setDesa(desaKey)}
                      className={`text-[10px] font-bold underline cursor-pointer ${
                        isSelected ? 'text-emerald-100' : 'text-slate-600 hover:text-emerald-700'
                      }`}
                    >
                      {isSelected ? 'Desa Anda' : 'Pilih Desa'}
                    </button>
                    <a
                      href={dInfo.waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-1 text-[11px] font-black px-2 py-1 rounded-lg transition-colors ${
                        isSelected
                          ? 'bg-white text-emerald-900 hover:bg-emerald-50'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700'
                      }`}
                    >
                      <MessageCircle className="w-3 h-3" />
                      <span>Masuk WA</span>
                      <ExternalLink className="w-2.5 h-2.5 opacity-80" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-8">
          {/* SECTION 1: Wilayah & Identitas Ibu */}
          <div className="space-y-4">
            <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-l-4 border-emerald-600 pl-2">
              <User className="w-4 h-4 text-emerald-600" />
              <span>1. Identitas Ibu & Suami</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Pilihan 5 Desa */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Desa Domisili <span className="text-rose-500">*</span>
                </label>
                <select
                  value={desa}
                  onChange={(e) => setDesa(e.target.value as DesaName)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:outline-emerald-500 focus:bg-white"
                >
                  {(Object.keys(DAFTAR_DESA) as DesaName[]).map((d) => (
                    <option key={d} value={d}>
                      Desa {d} (Bidan: {DAFTAR_DESA[d].penanggungJawab})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Grup WA Desa otomatis disesuaikan setelah pendaftaran.
                </p>
              </div>

              {/* No. HP / WhatsApp */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  No. HP / WhatsApp Ibu / Keluarga <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="Contoh: 081234567890"
                  value={noHp}
                  onChange={(e) => setNoHp(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-emerald-500 focus:bg-white"
                />
              </div>

              {/* Nama Ibu */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Lengkap Ibu <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Masukkan nama lengkap ibu hamil"
                  value={namaIbu}
                  onChange={(e) => setNamaIbu(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-emerald-500 focus:bg-white"
                />
              </div>

              {/* NIK Ibu */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  NIK Ibu (16 Digit) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  maxLength={16}
                  placeholder="3511xxxxxxxxxxxx"
                  value={nikIbu}
                  onChange={(e) => setNikIbu(e.target.value.replace(/\D/g, ''))}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-mono text-slate-800 focus:outline-emerald-500 focus:bg-white"
                />
                {nikIbu && nikIbu.length !== 16 && (
                  <span className="text-[11px] text-amber-600 font-semibold">
                    {nikIbu.length}/16 digit angka
                  </span>
                )}
              </div>

              {/* Nama Suami */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Lengkap Suami
                </label>
                <input
                  type="text"
                  placeholder="Masukkan nama suami"
                  value={namaSuami}
                  onChange={(e) => setNamaSuami(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-emerald-500 focus:bg-white"
                />
              </div>

              {/* NIK Suami */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  NIK Suami (16 Digit)
                </label>
                <input
                  type="text"
                  maxLength={16}
                  placeholder="3511xxxxxxxxxxxx"
                  value={nikSuami}
                  onChange={(e) => setNikSuami(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-mono text-slate-800 focus:outline-emerald-500 focus:bg-white"
                />
              </div>

              {/* Umur Ibu */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Umur Ibu (Tahun) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min={12}
                  max={60}
                  placeholder="Contoh: 28"
                  value={umurIbu}
                  onChange={(e) => setUmurIbu(e.target.value ? Number(e.target.value) : '')}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-800 focus:outline-emerald-500 focus:bg-white"
                />
                {typeof umurIbu === 'number' && umurIbu <= 16 && (
                  <span className="text-[11px] text-rose-600 font-bold block mt-1">
                    ⚠️ Terlalu Muda (≤ 16 th) - Skor +4 Otomatis
                  </span>
                )}
                {typeof umurIbu === 'number' && umurIbu >= 35 && (
                  <span className="text-[11px] text-amber-600 font-bold block mt-1">
                    ⚠️ Terlalu Tua (≥ 35 th) - Skor +4 Otomatis
                  </span>
                )}
              </div>

              {/* Pendidikan Ibu */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pendidikan Terakhir Ibu
                </label>
                <select
                  value={pendidikanIbu}
                  onChange={(e) => setPendidikanIbu(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-emerald-500 focus:bg-white"
                >
                  <option value="SD">SD / Sederajat</option>
                  <option value="SMP">SMP / MTs</option>
                  <option value="SMA/SMK">SMA / SMK / MA</option>
                  <option value="Diploma">Diploma (D1/D2/D3)</option>
                  <option value="S1/D4">Sarjana (S1 / D4)</option>
                  <option value="S2/S3">Pascasarjana (S2 / S3)</option>
                  <option value="Tidak Sekolah">Tidak Tamat Sekolah</option>
                </select>
              </div>

              {/* Pekerjaan Ibu */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pekerjaan Ibu
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Ibu Rumah Tangga / Karyawan"
                  value={pekerjaanIbu}
                  onChange={(e) => setPekerjaanIbu(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-emerald-500 focus:bg-white"
                />
              </div>

              {/* Pekerjaan Suami */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pekerjaan Suami
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Wiraswasta / Petani / PNS"
                  value={pekerjaanSuami}
                  onChange={(e) => setPekerjaanSuami(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-emerald-500 focus:bg-white"
                />
              </div>
            </div>

            {/* Alamat Lengkap */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Alamat Rumah Lengkap (Dusun, RT/RW, Patokan Rumah)
              </label>
              <textarea
                rows={2}
                placeholder="Contoh: Dusun Krajan RT 02 RW 01, samping Masjid Al-Hidayah, Desa Nangkaan"
                value={alamatLengkap}
                onChange={(e) => setAlamatLengkap(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-emerald-500 focus:bg-white"
              ></textarea>
            </div>
          </div>

          {/* SECTION 2: Maps / Peta Lokasi Rumah (Langsung Ambil GPS Google Maps) */}
          <div className="space-y-4 pt-2">
            <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-l-4 border-rose-500 pl-2">
              <MapPin className="w-4 h-4 text-rose-500" />
              <span>2. Maps / Peta Rumah Ibu Hamil</span>
            </h2>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    Ambil Titik Koordinat Rumah via Google Maps / GPS
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Klik tombol di samping saat berada di rumah ibu hamil agar Bidan dapat berkunjung akurat.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAmbilLokasiGPS}
                  disabled={isGettingLocation}
                  className="flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Navigation className={`w-3.5 h-3.5 ${isGettingLocation ? 'animate-spin' : ''}`} />
                  <span>{isGettingLocation ? 'Mencari GPS...' : 'Ambil Lokasi Sekarang (GPS)'}</span>
                </button>
              </div>

              {locationSuccessMsg && (
                <div className="bg-emerald-100/70 border border-emerald-300 text-emerald-900 text-xs px-3.5 py-2 rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>{locationSuccessMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Latitude (Garis Lintang)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="-7.9234"
                    value={latitude ?? ''}
                    onChange={(e) => setLatitude(e.target.value ? parseFloat(e.target.value) : undefined)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-mono text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Longitude (Garis Bujur)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="113.8267"
                    value={longitude ?? ''}
                    onChange={(e) => setLongitude(e.target.value ? parseFloat(e.target.value) : undefined)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-mono text-slate-800"
                  />
                </div>
              </div>

              {mapsUrl && (
                <div className="pt-2 flex items-center justify-between text-xs">
                  <span className="text-slate-500 truncate max-w-xs">{mapsUrl}</span>
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-rose-600 hover:text-rose-700 font-bold inline-flex items-center gap-1 hover:underline"
                  >
                    <span>Buka di Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 3: Antropometri & Kebidanan (TB, BB, IMT Otomatis, HPHT, TTP Otomatis) */}
          <div className="space-y-4 pt-2">
            <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-l-4 border-teal-600 pl-2">
              <Calculator className="w-4 h-4 text-teal-600" />
              <span>3. Data Antropometri, IMT & Tafsiran Persalinan</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* TB */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tinggi Badan / TB (cm) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min={100}
                  max={210}
                  placeholder="Contoh: 155"
                  value={tb}
                  onChange={(e) => setTb(e.target.value ? Number(e.target.value) : '')}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-800 focus:outline-teal-500 focus:bg-white"
                />
                {typeof tb === 'number' && tb > 0 && tb < 145 && (
                  <span className="text-[11px] text-rose-600 font-bold block mt-1">
                    ⚠️ TB &lt; 145 cm (Risiko Panggul Sempit CPD) - Skor +4
                  </span>
                )}
              </div>

              {/* BB Sebelum Hamil */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  BB Sebelum Hamil (kg) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  min={25}
                  max={150}
                  placeholder="Contoh: 50"
                  value={bbSebelumHamil}
                  onChange={(e) => setBbSebelumHamil(e.target.value ? Number(e.target.value) : '')}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-800 focus:outline-teal-500 focus:bg-white"
                />
              </div>

              {/* IMT Otomatis */}
              <div className="bg-teal-50/70 border border-teal-200 rounded-xl p-3 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-teal-800">
                    IMT (Otomatis: BB / TB²)
                  </span>
                  <div className="text-xl font-black text-teal-950 mt-0.5">
                    {imtResult.imt > 0 ? `${imtResult.imt} kg/m²` : '-'}
                  </div>
                </div>
                <div className="mt-1">
                  <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    imtResult.status === 'Normal' 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : imtResult.status === 'Kurus' 
                        ? 'bg-amber-100 text-amber-800' 
                        : 'bg-rose-100 text-rose-800'
                  }`}>
                    Status: {imtResult.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* HPHT */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  HPHT (Hari Pertama Haid Terakhir) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={hpht}
                  onChange={(e) => setHpht(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-teal-500 focus:bg-white font-medium"
                />
              </div>

              {/* TTP / HPL Otomatis */}
              <div className="bg-slate-100 border border-slate-200 rounded-xl p-3 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-600">
                    TTP / HPL (Tafsiran Persalinan)
                  </span>
                  <div className="text-base font-extrabold text-slate-900 mt-1 font-mono">
                    {ttp || 'Otomatis dihitung'}
                  </div>
                </div>
                <span className="text-[10px] text-slate-500">Rumus Naegele (+7 hari, +9 bulan)</span>
              </div>

              {/* Usia Kehamilan */}
              <div className="bg-slate-100 border border-slate-200 rounded-xl p-3 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-600">
                    Usia Kehamilan Saat Ini
                  </span>
                  <div className="text-lg font-black text-slate-900 mt-1">
                    {usiaKehamilan > 0 ? `${usiaKehamilan} Minggu` : '-'}
                  </div>
                </div>
                <span className="text-[10px] text-slate-500">Berdasarkan tanggal hari ini</span>
              </div>
            </div>

            {/* Gravida, Para, Abortus */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Gravida (Hamil Ke-)
                </label>
                <input
                  type="number"
                  min={1}
                  max={15}
                  value={gravida}
                  onChange={(e) => setGravida(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Para (Melahirkan)
                </label>
                <input
                  type="number"
                  min={0}
                  max={15}
                  value={para}
                  onChange={(e) => setPara(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Abortus (Keguguran)
                </label>
                <input
                  type="number"
                  min={0}
                  max={10}
                  value={abortus}
                  onChange={(e) => setAbortus(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: Skrining Poedji Rochjati (Pertanyaan Ya / Tidak Lengkap Sesuai Permintaan) */}
          <div className="space-y-4 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-l-4 border-amber-500 pl-2">
                  <ShieldAlert className="w-4 h-4 text-amber-500" />
                  <span>4. Skrining Faktor Risiko Poedji Rochjati (Ya / Tidak)</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Centang pilihan &quot;Ya&quot; jika ibu hamil memiliki kondisi/riwayat di bawah ini:
                </p>
              </div>

              {/* Skor Awal Selalu 2 */}
              <div className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs px-3 py-1.5 rounded-xl font-bold flex items-center gap-2">
                <span>Skor Awal Bumil:</span>
                <span className="bg-emerald-600 text-white px-2 py-0.5 rounded-md">2</span>
              </div>
            </div>

            {/* Daftar Pertanyaan Skrining */}
            <div className="space-y-2.5">
              {SKRINING_ITEMS.map((item, index) => {
                const isChecked = !!jawabanSkrining[item.id];
                return (
                  <div
                    key={item.id}
                    onClick={() => handleToggleSkrining(item.id)}
                    className={`p-3 sm:p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isChecked
                        ? item.skor === 8
                          ? 'bg-rose-50 border-rose-400 shadow-xs'
                          : 'bg-amber-50 border-amber-400 shadow-xs'
                        : 'bg-white hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        {index + 1}
                      </span>
                      <div>
                        <p className={`text-xs sm:text-sm font-bold ${
                          isChecked 
                            ? item.skor === 8 ? 'text-rose-900' : 'text-amber-900' 
                            : 'text-slate-800'
                        }`}>
                          {item.label}
                        </p>
                        {item.deskripsi && (
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {item.deskripsi}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`text-xs font-black px-2 py-1 rounded-lg ${
                        item.skor === 8 
                          ? 'bg-rose-200 text-rose-800' 
                          : 'bg-amber-200 text-amber-800'
                      }`}>
                        +{item.skor}
                      </span>

                      {/* Switch Button */}
                      <button
                        type="button"
                        className={`w-14 py-1 px-2 rounded-lg text-xs font-extrabold uppercase transition-all ${
                          isChecked
                            ? item.skor === 8
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'bg-amber-600 text-white shadow-xs'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {isChecked ? 'YA' : 'TIDAK'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 5: Pemeriksaan Nakes (11 Indikator Penyakit / Komplikasi - Pilih Ya / Tidak) */}
          <div className="space-y-4 pt-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-l-4 border-teal-600 pl-2">
                  <Stethoscope className="w-4 h-4 text-teal-600" />
                  <span>5. Pemeriksaan Nakes (Pilih Ya / Tidak)</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  11 Indikator pemeriksaan medis/kebidanan tenaga kesehatan Puskesmas Nangkaan:
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  const allFalse: Partial<Record<PemeriksaanNakesKey, boolean>> = {};
                  DAFTAR_PEMERIKSAAN_NAKES.forEach(item => {
                    allFalse[item.key] = false;
                  });
                  setPemeriksaanNakes(allFalse);
                }}
                className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-lg transition-colors cursor-pointer"
              >
                Pilih Semua "Tidak" (Normal)
              </button>
            </div>

            {/* List 11 Pemeriksaan Nakes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {DAFTAR_PEMERIKSAAN_NAKES.map((item, index) => {
                const isPositive = pemeriksaanNakes[item.key] === true;
                return (
                  <div
                    key={item.key}
                    className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      isPositive
                        ? 'bg-rose-50 border-rose-300 shadow-xs'
                        : 'bg-white hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 flex-1 pr-2">
                      <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                        {index + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className={`text-xs font-bold ${
                            isPositive ? 'text-rose-900' : 'text-slate-800'
                          }`}>
                            {item.label}
                          </p>
                          {isPositive && (
                            <span className="text-[10px] font-black bg-rose-600 text-white px-2 py-0.2 rounded-full">
                              Positif
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">
                          {item.deskripsi}
                        </p>
                      </div>
                    </div>

                    {/* Button Group Ya / Tidak */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => setPemeriksaanNakes(prev => ({ ...prev, [item.key]: true }))}
                        className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                          isPositive
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-rose-100 hover:text-rose-800'
                        }`}
                      >
                        YA
                      </button>
                      <button
                        type="button"
                        onClick={() => setPemeriksaanNakes(prev => ({ ...prev, [item.key]: false }))}
                        className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                          !isPositive
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        TIDAK
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Catatan & Pemeriksa Tambahan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Petugas Pemeriksa / Bidan:
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Bd. Diana Yuli Aidhasari, A.Md. Keb."
                  value={pemeriksaNakes}
                  onChange={(e) => setPemeriksaNakes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-teal-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Catatan Tambahan Pemeriksaan Nakes:
                </label>
                <input
                  type="text"
                  placeholder="Catatan hasil lab Hb, tensi, terapi yang diberikan..."
                  value={catatanPemeriksaanNakes}
                  onChange={(e) => setCatatanPemeriksaanNakes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-teal-500 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Rangkuman Skor & Kategori */}
          <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                  Hasil Klasifikasi Kehamilan
                </span>
                <h3 className="text-xl sm:text-2xl font-black mt-0.5">
                  {skorResult.labelKategori}
                </h3>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Skor</span>
                <div className={`text-3xl sm:text-4xl font-black ${
                  skorResult.warnaRisiko === 'merah'
                    ? 'text-rose-400'
                    : skorResult.warnaRisiko === 'kuning'
                      ? 'text-amber-300'
                      : 'text-emerald-400'
                }`}>
                  {skorResult.totalSkor}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 text-xs text-slate-300 space-y-1">
              <p>• Tempat Persalinan Dianjurkan: <strong className="text-white">{skorResult.rekomendasi.tempat}</strong></p>
              <p>• Penolong Persalinan: <strong className="text-white">{skorResult.rekomendasi.penolong}</strong></p>
              <p>• Arahan Rujukan: <strong className="text-white">{skorResult.rekomendasi.rujukan}</strong></p>
            </div>
          </div>

          {/* Tombol Simpan & Batal */}
          <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-slate-200">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-5 py-3 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Batal
              </button>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm px-7 py-3 rounded-xl shadow-lg shadow-emerald-600/30 transition-all transform hover:-translate-y-0.5 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Menyimpan ke Firebase RTDB...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Simpan Data & Skrining Bumil</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
