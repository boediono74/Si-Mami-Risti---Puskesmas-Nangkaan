import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Trash2, 
  Edit3, 
  Phone, 
  Building2, 
  CheckCircle2, 
  AlertCircle,
  X,
  Save,
  KeyRound,
  Eye,
  EyeOff,
  Lock
} from 'lucide-react';
import { PetugasUser, DesaName, DAFTAR_DESA } from '../types/simami';

interface KelolaPetugasViewProps {
  petugasList: PetugasUser[];
  onAddPetugas: (newPetugas: PetugasUser) => void;
  onEditPetugas: (updatedPetugas: PetugasUser) => void;
  onDeletePetugas: (id: string) => void;
}

export const KelolaPetugasView: React.FC<KelolaPetugasViewProps> = ({
  petugasList,
  onAddPetugas,
  onEditPetugas,
  onDeletePetugas
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPetugas, setEditingPetugas] = useState<PetugasUser | null>(null);

  // State Form Tambah
  const [nama, setNama] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [nip, setNip] = useState('');
  const [role, setRole] = useState<'Admin' | 'Bidan Desa' | 'Bidan Koordinator' | 'Dokter Puskesmas'>('Bidan Desa');
  const [desaTugas, setDesaTugas] = useState<DesaName | 'Semua Wilayah'>('Kelurahan Nangkaan');
  const [noHp, setNoHp] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // State Form Edit
  const [editNama, setEditNama] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [editNip, setEditNip] = useState('');
  const [editRole, setEditRole] = useState<'Admin' | 'Bidan Desa' | 'Bidan Koordinator' | 'Dokter Puskesmas'>('Bidan Desa');
  const [editDesaTugas, setEditDesaTugas] = useState<DesaName | 'Semua Wilayah'>('Kelurahan Nangkaan');
  const [editNoHp, setEditNoHp] = useState('');

  // Visible password toggles in table
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Buka Modal Edit
  const handleOpenEdit = (petugas: PetugasUser) => {
    setEditingPetugas(petugas);
    setEditNama(petugas.nama);
    setEditUsername(petugas.username);
    setEditPassword(petugas.password || 'puskesmas123');
    setEditNip(petugas.nip || '');
    setEditRole(petugas.role);
    setEditDesaTugas(petugas.desaTugas || 'Semua Wilayah');
    setEditNoHp(petugas.noHp || '');
  };

  // Simpan Perubahan Edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPetugas) return;
    if (!editNama.trim()) {
      alert('Nama petugas wajib diisi!');
      return;
    }
    if (!editPassword.trim()) {
      alert('Kata sandi wajib diisi!');
      return;
    }

    const updated: PetugasUser = {
      ...editingPetugas,
      nama: editNama.trim(),
      username: editUsername.trim() || editingPetugas.username,
      password: editPassword.trim(),
      nip: editNip.trim() || '-',
      role: editRole,
      desaTugas: editDesaTugas,
      noHp: editNoHp.trim() || '-'
    };

    onEditPetugas(updated);
    setEditingPetugas(null);
    setSuccessMsg(`Data petugas ${updated.nama} berhasil diperbarui!`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Submit Tambah Baru
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nama.trim()) {
      alert('Nama petugas wajib diisi!');
      return;
    }

    const autoUsername = username.trim() || `petugas_${Math.floor(100 + Math.random() * 900)}`;
    const finalPassword = password.trim() || 'puskesmas123';

    const newPetugas: PetugasUser = {
      id: `petugas-${Date.now()}`,
      username: autoUsername,
      password: finalPassword,
      nama: nama.trim(),
      nip: nip.trim() || '-',
      role,
      desaTugas,
      noHp: noHp.trim() || '-',
      isCustom: true
    };

    onAddPetugas(newPetugas);
    setNama('');
    setUsername('');
    setPassword('');
    setNip('');
    setNoHp('');
    setShowAddForm(false);
    setSuccessMsg(`Petugas ${newPetugas.nama} berhasil ditambahkan! Password: ${finalPassword}`);
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Kelola Petugas &amp; Bidan Puskesmas Nangkaan
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Administrator dapat menambah, mengedit username &amp; password, serta menghapus petugas
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>{showAddForm ? 'Tutup Formulir' : '+ Tambah Petugas Baru'}</span>
        </button>
      </div>

      {successMsg && (
        <div className="bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs px-4 py-3 rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Form Tambah Petugas Baru */}
      {showAddForm && (
        <div className="bg-white rounded-3xl border-2 border-indigo-200 p-6 shadow-md animate-in fade-in duration-200 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <UserPlus className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-extrabold text-slate-900">
              Formulir Tambah Petugas / Bidan Baru
            </h2>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Lengkap &amp; Gelar <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Bd. Rina Wardani, S.Tr.Keb"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-indigo-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Username Login <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: rina.wardani"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-indigo-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kata Sandi (Password) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Masukkan kata sandi"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-3 pr-9 py-2 text-xs font-mono text-slate-800 focus:outline-indigo-500 focus:bg-white font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  NIP / No. STR Petugas
                </label>
                <input
                  type="text"
                  placeholder="19890101 201501 2 003"
                  value={nip}
                  onChange={(e) => setNip(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-indigo-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Jabatan / Peran
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-indigo-500"
                >
                  <option value="Bidan Desa">Bidan Desa</option>
                  <option value="Bidan Koordinator">Bidan Koordinator</option>
                  <option value="Dokter Puskesmas">Dokter Puskesmas</option>
                  <option value="Admin">Administrator Puskesmas</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Wilayah Tugas
                </label>
                <select
                  value={desaTugas}
                  onChange={(e) => setDesaTugas(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-indigo-500"
                >
                  <option value="Semua Wilayah">Semua Wilayah (Puskesmas Nangkaan)</option>
                  <option value="Kelurahan Nangkaan">Kelurahan Nangkaan</option>
                  <option value="Kelurahan Badean">Kelurahan Badean</option>
                  <option value="Desa Pancoran">Desa Pancoran</option>
                  <option value="Desa Kembang">Desa Kembang</option>
                  <option value="Desa Sukowiryo">Desa Sukowiryo</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  No. HP / WhatsApp
                </label>
                <input
                  type="tel"
                  placeholder="081234567xxx"
                  value={noHp}
                  onChange={(e) => setNoHp(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-indigo-500 focus:bg-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-100 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                Simpan Petugas
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabel Daftar Petugas (Menampilkan Username & Password) */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span className="font-extrabold text-sm text-slate-800">
              Daftar Akun Petugas ({petugasList.length} Pengguna)
            </span>
          </div>
          <span className="text-xs text-slate-500">
            Tersimpan di Sistem &amp; Firebase RTDB
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Nama Petugas</th>
                <th className="py-3 px-4">Username</th>
                <th className="py-3 px-4">Kata Sandi</th>
                <th className="py-3 px-4">Jabatan</th>
                <th className="py-3 px-4">Wilayah Tugas</th>
                <th className="py-3 px-4">Kontak WA</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {petugasList.map((user) => {
                const isAdmin = user.role === 'Admin';
                const isPasswordVisible = !!visiblePasswords[user.id];

                return (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs text-white ${
                          isAdmin ? 'bg-indigo-600' : 'bg-emerald-600'
                        }`}>
                          {user.nama.charAt(0)}
                        </div>
                        <div>
                          <div>{user.nama}</div>
                          <span className="text-[10px] text-slate-400 font-mono">
                            NIP: {user.nip || '-'}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-800 font-bold">
                      @{user.username}
                    </td>

                    {/* Kolom Password */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-800 font-semibold">
                          {isPasswordVisible ? (user.password || 'puskesmas123') : '••••••••'}
                        </span>
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility(user.id)}
                          className="text-slate-400 hover:text-slate-700"
                          title={isPasswordVisible ? 'Sembunyikan' : 'Lihat kata sandi'}
                        >
                          {isPasswordVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isAdmin ? 'bg-indigo-100 text-indigo-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-bold text-slate-800">
                      {user.desaTugas || 'Semua Wilayah'}
                    </td>

                    <td className="py-3 px-4">
                      {user.noHp && user.noHp !== '-' ? (
                        <a
                          href={`https://wa.me/${user.noHp.replace(/^0/, '62')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-emerald-700 hover:underline font-bold"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{user.noHp}</span>
                        </a>
                      ) : (
                        '-'
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Tombol Edit Petugas */}
                        <button
                          onClick={() => handleOpenEdit(user)}
                          className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit Username, Password & Profil"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {/* Tombol Hapus Petugas */}
                        <button
                          onClick={() => {
                            if (petugasList.length <= 1) {
                              alert('Tidak dapat menghapus petugas terakhir!');
                              return;
                            }
                            if (confirm(`Yakin ingin menghapus data petugas "${user.nama}" (@${user.username})?`)) {
                              onDeletePetugas(user.id);
                              setSuccessMsg(`Petugas ${user.nama} berhasil dihapus.`);
                              setTimeout(() => setSuccessMsg(''), 4000);
                            }
                          }}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Hapus Petugas"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Edit Petugas (Username & Password) */}
      {editingPetugas && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">
                    Edit Data &amp; Password Petugas
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Mengubah informasi akun: {editingPetugas.nama}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingPetugas(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Lengkap &amp; Gelar <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={editNama}
                  onChange={(e) => setEditNama(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-blue-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Username Login <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:outline-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kata Sandi (Password) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showEditPassword ? 'text' : 'password'}
                      value={editPassword}
                      onChange={(e) => setEditPassword(e.target.value)}
                      required
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-3 pr-8 py-2 text-xs font-mono font-bold text-slate-800 focus:outline-blue-500 focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowEditPassword(!showEditPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showEditPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    NIP / No. STR
                  </label>
                  <input
                    type="text"
                    value={editNip}
                    onChange={(e) => setEditNip(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jabatan / Peran
                  </label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-blue-500"
                  >
                    <option value="Bidan Desa">Bidan Desa</option>
                    <option value="Bidan Koordinator">Bidan Koordinator</option>
                    <option value="Dokter Puskesmas">Dokter Puskesmas</option>
                    <option value="Admin">Administrator Puskesmas</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Wilayah Tugas
                  </label>
                  <select
                    value={editDesaTugas}
                    onChange={(e) => setEditDesaTugas(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-blue-500"
                  >
                    <option value="Semua Wilayah">Semua Wilayah (Puskesmas Nangkaan)</option>
                    <option value="Kelurahan Nangkaan">Kelurahan Nangkaan</option>
                    <option value="Kelurahan Badean">Kelurahan Badean</option>
                    <option value="Desa Pancoran">Desa Pancoran</option>
                    <option value="Desa Kembang">Desa Kembang</option>
                    <option value="Desa Sukowiryo">Desa Sukowiryo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    No. HP / WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={editNoHp}
                    onChange={(e) => setEditNoHp(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingPetugas(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
