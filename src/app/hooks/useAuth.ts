// app/hooks/useAuth.ts
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export const useAuth = () => {
    const [userId, setUserId] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Fungsi logout
    const logout = useCallback(() => {
        // Hapus semua data auth dari storage
        sessionStorage.removeItem('userId');
        sessionStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('token');
        localStorage.removeItem('userData');

        // Reset state
        setUserId(null);
        setToken(null);
        setLoading(false);

        // Dispatch event untuk memberi tahu komponen lain tentang logout
        window.dispatchEvent(new CustomEvent('authStateChanged', {
            detail: { isLoggedIn: false, userId: null, token: null }
        }));

        // Redirect ke halaman login
        router.push('/login');
    }, [router]);

    // Fungsi untuk sync auth data
    const syncAuth = useCallback(async (): Promise<{ success: boolean }> => {
        try {
            const response = await fetch('/api/auth/sync');
            if (response.ok) {
                const data = await response.json();
                if (data.userId) {
                    sessionStorage.setItem('userId', data.userId);
                    sessionStorage.setItem('token', 'next-auth-sync-token');
                    setUserId(data.userId);
                    setToken('next-auth-sync-token');

                    window.dispatchEvent(new CustomEvent('authStateChanged', {
                        detail: { isLoggedIn: true, userId: data.userId, token: 'next-auth-sync-token' }
                    }));

                    // 🪄 Tambahkan ini:
                    setLoading(false);

                    return { success: true };
                }
            }
            return { success: false };
        } catch (error) {
            console.error('Failed to sync auth data:', error);
            return { success: false };
        }
    }, []);

    useEffect(() => {
        const getAuthData = async () => {
            // Cek sessionStorage terlebih dahulu
            let storedUserId = sessionStorage.getItem('userId');
            let storedToken = sessionStorage.getItem('token');

            // Jika tidak ada di sessionStorage, cek localStorage
            if (!storedUserId || !storedToken) {
                storedUserId = localStorage.getItem('userId');
                storedToken = localStorage.getItem('token');

                // Jika ditemukan di localStorage, simpan ke sessionStorage
                if (storedUserId && storedToken) {
                    sessionStorage.setItem('userId', storedUserId);
                    sessionStorage.setItem('token', storedToken);
                }
            }

            // Jika masih tidak ada, coba sync dengan API
            if (!storedUserId || !storedToken) {
                const syncResult = await syncAuth();
                if (!syncResult.success) {
                    setLoading(false);
                } else {
                    // 🪄 Pastikan state ikut update setelah sync
                    const newUserId = sessionStorage.getItem('userId');
                    const newToken = sessionStorage.getItem('token');
                    setUserId(newUserId);
                    setToken(newToken);
                    setLoading(false);
                }
            }
        };

        getAuthData();

        // Event listener untuk perubahan auth state dari komponen lain
        const handleAuthChange = (event: CustomEvent) => {
            if (event.detail && event.detail.isLoggedIn === false) {
                setUserId(null);
                setToken(null);
                setLoading(false);
            }
        };

        window.addEventListener('authStateChanged', handleAuthChange as EventListener);

        return () => {
            window.removeEventListener('authStateChanged', handleAuthChange as EventListener);
        };
    }, [syncAuth]);

    // Fungsi untuk mengecek apakah user terautentikasi
    const isAuthenticated = useCallback(() => {
        return !!userId && !!token;
    }, [userId, token]);

    return {
        userId,
        token,
        loading,
        logout,
        isAuthenticated
    };
};