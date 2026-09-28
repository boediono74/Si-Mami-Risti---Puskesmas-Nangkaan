import { IbuHamilData, PetugasUser, DEFAULT_PETUGAS_LIST } from '../types/simami';
import { SEED_IBU_HAMIL } from '../data/seedData';

export const FIREBASE_RTDB_URL = 'https://si-mami-risti-default-rtdb.firebaseio.com';
const STORAGE_KEY = 'si_mami_risti_bumil_data_v1';
const PETUGAS_SESSION_KEY = 'si_mami_risti_petugas_user';

export interface SyncState {
  isOnline: boolean;
  isSyncing: boolean;
  lastSynced: string | null;
  error: string | null;
  source: 'Firebase Realtime Database' | 'Local Storage (Offline Cache)';
}

// Inisialisasi data lokal jika belum ada
export function getLocalBumilData(): IbuHamilData[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_IBU_HAMIL));
      return SEED_IBU_HAMIL;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_IBU_HAMIL));
      return SEED_IBU_HAMIL;
    }

    // Merge or backfill pemeriksaanNakes & updated coordinates if older cache exists
    const seedMap = new Map(SEED_IBU_HAMIL.map(s => [s.id, s]));
    let modified = false;

    const enriched = parsed.map((item: IbuHamilData) => {
      const seed = seedMap.get(item.id);
      let updatedItem = { ...item };

      // Pastikan pemeriksaanNakes ada
      if (!updatedItem.pemeriksaanNakes) {
        updatedItem.pemeriksaanNakes = seed?.pemeriksaanNakes || {
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
        };
        modified = true;
      }

      // Perbarui koordinat seed jika masih menggunakan koordinat lama atau Desa Pancoran lama
      if (seed && (!updatedItem.latitude || Math.abs(updatedItem.latitude - (-7.9234)) < 0.005 || (updatedItem.id === 'bumil-003' && updatedItem.latitude > -7.95))) {
        updatedItem.latitude = seed.latitude;
        updatedItem.longitude = seed.longitude;
        updatedItem.mapsUrl = seed.mapsUrl;
        modified = true;
      }

      return updatedItem;
    });

    if (modified) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(enriched));
    }

    return enriched;
  } catch (err) {
    console.warn('Gagal membaca localStorage, fallback ke seed data:', err);
    return SEED_IBU_HAMIL;
  }
}

export function saveLocalBumilData(data: IbuHamilData[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Gagal menyimpan ke localStorage:', err);
  }
}

// Ambil semua data dari Firebase RTDB dengan timeout dan fallback
export async function fetchAllBumilFromFirebase(): Promise<{ data: IbuHamilData[]; source: 'Firebase Realtime Database' | 'Local Storage (Offline Cache)'; error?: string }> {
  const localData = getLocalBumilData();
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(`${FIREBASE_RTDB_URL}/ibu_hamil.json`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Firebase RTDB HTTP status: ${res.status}`);
    }

    const firebaseData = await res.json();
    
    // Jika di Firebase belum ada data atau masih kosong, seed awal ke Firebase
    if (!firebaseData || Object.keys(firebaseData).length === 0) {
      console.log('Firebase RTDB masih kosong, melakukan seeding awal...');
      await seedInitialDataToFirebase(localData);
      return { data: localData, source: 'Firebase Realtime Database' };
    }

    // Convert objek Firebase RTDB { id1: {...}, id2: {...} } ke Array
    const list: IbuHamilData[] = [];
    if (typeof firebaseData === 'object' && firebaseData !== null) {
      Object.keys(firebaseData).forEach((key) => {
        const item = firebaseData[key];
        if (item && typeof item === 'object') {
          list.push({
            ...item,
            id: item.id || key,
            syncedToFirebase: true
          });
        }
      });
    }

    if (list.length > 0) {
      saveLocalBumilData(list);
      return { data: list, source: 'Firebase Realtime Database' };
    }

    return { data: localData, source: 'Firebase Realtime Database' };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.warn('Gagal koneksi ke Firebase RTDB, menggunakan cache lokal:', errorMessage);
    return {
      data: localData,
      source: 'Local Storage (Offline Cache)',
      error: errorMessage
    };
  }
}

// Simpan atau update 1 data Ibu Hamil ke Firebase RTDB & Local
export async function saveBumilRecord(data: IbuHamilData): Promise<{ success: boolean; data: IbuHamilData; error?: string }> {
  // 1. Simpan ke Local Storage dulu
  const localList = getLocalBumilData();
  const existingIdx = localList.findIndex(item => item.id === data.id || item.nikIbu === data.nikIbu);
  
  let updatedRecord = { ...data, updatedAt: new Date().toISOString() };
  let newList: IbuHamilData[] = [];

  if (existingIdx >= 0) {
    newList = [...localList];
    newList[existingIdx] = updatedRecord;
  } else {
    newList = [updatedRecord, ...localList];
  }
  
  saveLocalBumilData(newList);

  // 2. Simpan ke Firebase Realtime Database via REST endpoint
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const safeId = data.id.replace(/[^a-zA-Z0-9_-]/g, '_');
    const res = await fetch(`${FIREBASE_RTDB_URL}/ibu_hamil/${safeId}.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...updatedRecord, syncedToFirebase: true }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      updatedRecord.syncedToFirebase = true;
      if (existingIdx >= 0) {
        newList[existingIdx] = updatedRecord;
      } else {
        newList[0] = updatedRecord;
      }
      saveLocalBumilData(newList);
      return { success: true, data: updatedRecord };
    } else {
      return { success: true, data: updatedRecord, error: `Firebase response: ${res.statusText}` };
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.warn('Tersimpan di offline cache (gagal kirim ke Firebase):', errorMsg);
    return { success: true, data: updatedRecord, error: errorMsg };
  }
}

