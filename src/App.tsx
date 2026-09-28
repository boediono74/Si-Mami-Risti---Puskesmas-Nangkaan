/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { BumilForm } from './components/BumilForm';
import { SpreadsheetView } from './components/SpreadsheetView';
import { MapView } from './components/MapView';
import { DashboardPetugas } from './components/DashboardPetugas';
import { KelolaPetugasView } from './components/KelolaPetugasView';
import { LaporanBulananView } from './components/LaporanBulananView';
import { BumilDetailModal } from './components/BumilDetailModal';
import { PetugasLoginModal } from './components/PetugasLoginModal';
import { IbuHamilData, PetugasUser, DesaName } from './types/simami';
import { 
  fetchAllBumilFromFirebase, 
  deleteBumilRecord, 
  getSavedPetugasSession, 
  clearPetugasSession,
  getLocalPetugasList,
  saveLocalPetugasList,
  savePetugasListToFirebase,
  syncPetugasWithFirebase,
  savePetugasSession,
  saveBumilRecord
} from './services/firebase';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'home' | 'form' | 'spreadsheet' | 'map' | 'dashboard' | 'petugas' | 'laporan'>('home');
  const [bumilList, setBumilList] = useState<IbuHamilData[]>([]);
  const [petugasList, setPetugasList] = useState<PetugasUser[]>(getLocalPetugasList());
  const [isSyncing, setIsSyncing] = useState<boolean>(true);
  const [syncSource, setSyncSource] = useState<string>('Memeriksa...');

  // State Modals & Selection
  const [selectedBumil, setSelectedBumil] = useState<IbuHamilData | null>(null);
  const [editingBumil, setEditingBumil] = useState<IbuHamilData | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [petugas, setPetugas] = useState<PetugasUser | null>(null);

  // Filter Desa terpilih (jika navigasi dari banner desa)
  const [selectedDesaFilter, setSelectedDesaFilter] = useState<DesaName | 'Semua'>('Semua');

  // Deteksi otomatis jika bumil scan barcode yang membuka ?tab=form atau #form
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('tab') === 'form' || window.location.hash === '#form') {
        setCurrentTab('form');
      }
    }
  }, []);

  // Load session petugas & data bumil saat pertama kali dibuka
  const loadData = useCallback(async () => {
    setIsSyncing(true);
    const result = await fetchAllBumilFromFirebase();
    setBumilList(result.data);
    setSyncSource(result.source);

    // Sync daftar petugas
    const syncedPetugas = await syncPetugasWithFirebase();
    setPetugasList(syncedPetugas);

    setIsSyncing(false);
  }, []);

  useEffect(() => {
    // Cek session petugas yang tersimpan
    const savedUser = getSavedPetugasSession();
    if (savedUser) {
      setPetugas(savedUser);
    }

    loadData();
  }, [loadData]);

  // Handler Hapus Data Bumil
  const handleDeleteBumil = async (id: string) => {
    const success = await deleteBumilRecord(id);
    if (success) {
      setBumilList(prev => prev.filter(item => item.id !== id));
      if (selectedBumil?.id === id) {
        setSelectedBumil(null);
      }
    }
  };

  // Handler Simpan / Update Bumil (Langsung masuk ke spreadsheet dan Firebase)
  const handleBumilSaved = (savedItem: IbuHamilData) => {
    setBumilList(prev => {
      const idx = prev.findIndex(item => item.id === savedItem.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = savedItem;
        return updated;
      }
      return [savedItem, ...prev];
    });

    setEditingBumil(null);
  };

  // Handler Tambah Petugas (Khusus Admin)
  const handleAddPetugas = (newPetugas: PetugasUser) => {
    const updated = [...petugasList, newPetugas];
    setPetugasList(updated);
    saveLocalPetugasList(updated);
    savePetugasListToFirebase(updated);
  };

  // Handler Edit Petugas (Khusus Admin)
  const handleEditPetugas = (updatedPetugas: PetugasUser) => {
    const idx = petugasList.findIndex(p => p.id === updatedPetugas.id);
    let updated = [...petugasList];
    if (idx >= 0) {
      updated[idx] = updatedPetugas;
    } else {
      updated.push(updatedPetugas);
    }
    setPetugasList(updated);
    saveLocalPetugasList(updated);
    savePetugasListToFirebase(updated);

    // Jika yang diedit adalah petugas yang sedang login, update sesi
    if (petugas?.id === updatedPetugas.id) {
      setPetugas(updatedPetugas);
      savePetugasSession(updatedPetugas);
    }
  };

  // Handler Hapus Petugas (Khusus Admin)
  const handleDeletePetugas = (id: string) => {
    const updated = petugasList.filter(p => p.id !== id);
    setPetugasList(updated);
    saveLocalPetugasList(updated);
    savePetugasListToFirebase(updated);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        petugas={petugas}
        onOpenLogin={() => setIsLoginOpen(true)}
        onLogout={() => {
          clearPetugasSession();
          setPetugas(null);
          setCurrentTab('home');
        }}
        isSyncing={isSyncing}
        onRefreshData={loadData}
        syncSource={syncSource}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* TAB 1: Beranda / Landing Page (Deskripsi & Barcode scan untuk bumil) */}
        {currentTab === 'home' && (
          <LandingPage
            onOpenForm={() => {
              setEditingBumil(null);
              setCurrentTab('form');
            }}
            onOpenLogin={() => setIsLoginOpen(true)}
          />
        )}

        {/* TAB 2: Form Pengisian Bumil */}
        {currentTab === 'form' && (
          <BumilForm
            initialData={editingBumil}
            onSaved={(savedData) => {
              handleBumilSaved(savedData);
              // Jika petugas sedang login, beri opsi langsung lihat di spreadsheet
            }}
            onCancel={() => {
              setEditingBumil(null);
              setCurrentTab(petugas ? 'spreadsheet' : 'home');
            }}
          />
        )}

        {/* TAB 3: Lihat Data Bumil (Spreadsheet Kohort Register) - Khusus Petugas/Admin */}
        {currentTab === 'spreadsheet' && (
          <SpreadsheetView
            data={bumilList}
            onAddNew={() => {
              setEditingBumil(null);
              setCurrentTab('form');
            }}
            onEdit={(item) => {
              setEditingBumil(item);
              setCurrentTab('form');
            }}
            onViewDetail={(item) => setSelectedBumil(item)}
            onDelete={handleDeleteBumil}
            onRefresh={loadData}
            isSyncing={isSyncing}
            selectedDesaFilter={selectedDesaFilter}
            onSaveBumil={handleBumilSaved}
            petugas={petugas}
          />
        )}

        {/* TAB 4: Peta 5 Desa - Khusus Petugas/Admin */}
        {currentTab === 'map' && (
          <MapView
            data={bumilList}
            onSelectBumil={(item) => setSelectedBumil(item)}
            onSaveBumil={handleBumilSaved}
            petugas={petugas}
          />
        )}

        {/* TAB 5: Dashboard Petugas & Bidan - Khusus Petugas/Admin */}
        {currentTab === 'dashboard' && (
          <DashboardPetugas
            data={bumilList}
            petugas={petugas}
            onNavigate={(tab) => {
              if (tab === 'form') setEditingBumil(null);
              setCurrentTab(tab);
            }}
            onSelectDesa={(desa) => {
              setSelectedDesaFilter(desa);
              setCurrentTab('spreadsheet');
            }}
            onSelectBumil={(item) => setSelectedBumil(item)}
            onRefresh={loadData}
            isSyncing={isSyncing}
            syncSource={syncSource}
          />
        )}

        {/* TAB 6: Kelola Petugas (Khusus Akun Admin) */}
        {currentTab === 'petugas' && petugas?.role === 'Admin' && (
          <KelolaPetugasView
            petugasList={petugasList}
            onAddPetugas={handleAddPetugas}
            onEditPetugas={handleEditPetugas}
            onDeletePetugas={handleDeletePetugas}
          />
        )}

        {/* TAB 7: Laporan Bulanan (Petugas / Admin) */}
        {currentTab === 'laporan' && (
          <LaporanBulananView
            data={bumilList}
            onSelectBumil={(item) => setSelectedBumil(item)}
          />
        )}
      </main>

      {/* MODALS */}
      {/* 1. Detail & Kartu Poedji Rochjati Modal */}
      <BumilDetailModal
        bumil={selectedBumil}
        onClose={() => setSelectedBumil(null)}
        onEdit={(item) => {
          setSelectedBumil(null);
          setEditingBumil(item);
          setCurrentTab('form');
        }}
        onSaveBumil={handleBumilSaved}
        petugas={petugas}
      />

      {/* 2. Login Petugas & Admin Modal */}
      <PetugasLoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={(user) => {
          setPetugas(user);
          setCurrentTab('dashboard');
        }}
        petugasList={petugasList}
      />
    </div>
  );
}
