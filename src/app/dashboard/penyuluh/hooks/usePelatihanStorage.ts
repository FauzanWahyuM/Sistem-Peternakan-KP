import { useState, useEffect } from 'react';
import { pelatihanStorage } from '../services/pelatihanStorage';
import { Pelatihan } from '../types/pelatihan';

export function usePelatihanStorage() {
    const [pelatihan, setPelatihan] = useState<Pelatihan[]>([]);
    const [loading, setLoading] = useState(true);

    // Load data saat hook pertama kali digunakan
    useEffect(() => {
        loadPelatihan();
    }, []);

    const loadPelatihan = () => {
        setLoading(true);
        try {
            const data = pelatihanStorage.getAllPelatihan();
            console.log('Loaded pelatihan data:', data);
            setPelatihan(data);
        } catch (error) {
            console.error('Error loading pelatihan:', error);
            setPelatihan([]); // Set empty array on error
        } finally {
            setLoading(false);
        }
    };

    const addPelatihan = (pelatihanData: Omit<Pelatihan, 'id' | 'createdAt' | 'updatedAt'>) => {
        try {
            const newPelatihan = pelatihanStorage.addPelatihan(pelatihanData);
            setPelatihan(prev => [...prev, newPelatihan]);
            return newPelatihan;
        } catch (error) {
            console.error('Error adding pelatihan:', error);
            throw error;
        }
    };

    const updatePelatihan = (id: number, updates: Partial<Omit<Pelatihan, 'id' | 'createdAt' | 'updatedAt'>>) => {
        try {
            console.log('Updating pelatihan in hook, ID:', id, 'Updates:', updates);
            const updated = pelatihanStorage.updatePelatihan(id, updates);
            console.log('Update result from storage:', updated);

            if (updated) {
                setPelatihan(prev => {
                    const newData = prev.map(p => p.id === id ? updated : p);
                    console.log('Updated pelatihan state:', newData);
                    return newData;
                });
                return updated;
            }
            return null;
        } catch (error) {
            console.error('Error updating pelatihan:', error);
            throw error;
        }
    };

    const deletePelatihan = (id: number) => {
        try {
            const success = pelatihanStorage.deletePelatihan(id);
            if (success) {
                setPelatihan(prev => prev.filter(p => p.id !== id));
            }
            return success;
        } catch (error) {
            console.error('Error deleting pelatihan:', error);
            throw error;
        }
    };

    const getPelatihanById = (id: number): Pelatihan | null => {
        try {
            console.log('Getting pelatihan by ID:', id);

            // Ambil langsung dari localStorage untuk menghindari dependency issues
            const data = localStorage.getItem('pelatihan_data');
            if (!data) {
                console.log('No data in localStorage');
                return null;
            }

            const allPelatihan = JSON.parse(data) as Pelatihan[];
            const found = allPelatihan.find(p => p.id === id);
            console.log('Found in storage:', found);

            return found || null;
        } catch (error) {
            console.error('Error getting pelatihan by ID:', error);
            return null;
        }
    };

    const refreshData = () => {
        console.log('Refreshing pelatihan data');
        loadPelatihan();
    };

    return {
        pelatihan,
        loading,
        addPelatihan,
        updatePelatihan,
        deletePelatihan,
        getPelatihanById,
        refreshData,
        statistics: pelatihanStorage.getStatistics()
    };
}