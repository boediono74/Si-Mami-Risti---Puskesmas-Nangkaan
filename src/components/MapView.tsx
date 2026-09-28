import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  MapPin, 
  Layers, 
  Filter, 
  ExternalLink, 
  Phone, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Building2,
  Stethoscope,
  Info,
  Maximize2,
  Eye,
  Baby,
  UserCheck
} from 'lucide-react';
import { 
  IbuHamilData, 
  DAFTAR_DESA, 
  DesaName, 
  DAFTAR_PEMERIKSAAN_NAKES, 
  PemeriksaanNakesKey,
  getDaftarPenyakitNakes,
  isSudahBersalin,
  PetugasUser 
} from '../types/simami';
import { StatusBersalinModal } from './StatusBersalinModal';

interface MapViewProps {
  data: IbuHamilData[];
  onSelectBumil: (bumil: IbuHamilData) => void;
  onOpenPemeriksaan?: (bumil: IbuHamilData) => void;
  onSaveBumil?: (bumil: IbuHamilData) => void;
  petugas?: PetugasUser | null;
}

export const MapView: React.FC<MapViewProps> = ({ 
  data, 
  onSelectBumil, 
  onOpenPemeriksaan,
  onSaveBumil,
  petugas 
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const circlesLayerRef = useRef<L.LayerGroup | null>(null);

  const [activeDesa, setActiveDesa] = useState<DesaName | 'Semua'>('Semua');
  const [activeRisiko, setActiveRisiko] = useState<'Semua' | 'hijau' | 'kuning' | 'merah'>('Semua');
  const [activePenyakit, setActivePenyakit] = useState<PemeriksaanNakesKey | 'Semua'>('Semua');
  const [showCircles, setShowCircles] = useState<boolean>(true);
  const [showSudahBersalin, setShowSudahBersalin] = useState<boolean>(false);

  // Modal Status Bersalin
  const [bumilModalBersalin, setBumilModalBersalin] = useState<IbuHamilData | null>(null);

  // Pusat UPTD Puskesmas Nangkaan Bondowoso (Jl. Brigpol Sudarlan No. 34, Nangkaan, Kec. Bondowoso)
  const PUSKESMAS_COORDS: [number, number] = [-7.9275, 113.8105];

  // Hitung jumlah aktif vs bersalin
  const totalBumil = data.length;
  const countBersalin = data.filter(b => isSudahBersalin(b)).length;
  const countAktif = totalBumil - countBersalin;

  // Inisialisasi Peta
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [-7.9380, 113.8110],
        zoom: 13,
        zoomControl: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors • Puskesmas Nangkaan Bondowoso',
        maxZoom: 19
      }).addTo(map);

      // Marker Puskesmas Nangkaan (Pusat Faskes Induk)
      const puskesmasIcon = L.divIcon({
        className: 'custom-puskesmas-icon',
        html: `
          <div style="background-color: #047857; color: white; width: 42px; height: 42px; border-radius: 14px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.35); border: 2.5px solid white; font-weight: bold; font-size: 20px;">
            🏥
          </div>
        `,
        iconSize: [42, 42],
        iconAnchor: [21, 21]
      });

      const puskMarker = L.marker(PUSKESMAS_COORDS, { icon: puskesmasIcon }).addTo(map);
      puskMarker.bindPopup(`
        <div style="font-family: system-ui, -apple-system, sans-serif; padding: 6px; min-width: 230px;">
          <div style="display:flex; align-items:center; gap: 6px; margin-bottom: 4px;">
            <span style="font-size: 16px;">🏥</span>
            <strong style="color: #047857; font-size: 13px;">UPTD Puskesmas Nangkaan</strong>
          </div>
          <p style="font-size: 11px; margin: 0; color: #475569; line-height: 1.4;">
            Jl. Brigpol Sudarlan No. 34, Kelurahan Nangkaan, Kec. Bondowoso, Kab. Bondowoso
          </p>
          <div style="margin-top: 6px; padding: 4px 6px; background:#ecfdf5; border:1px solid #a7f3d0; border-radius:6px; font-size:10px; color:#065f46; font-weight:bold;">
            Pusat Faskes Induk Pemantauan Bumil 5 Wilayah Kerja
          </div>
        </div>
      `);

      circlesLayerRef.current = L.layerGroup().addTo(map);
      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Lingkaran Wilayah Kerja 5 Desa / Kelurahan
  useEffect(() => {
    if (!mapInstanceRef.current || !circlesLayerRef.current) return;

    circlesLayerRef.current.clearLayers();

    if (!showCircles) return;

    // Gambar Area / Lingkaran 5 Wilayah Kerja Resmi Puskesmas Nangkaan
    Object.keys(DAFTAR_DESA).forEach((desaKey) => {
      const desa = DAFTAR_DESA[desaKey as DesaName];
      const bumilAktifDesa = data.filter(d => d.desa === desa.name && !isSudahBersalin(d)).length;
      const isSelected = activeDesa === desa.name;

      const desaCircle = L.circle([desa.lat, desa.lng], {
        color: desa.color,
        fillColor: desa.fillColor,
        fillOpacity: isSelected ? 0.22 : 0.12,
        radius: desa.radius,
        weight: isSelected ? 3 : 2,
        dashArray: isSelected ? undefined : '5, 5'
      });

      desaCircle.bindTooltip(`
        <div style="text-align: center; font-family: system-ui, sans-serif;">
          <strong style="color: ${desa.color}; font-size: 11px;">${desa.name}</strong><br/>
          <span style="font-size: 10px; color: #475569;">Kec. Bondowoso, Kab. Bondowoso</span><br/>
          <span style="font-size: 9px; font-weight: bold; background: #f1f5f9; padding: 1px 4px; border-radius: 4px;">${bumilAktifDesa} Bumil Aktif</span>
        </div>
      `, {
        permanent: false,
        direction: 'center',
        opacity: 0.95
      });

      desaCircle.bindPopup(`
        <div style="font-family: system-ui, -apple-system, sans-serif; padding: 4px; min-width: 220px;">
          <div style="font-size: 10px; font-weight: 800; color: ${desa.color}; text-transform: uppercase; letter-spacing: 0.5px;">
            Wilayah Kerja Puskesmas Nangkaan
          </div>
          <strong style="font-size: 13px; color: #0f172a; display: block; margin-top: 2px;">
            ${desa.wilayahLengkap}
          </strong>
          <div style="margin-top: 6px; font-size: 11px; color: #334155; line-height: 1.4; background: #f8fafc; padding: 6px; border-radius: 8px;">
            <div><strong>Penanggung Jawab:</strong> ${desa.penanggungJawab}</div>
            <div><strong>Kontak Bidan:</strong> ${desa.kontakBidan}</div>
            <div><strong>Bumil Aktif Dipantau:</strong> ${bumilAktifDesa} Orang</div>
          </div>
        </div>
      `);

      desaCircle.addTo(circlesLayerRef.current!);
    });
  }, [data, showCircles, activeDesa]);

  // Update Markers Bumil saat data atau filter berubah
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    // Filter Ibu Hamil
    const filteredBumil = data.filter((b) => {
      // ATURAN UTAMA: Jika ibu hamil sudah melahirkan / bersalin, maka di peta TIDAK MUNCUL
      const sudahLahir = isSudahBersalin(b);
      if (sudahLahir && !showSudahBersalin) {
        return false;
      }

      if (activeDesa !== 'Semua' && b.desa !== activeDesa) return false;
      if (activeRisiko !== 'Semua' && b.warnaRisiko !== activeRisiko) return false;
      if (activePenyakit !== 'Semua') {
        if (!b.pemeriksaanNakes || !b.pemeriksaanNakes[activePenyakit]) {
          return false;
        }
      }
      return true;
    });

    // Tambahkan Pin Ibu Hamil
    filteredBumil.forEach((bumil) => {
      const defaultCoords = DAFTAR_DESA[bumil.desa] || { lat: PUSKESMAS_COORDS[0], lng: PUSKESMAS_COORDS[1] };
      const lat = bumil.latitude || defaultCoords.lat;
      const lng = bumil.longitude || defaultCoords.lng;

      // Beri sedikit jitter acak agar pin yang berada di desa yang sama tidak saling menutupi
      const jitterLat = lat + (Math.random() - 0.5) * 0.0018;
      const jitterLng = lng + (Math.random() - 0.5) * 0.0018;

      const isBersalin = isSudahBersalin(bumil);

      let pinColor = '#10b981'; // Hijau
      let pinEmoji = '🟢';
      let badgeLabel = 'Risiko Rendah (KRR)';
      let badgeBg = '#d1fae5';
      let badgeColor = '#065f46';

      if (isBersalin) {
        pinColor = '#3b82f6'; // Biru untuk yang sudah bersalin (jika diaktifkan di arsip)
        pinEmoji = '👶';
        badgeLabel = 'Sudah Bersalin';
        badgeBg = '#dbeafe';
        badgeColor = '#1e40af';
      } else if (bumil.warnaRisiko === 'merah') {
        pinColor = '#e11d48'; // Merah
        pinEmoji = '🔴';
        badgeLabel = 'Risiko Sangat Tinggi (KRST)';
        badgeBg = '#ffe4e6';
        badgeColor = '#9f1239';
      } else if (bumil.warnaRisiko === 'kuning') {
        pinColor = '#f59e0b'; // Kuning
        pinEmoji = '🟡';
        badgeLabel = 'Risiko Tinggi (KRT)';
        badgeBg = '#fef3c7';
        badgeColor = '#92400e';
      }

      // Daftar Penyakit dari Pemeriksaan Nakes
      const daftarPenyakit = getDaftarPenyakitNakes(bumil.pemeriksaanNakes);
      const hasPenyakit = daftarPenyakit.length > 0;

      const customIcon = L.divIcon({
        className: 'custom-bumil-pin',
        html: `
          <div style="position: relative; width: 32px; height: 32px; cursor: pointer;">
            <div style="background-color: ${pinColor}; width: 28px; height: 28px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border: 2px solid white;">
              <span style="transform: rotate(45deg); font-size: 11px; font-weight: 900; color: white;">
                ${isBersalin ? '👶' : bumil.totalSkor}
              </span>
            </div>
            ${bumil.warnaRisiko === 'merah' && !isBersalin ? '<div style="position: absolute; top: -3px; left: -3px; width: 34px; height: 34px; border-radius: 50%; border: 2px solid #e11d48; opacity: 0.75; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>' : ''}
            ${hasPenyakit && !isBersalin ? '<div style="position: absolute; top: -5px; right: -3px; width: 14px; height: 14px; background: #e11d48; border: 1.5px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 9px; color: white; font-weight: bold;" title="Penyakit Nakes Terdeteksi">!</div>' : ''}
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 30]
      });

      const marker = L.marker([jitterLat, jitterLng], { icon: customIcon });

      // HTML Konten Popup dengan Bagian Penyakit / Pemeriksaan Nakes
      const penyakitHtml = hasPenyakit ? `
        <div style="margin-top: 8px; padding: 7px 9px; background: #fff1f2; border: 1.5px solid #fecdd3; border-radius: 8px;">
          <div style="font-size: 10px; font-weight: 800; color: #9f1239; margin-bottom: 5px; display: flex; align-items: center; gap: 4px;">
            <span>🩺</span> HASIL PEMERIKSAAN NAKES (${daftarPenyakit.length} Penyakit / Komplikasi):
          </div>
          <div style="display: flex; flex-wrap: wrap; gap: 3px;">
            ${daftarPenyakit.map(p => `
              <span style="font-size: 10px; font-weight: 800; background: #e11d48; color: white; padding: 2px 6px; border-radius: 5px; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">
                ⚠️ ${p}
              </span>
            `).join('')}
          </div>
          ${bumil.catatanPemeriksaanNakes ? `
            <div style="font-size: 10px; color: #881337; margin-top: 4px; font-style: italic; border-top: 1px dashed #fecdd3; padding-top: 3px;">
              "${bumil.catatanPemeriksaanNakes}"
            </div>
          ` : ''}
        </div>
      ` : `
        <div style="margin-top: 8px; padding: 6px 9px; background: #ecfdf5; border: 1.5px solid #a7f3d0; border-radius: 8px;">
          <div style="font-size: 10px; font-weight: 700; color: #065f46; display: flex; align-items: center; gap: 4px;">
            <span>✅</span> Pemeriksaan Nakes: Tidak Ada Penyakit Terdeteksi (Normal)
          </div>
        </div>
      `;

      const statusBersalinHtml = isBersalin ? `
        <div style="margin-top: 6px; padding: 5px 8px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; font-size: 10px; color: #1e40af; font-weight: bold;">
          👶 Status: Sudah Melahirkan pada ${bumil.tanggalBersalin || '-'}
        </div>
      ` : `
        <div style="margin-top: 6px; display: flex; align-items: center; justify-content: space-between; background: #f8fafc; padding: 4px 8px; border-radius: 6px; font-size: 10px;">
          <span style="color: #64748b; font-weight: 600;">Status: Sedang Hamil Aktif</span>
          <button id="btn-mark-bersalin-${bumil.id}" style="background: #2563eb; color: white; border: none; padding: 3px 8px; border-radius: 4px; font-weight: bold; cursor: pointer; font-size: 10px;">
            👶 Sudah Bersalin?
          </button>
        </div>
      `;

      const popupContent = `
        <div style="font-family: system-ui, -apple-system, sans-serif; min-width: 250px; padding: 2px;">
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 6px;">
            <span style="font-size: 10px; font-weight: 800; background: ${badgeBg}; color: ${badgeColor}; padding: 2px 7px; border-radius: 9999px;">
              ${pinEmoji} ${badgeLabel}
            </span>
            <span style="font-size: 10px; font-weight: 800; color: #334155;">
              ${bumil.desa}
            </span>
          </div>

          <div style="margin-bottom: 6px;">
            <strong style="font-size: 14px; color: #0f172a; display: block; line-height: 1.2;">
              ${bumil.namaIbu} (${bumil.umurIbu} th)
            </strong>
            <span style="font-size: 11px; color: #64748b;">
              Suami: ${bumil.namaSuami || '-'} • Skor Poedji: <strong>${bumil.totalSkor}</strong>
            </span>
          </div>

          <div style="background: #f8fafc; padding: 6px 8px; border-radius: 8px; font-size: 11px; color: #334155; line-height: 1.4;">
            <div><strong>HPL (TTP):</strong> ${bumil.ttp || '-'} (Usia: ${bumil.usiaKehamilanMinggu || 0} Minggu)</div>
            <div><strong>Alamat:</strong> ${bumil.alamatLengkap}</div>
          </div>

          ${statusBersalinHtml}
          ${penyakitHtml}

          <div style="display: flex; gap: 4px; margin-top: 8px;">
            ${bumil.noHp ? `
              <a href="https://wa.me/${bumil.noHp.replace(/^0/, '62')}" target="_blank" style="flex:1; background:#059669; color:white; font-size:11px; font-weight:bold; padding: 6px; border-radius: 7px; text-decoration:none; text-align:center;">
                WhatsApp
              </a>
            ` : ''}
            ${bumil.mapsUrl ? `
              <a href="${bumil.mapsUrl}" target="_blank" style="flex:1; background:#e11d48; color:white; font-size:11px; font-weight:bold; padding: 6px; border-radius: 7px; text-decoration:none; text-align:center;">
                Google Maps
              </a>
            ` : ''}
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, { maxWidth: 310 });

      marker.on('popupopen', () => {
        const btnMark = document.getElementById(`btn-mark-bersalin-${bumil.id}`);
        if (btnMark) {
          btnMark.onclick = (e) => {
            e.stopPropagation();
            setBumilModalBersalin(bumil);
          };
        }
      });

      marker.on('click', () => {
        onSelectBumil(bumil);
      });

      marker.addTo(markersLayerRef.current!);
    });
  }, [data, activeDesa, activeRisiko, activePenyakit, showSudahBersalin, onSelectBumil]);

  // Zoom ke Desa
  const handleZoomToDesa = (desaName: DesaName) => {
    setActiveDesa(desaName);
    const desa = DAFTAR_DESA[desaName];
    if (mapInstanceRef.current && desa) {
      mapInstanceRef.current.flyTo([desa.lat, desa.lng], 15, {
        duration: 1.2
      });
    }
  };

  const handleResetZoom = () => {
    setActiveDesa('Semua');
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([-7.9380, 113.8110], 13, {
        duration: 1.2
      });
    }
  };

  // Hitung jumlah bumil dengan penyakit tertentu
  const countWithDisease = (key: PemeriksaanNakesKey) => {
    return data.filter(d => !isSudahBersalin(d) && d.pemeriksaanNakes && d.pemeriksaanNakes[key] === true).length;
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-600/20">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Peta Pemantauan Geospasial Ibu Hamil Aktif
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              5 Wilayah Kerja: Kelurahan Nangkaan, Badean, Desa Pancoran, Kembang, Sukowiryo
            </p>
          </div>
        </div>

        {/* Status Aktif vs Bersalin Indicator & Legend */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-2xl text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-extrabold text-emerald-900">
              {countAktif} Bumil Aktif di Peta
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 px-3.5 py-2 rounded-2xl text-xs">
            <Baby className="w-3.5 h-3.5 text-blue-600" />
            <span className="font-extrabold text-blue-900">
              {countBersalin} Sudah Bersalin
            </span>
            <span className="text-[10px] text-blue-700 bg-blue-100 px-1.5 py-0.2 rounded-full font-bold">
              (Disimpan di Rekap)
            </span>
          </div>
        </div>
      </div>

      {/* Filter Wilayah Kerja Desa & Lingkaran Toggle */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Desa Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="font-bold text-slate-500 mr-1 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              Wilayah Kerja:
            </span>

            <button
              onClick={handleResetZoom}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                activeDesa === 'Semua'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Semua Wilayah ({countAktif} Aktif)
            </button>

            {(Object.keys(DAFTAR_DESA) as DesaName[]).map((desaKey) => {
              const desa = DAFTAR_DESA[desaKey];
              const countDesaAktif = data.filter(d => d.desa === desaKey && !isSudahBersalin(d)).length;
              const isSelected = activeDesa === desaKey;
              return (
                <button
                  key={desaKey}
                  onClick={() => handleZoomToDesa(desaKey)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-teal-700 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                  title={desa.wilayahLengkap}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: desa.color }}></span>
                  <span>{desaKey}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-teal-900 text-white' : 'bg-white text-slate-600'
                  }`}>
                    {countDesaAktif}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <input
                type="checkbox"
                checked={showCircles}
                onChange={(e) => setShowCircles(e.target.checked)}
                className="rounded text-teal-600 focus:ring-teal-500 w-3.5 h-3.5 cursor-pointer"
              />
              <Layers className="w-3.5 h-3.5 text-teal-600" />
              <span>Lingkaran 5 Wilayah</span>
            </label>

            <label className="flex items-center gap-1.5 text-xs font-bold text-blue-700 cursor-pointer bg-blue-50/70 px-3 py-1.5 rounded-xl border border-blue-200">
              <input
                type="checkbox"
                checked={showSudahBersalin}
                onChange={(e) => setShowSudahBersalin(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
              />
              <Baby className="w-3.5 h-3.5 text-blue-600" />
              <span>Lihat Arsip Sudah Bersalin ({countBersalin})</span>
            </label>
          </div>
        </div>

        {/* Filter Baris 2: Risiko & Penyakit Nakes */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Filter Risiko */}
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-500 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              Risiko:
            </span>

            <button
              onClick={() => setActiveRisiko('Semua')}
              className={`px-2.5 py-1 rounded-lg font-bold text-xs cursor-pointer ${
                activeRisiko === 'Semua' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setActiveRisiko('hijau')}
              className={`px-2.5 py-1 rounded-lg font-bold text-xs cursor-pointer ${
                activeRisiko === 'hijau' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-800'
              }`}
            >
              Hijau
            </button>
            <button
              onClick={() => setActiveRisiko('kuning')}
              className={`px-2.5 py-1 rounded-lg font-bold text-xs cursor-pointer ${
                activeRisiko === 'kuning' ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-900'
              }`}
            >
              Kuning
            </button>
            <button
              onClick={() => setActiveRisiko('merah')}
              className={`px-2.5 py-1 rounded-lg font-bold text-xs cursor-pointer ${
                activeRisiko === 'merah' ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-900'
              }`}
            >
              Merah
            </button>
          </div>

          {/* Filter 11 Penyakit Nakes Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-600 flex items-center gap-1">
              <Stethoscope className="w-3.5 h-3.5 text-rose-600" />
              Penyakit Bumil Aktif:
            </span>

            <select
              value={activePenyakit}
              onChange={(e) => setActivePenyakit(e.target.value as PemeriksaanNakesKey | 'Semua')}
              className="bg-slate-50 border border-slate-200 text-slate-800 font-bold rounded-xl px-2.5 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
            >
              <option value="Semua">Semua Pemeriksaan</option>
              {DAFTAR_PEMERIKSAAN_NAKES.map((item) => {
                const count = countWithDisease(item.key);
                return (
                  <option key={item.key} value={item.key}>
                    {item.label} ({count} kasus aktif)
                  </option>
                );
              })}
            </select>

            {activePenyakit !== 'Semua' && (
              <button
                onClick={() => setActivePenyakit('Semua')}
                className="text-[10px] text-rose-600 font-bold hover:underline cursor-pointer ml-1"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-2">
        <div 
          ref={mapContainerRef} 
          className="w-full h-[560px] rounded-2xl z-10"
        />
        <div className="px-4 py-2.5 text-[11px] text-slate-600 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 bg-slate-50 rounded-b-2xl mt-1">
          <span className="flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span>Ibu hamil yang sudah melahirkan <strong>otomatis tidak muncul di peta</strong>, dan tersimpan aman di spreadsheet kohort dan rekap bulanan.</span>
          </span>
          <span className="font-semibold text-teal-800 shrink-0">
            UPTD Puskesmas Nangkaan • Bondowoso
          </span>
        </div>
      </div>

      {/* Modal Status Bersalin jika diklik dari popup peta */}
      <StatusBersalinModal
        isOpen={!!bumilModalBersalin}
        bumil={bumilModalBersalin}
        petugas={petugas}
        onClose={() => setBumilModalBersalin(null)}
        onSaved={(updated) => {
          if (onSaveBumil) {
            onSaveBumil(updated);
          }
          setBumilModalBersalin(null);
        }}
      />
    </div>
  );
};
