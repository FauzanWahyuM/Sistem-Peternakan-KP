import { Pelatihan } from "../types/pelatihan";

class PelatihanStorageService {
    private readonly STORAGE_KEY = 'pelatihan_data';

    // Inisialisasi data default jika belum ada
    private initializeDefaultData(): Pelatihan[] {
        // Check if we're running on the client side
        if (typeof window === 'undefined') {
            return [];
        }
        
        const defaultData: Pelatihan[] = [
            {
                id: 1,
                judul: 'Pemahaman Dasar Peternakan Modern',
                deskripsi: 'Pembelajaran tentang teknologi terbaru dalam bidang peternakan',
                gambar: 'Foto.jpg',
                tanggal: '2025-02-11',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 2,
                judul: 'Artikel Manajemen Pakan Ternak',
                deskripsi: 'Panduan lengkap mengenai nutrisi dan manajemen pakan',
                gambar: 'Foto.png',
                tanggal: '2025-03-16',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 3,
                judul: 'Jika Ternak Sakit: Penanganan Pertama',
                deskripsi: 'Langkah-langkah penanganan darurat untuk ternak yang sakit',
                gambar: 'Foto.jpg',
                tanggal: '2025-04-23',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        ];

        this.setData(defaultData);
        return defaultData;
    }

    // Mengambil semua data pelatihan
    getAllPelatihan(): Pelatihan[] {
        // Check if we're running on the client side
        if (typeof window === 'undefined') {
            return [];
        }
        
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            if (!data) {
                return this.initializeDefaultData();
            }
            return JSON.parse(data) as Pelatihan[];
        } catch (error) {
            console.error('Error getting pelatihan data:', error);
            return this.initializeDefaultData();
        }
    }

    // Mengambil pelatihan berdasarkan ID
    getPelatihanById(id: number): Pelatihan | null {
        // Check if we're running on the client side
        if (typeof window === 'undefined') {
            return null;
        }
        
        const allPelatihan = this.getAllPelatihan();
        return allPelatihan.find(p => p.id === id) || null;
    }

    // Menambah pelatihan baru
    addPelatihan(pelatihanData: Omit<Pelatihan, 'id' | 'createdAt' | 'updatedAt'>): Pelatihan {
        // Check if we're running on the client side
        if (typeof window === 'undefined') {
            return {
                ...pelatihanData,
                id: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
        }
        
        const allPelatihan = this.getAllPelatihan();
        const newId = Math.max(...allPelatihan.map(p => p.id), 0) + 1;

        const newPelatihan: Pelatihan = {
            ...pelatihanData,
            id: newId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        allPelatihan.push(newPelatihan);
        this.setData(allPelatihan);

        return newPelatihan;
    }

    // Mengupdate pelatihan
    updatePelatihan(id: number, updates: Partial<Omit<Pelatihan, 'id' | 'createdAt' | 'updatedAt'>>): Pelatihan | null {
        // Check if we're running on the client side
        if (typeof window === 'undefined') {
            return null;
        }
        
        const allPelatihan = this.getAllPelatihan();
        const index = allPelatihan.findIndex(p => p.id === id);

        if (index === -1) {
            return null;
        }

        allPelatihan[index] = {
            ...allPelatihan[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };

        this.setData(allPelatihan);
        return allPelatihan[index];
    }

    // Menghapus pelatihan
    deletePelatihan(id: number): boolean {
        // Check if we're running on the client side
        if (typeof window === 'undefined') {
            return false;
        }
        
        const allPelatihan = this.getAllPelatihan();
        const filteredPelatihan = allPelatihan.filter(p => p.id !== id);

        if (filteredPelatihan.length === allPelatihan.length) {
            return false; // ID tidak ditemukan
        }

        this.setData(filteredPelatihan);
        return true;
    }

    // Menyimpan data ke localStorage
    private setData(data: Pelatihan[]): void {
        // Check if we're running on the client side
        if (typeof window === 'undefined') {
            return;
        }
        
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
        } catch (error) {
            console.error('Error saving pelatihan data:', error);
        }
    }

    // Menghapus semua data (untuk reset)
    clearAllData(): void {
        // Check if we're running on the client side
        if (typeof window === 'undefined') {
            return;
        }
        
        localStorage.removeItem(this.STORAGE_KEY);
    }

    // Export data untuk backup
    exportData(): string {
        // Check if we're running on the client side
        if (typeof window === 'undefined') {
            return '{}';
        }
        
        const data = this.getAllPelatihan();
        return JSON.stringify(data, null, 2);
    }

    // Import data dari backup
    importData(jsonData: string): boolean {
        // Check if we're running on the client side
        if (typeof window === 'undefined') {
            return false;
        }
        
        try {
            const data = JSON.parse(jsonData) as Pelatihan[];
            // Validasi struktur data
            if (Array.isArray(data) && data.every(item =>
                typeof item.id === 'number' &&
                typeof item.judul === 'string' &&
                typeof item.deskripsi === 'string' &&
                typeof item.gambar === 'string' &&
                typeof item.tanggal === 'string'
            )) {
                this.setData(data);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }

    // Statistik data
    getStatistics() {
        // Check if we're running on the client side
        if (typeof window === 'undefined') {
            return {
                total: 0,
                thisMonth: 0,
                upcoming: 0,
                past: 0
            };
        }
        
        const allPelatihan = this.getAllPelatihan();
        const now = new Date();
        const thisMonth = allPelatihan.filter(p => {
            const pelatihanDate = new Date(p.tanggal);
            return pelatihanDate.getMonth() === now.getMonth() &&
                pelatihanDate.getFullYear() === now.getFullYear();
        });

        return {
            total: allPelatihan.length,
            thisMonth: thisMonth.length,
            upcoming: allPelatihan.filter(p => new Date(p.tanggal) > now).length,
            past: allPelatihan.filter(p => new Date(p.tanggal) <= now).length
        };
    }
}

// Export singleton instance
export const pelatihanStorage = new PelatihanStorageService();