// Hapus data bumil
export async function deleteBumilRecord(id: string): Promise<boolean> {
  const localList = getLocalBumilData().filter(item => item.id !== id);
  saveLocalBumilData(localList);

  try {
    const safeId = id.replace(/[^a-zA-Z0-9_-]/g, '_');
    await fetch(`${FIREBASE_RTDB_URL}/ibu_hamil/${safeId}.json`, {
      method: 'DELETE'
    });
    return true;
  } catch (err) {
    console.warn('Gagal menghapus dari Firebase RTDB:', err);
    return true;
  }
}

// Seeding awal jika Firebase RTDB masih kosong
export async function seedInitialDataToFirebase(dataToSeed: IbuHamilData[]): Promise<boolean> {
  try {
    const payload: Record<string, IbuHamilData> = {};
    dataToSeed.forEach((item) => {
      const safeId = item.id.replace(/[^a-zA-Z0-9_-]/g, '_');
      payload[safeId] = { ...item, syncedToFirebase: true };
    });

    const res = await fetch(`${FIREBASE_RTDB_URL}/ibu_hamil.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    return res.ok;
  } catch (err) {
    console.warn('Gagal melakukan initial seed ke Firebase RTDB:', err);
    return false;
  }
}

// Petugas Storage & Synchronization
const PETUGAS_LIST_KEY = 'si_mami_risti_petugas_list_v1';

export function getLocalPetugasList(): PetugasUser[] {
  try {
    const raw = localStorage.getItem(PETUGAS_LIST_KEY);
    if (!raw) {
      localStorage.setItem(PETUGAS_LIST_KEY, JSON.stringify(DEFAULT_PETUGAS_LIST));
      return DEFAULT_PETUGAS_LIST;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(PETUGAS_LIST_KEY, JSON.stringify(DEFAULT_PETUGAS_LIST));
      return DEFAULT_PETUGAS_LIST;
    }
    return parsed;
  } catch {
    return DEFAULT_PETUGAS_LIST;
  }
}

export function saveLocalPetugasList(list: PetugasUser[]): void {
  try {
    localStorage.setItem(PETUGAS_LIST_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Gagal menyimpan daftar petugas ke localStorage:', err);
  }
}

// Simpan seluruh daftar petugas ke Firebase RTDB
export async function savePetugasListToFirebase(list: PetugasUser[]): Promise<boolean> {
  try {
    const res = await fetch(`${FIREBASE_RTDB_URL}/petugas.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(list)
    });
    return res.ok;
  } catch (err) {
    console.warn('Gagal menyimpan daftar petugas ke Firebase:', err);
    return false;
  }
}

// Sinkronisasi Petugas dengan Firebase RTDB
export async function syncPetugasWithFirebase(): Promise<PetugasUser[]> {
  const localList = getLocalPetugasList();
  try {
    const res = await fetch(`${FIREBASE_RTDB_URL}/petugas.json`);
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data === 'object') {
        const list: PetugasUser[] = [];
        Object.keys(data).forEach((key) => {
          const item = data[key];
          if (item) list.push({ ...item, id: item.id || key });
        });
        if (list.length > 0) {
          saveLocalPetugasList(list);
          return list;
        }
      } else {
        // Seeding awal petugas ke Firebase
        await fetch(`${FIREBASE_RTDB_URL}/petugas.json`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(localList)
        });
      }
    }
    return localList;
  } catch (err) {
    console.warn('Gagal sync petugas dari Firebase, pakai cache:', err);
    return localList;
  }
}

// Petugas Session Helper
export function getSavedPetugasSession(): PetugasUser | null {
  try {
    const raw = localStorage.getItem(PETUGAS_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function savePetugasSession(user: PetugasUser) {
  localStorage.setItem(PETUGAS_SESSION_KEY, JSON.stringify(user));
}

export function clearPetugasSession() {
  localStorage.removeItem(PETUGAS_SESSION_KEY);
}

