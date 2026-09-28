import React from 'react';
import { 
  HeartHandshake, 
  MapPin, 
  QrCode, 
  TableProperties, 
  UserCheck, 
  PlusCircle, 
  RefreshCw, 
  Wifi, 
  WifiOff,
  LogOut,
  Building2,
  Home,
  Users,
  ShieldAlert,
  ArrowLeft,
  FileBarChart
} from 'lucide-react';
import { PetugasUser } from '../types/simami';
import { LogoSiMamiRisti } from './LogoSiMamiRisti';

interface NavbarProps {
  currentTab: 'home' | 'form' | 'spreadsheet' | 'map' | 'dashboard' | 'petugas' | 'laporan';
  setCurrentTab: (tab: 'home' | 'form' | 'spreadsheet' | 'map' | 'dashboard' | 'petugas' | 'laporan') => void;
  petugas: PetugasUser | null;
  onOpenLogin: () => void;
  onLogout: () => void;
  onOpenScanner?: () => void;
  isSyncing: boolean;
  onRefreshData: () => void;
  syncSource: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  petugas,
  onOpenLogin,
  onLogout,
  isSyncing,
  onRefreshData,
  syncSource
}) => {
  const isFirebase = syncSource.includes('Firebase');
  const isAdmin = petugas?.role === 'Admin';

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-emerald-100 shadow-xs">
      {/* Top Banner Puskesmas & Pemerintah Kabupaten Bondowoso */}
      <div className="bg-linear-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-2 font-medium">
            <span className="bg-emerald-600/80 px-2 py-0.5 rounded text-[11px] font-semibold tracking-wide uppercase border border-emerald-400/30">
              Dinas Kesehatan Bondowoso
            </span>
            <span className="hidden sm:inline text-emerald-100">
              UPTD Puskesmas Nangkaan • Kelurahan Nangkaan, Kelurahan Badean, Desa Pancoran, Desa Kembang, Desa Sukowiryo
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Firebase Status Badge */}
            <div 
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium transition-colors ${
                isFirebase 
                  ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/40' 
                  : 'bg-amber-500/20 text-amber-200 border border-amber-400/40'
              }`}
              title={`Sumber data: ${syncSource}`}
            >
              {isFirebase ? (
                <Wifi className="w-3 h-3 text-emerald-300 animate-pulse" />
              ) : (
                <WifiOff className="w-3 h-3 text-amber-300" />
              )}
              <span className="hidden md:inline font-mono">Firebase RTDB</span>
              <span>{isFirebase ? 'Tersambung' : 'Cache Lokal'}</span>
            </div>

            <button
              onClick={onRefreshData}
              disabled={isSyncing}
              className="flex items-center gap-1 hover:text-emerald-200 text-[11px] bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded transition-all cursor-pointer disabled:opacity-50"
              title="Sinkronkan dengan Firebase RTDB"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline">Sinkron</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Si Mami Risti */}
          <div 
            onClick={() => setCurrentTab(petugas ? 'dashboard' : 'home')}
            className="cursor-pointer"
          >
            <LogoSiMamiRisti size={42} showText={true} />
          </div>

          {/* Nav Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-1">
            {petugas ? (
              /* MENU UNTUK PETUGAS & ADMIN SETELAH LOGIN */
              <>
                <button
                  onClick={() => setCurrentTab('dashboard')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    currentTab === 'dashboard'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>Dashboard</span>
                </button>

                <button
                  onClick={() => setCurrentTab('spreadsheet')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    currentTab === 'spreadsheet'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <TableProperties className="w-4 h-4 text-teal-600" />
                  <span>Lihat Data Bumil</span>
                </button>

                <button
                  onClick={() => setCurrentTab('map')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    currentTab === 'map'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <MapPin className="w-4 h-4 text-rose-500" />
                  <span>Peta 5 Desa</span>
                </button>

                <button
                  onClick={() => setCurrentTab('laporan')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    currentTab === 'laporan'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <FileBarChart className="w-4 h-4 text-amber-500" />
                  <span>Laporan Bulanan</span>
                </button>

                {isAdmin && (
                  <button
                    onClick={() => setCurrentTab('petugas')}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      currentTab === 'petugas'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-indigo-900 hover:bg-indigo-50'
                    }`}
                  >
                    <Users className="w-4 h-4 text-indigo-500" />
                    <span>Kelola Petugas</span>
                  </button>
                )}

                <button
                  onClick={() => setCurrentTab('form')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    currentTab === 'form'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <PlusCircle className="w-4 h-4 text-emerald-600" />
                  <span>+ Input Bumil</span>
                </button>

                <button
                  onClick={() => setCurrentTab('home')}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
                  title="Lihat Halaman Publik Bumil"
                >
                  <Home className="w-4 h-4" />
                  <span>Halaman Bumil</span>
                </button>
              </>
            ) : (
              /* MENU UNTUK IBU HAMIL / PUBLIK (SEBELUM LOGIN) */
              <>
                <button
                  onClick={() => setCurrentTab('home')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    currentTab === 'home'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Home className="w-4 h-4" />
                  <span>Beranda</span>
                </button>

                <button
                  onClick={() => setCurrentTab('form')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    currentTab === 'form'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <PlusCircle className="w-4 h-4 text-emerald-600" />
                  <span>Formulir Bumil</span>
                </button>
              </>
            )}
          </nav>

          {/* Right Action: Login / User Profile */}
          <div className="flex items-center gap-2">
            {petugas ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div 
                  onClick={() => setCurrentTab('dashboard')}
                  className="cursor-pointer text-right hidden sm:block"
                >
                  <p className="text-xs font-extrabold text-slate-800 leading-tight">
                    {petugas.nama}
                  </p>
                  <span className={`inline-block text-[10px] font-bold px-1.5 rounded ${
                    isAdmin ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {petugas.role} {petugas.desaTugas && petugas.desaTugas !== 'Semua Wilayah' ? `(${petugas.desaTugas})` : ''}
                  </span>
                </div>
                <button
                  onClick={onLogout}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                  title="Keluar dari sesi Petugas"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-2 rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                <UserCheck className="w-4 h-4" />
                <span>Login Petugas</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="flex md:hidden overflow-x-auto py-2 gap-1.5 border-t border-slate-100 scrollbar-none text-xs">
          {petugas ? (
            <>
              <button
                onClick={() => setCurrentTab('dashboard')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-bold ${
                  currentTab === 'dashboard' ? 'bg-emerald-700 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setCurrentTab('spreadsheet')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-bold ${
                  currentTab === 'spreadsheet' ? 'bg-emerald-700 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Data Bumil
              </button>
              <button
                onClick={() => setCurrentTab('map')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-bold ${
                  currentTab === 'map' ? 'bg-emerald-700 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Peta 5 Desa
              </button>
              <button
                onClick={() => setCurrentTab('laporan')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-bold ${
                  currentTab === 'laporan' ? 'bg-emerald-700 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Laporan Bulanan
              </button>
              {isAdmin && (
                <button
                  onClick={() => setCurrentTab('petugas')}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-bold ${
                    currentTab === 'petugas' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Kelola Petugas
                </button>
              )}
              <button
                onClick={() => setCurrentTab('form')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-bold ${
                  currentTab === 'form' ? 'bg-emerald-700 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                + Input Bumil
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setCurrentTab('home')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-bold ${
                  currentTab === 'home' ? 'bg-emerald-700 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Beranda
              </button>
              <button
                onClick={() => setCurrentTab('form')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-bold ${
                  currentTab === 'form' ? 'bg-emerald-700 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Formulir Bumil
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
