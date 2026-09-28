import React, { useState } from 'react';
import { X, UserCheck, User, Lock, AlertCircle, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { PetugasUser } from '../types/simami';
import { savePetugasSession } from '../services/firebase';

interface PetugasLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: PetugasUser) => void;
  petugasList: PetugasUser[];
}

export const PetugasLoginModal: React.FC<PetugasLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  petugasList
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const trimmedUser = username.trim().toLowerCase();
    const trimmedPass = password.trim();

    if (!trimmedUser) {
      setErrorMsg('Silakan masukkan username atau NIP petugas!');
      return;
    }

    if (!trimmedPass) {
      setErrorMsg('Silakan masukkan kata sandi!');
      return;
    }

    // Cari user di daftar petugas
    const matched = petugasList.find(
      p => p.username.toLowerCase() === trimmedUser || 
           p.nip?.toLowerCase() === trimmedUser || 
           p.nama.toLowerCase() === trimmedUser
    );

    if (matched) {
      // Verifikasi kata sandi
      const expectedPass = matched.password || 'admin123';
      if (trimmedPass !== expectedPass) {
        setErrorMsg('Kata sandi yang Anda masukkan salah. Silakan periksa kembali!');
        return;
      }

      // Verifikasi login berhasil
      savePetugasSession(matched);
      onLoginSuccess(matched);
      setUsername('');
      setPassword('');
      setErrorMsg('');
      onClose();
    } else {
      setErrorMsg('Username atau NIP petugas tidak terdaftar di sistem. Silakan periksa kembali atau hubungi Administrator Puskesmas.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-sm w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow-xs">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">
                Login Petugas Puskesmas
              </h3>
              <p className="text-[11px] text-slate-500">
                Si Mami Risti • UPTD Puskesmas Nangkaan
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <div className="p-6 space-y-4">
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-2xl text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Username / NIP Petugas
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Masukkan username atau NIP"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-800 focus:outline-emerald-500 focus:bg-white font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kata Sandi
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Masukkan kata sandi"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-9 py-2.5 text-xs text-slate-800 focus:outline-emerald-500 focus:bg-white font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  title={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs py-3 rounded-xl shadow-md shadow-emerald-700/20 transition-all transform hover:-translate-y-0.5 cursor-pointer mt-2"
            >
              Masuk ke Sistem
            </button>
          </form>

          {/* Info Petugas */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
            <div className="flex items-center gap-1 font-bold text-slate-800">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Akses Khusus Bidan &amp; Petugas KIA</span>
            </div>
            <p className="text-slate-500 text-[10px] leading-relaxed">
              Akun login disediakan oleh Administrator Puskesmas Nangkaan (Contoh: <code className="bg-slate-200 px-1 rounded text-slate-800 font-mono">admin</code>, <code className="bg-slate-200 px-1 rounded text-slate-800 font-mono">petugas1</code>, <code className="bg-slate-200 px-1 rounded text-slate-800 font-mono">petugas2</code>).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
