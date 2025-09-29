// app/hooks/useAuth.ts
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface UserData {
    _id: string;
    nama: string;
    email: string;
    profileImage?: string;
    role: string;
    [key: string]: any;
}

export const useAuth = () => {
    const [user, setUser] = useState<UserData | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const logout = useCallback(() => {
        sessionStorage.clear();
        localStorage.clear();
        setUser(null);
        setToken(null);
        setLoading(false);

        window.dispatchEvent(new CustomEvent('authStateChanged', { detail: { isLoggedIn: false } }));
        router.push('/login');
    }, [router]);

    // 🔑 Tambahkan fungsi untuk fetch user detail
    const fetchUser = useCallback(async () => {
        try {
            const res = await fetch('/api/auth/me');
            if (!res.ok) {
                console.warn('❌ /api/auth/me failed:', res.status);
                setUser(null);
                return;
            }
            const data = await res.json();
            setUser(data.user);
            localStorage.setItem('userData', JSON.stringify(data.user));
        } catch (error) {
            console.error('Failed to fetch user:', error);
            setUser(null);
        }
    }, []);

    const syncAuth = useCallback(async (): Promise<boolean> => {
        try {
            const response = await fetch('/api/auth/sync');
            if (!response.ok) return false;

            const data = await response.json();
            if (data.userId) {
                sessionStorage.setItem('userId', data.userId);
                sessionStorage.setItem('token', 'next-auth-sync-token');
                setToken('next-auth-sync-token');
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to sync auth data:', error);
            return false;
        }
    }, []);

    useEffect(() => {
        const initAuth = async () => {
            // Ambil data user dari localStorage supaya UI langsung ada
            const cached = localStorage.getItem('userData');
            if (cached) {
                try {
                    setUser(JSON.parse(cached));
                } catch {
                    localStorage.removeItem('userData');
                }
            }

            let storedUserId = sessionStorage.getItem('userId');
            let storedToken = sessionStorage.getItem('token');

            if (!storedUserId || !storedToken) {
                storedUserId = localStorage.getItem('userId');
                storedToken = localStorage.getItem('token');
                if (storedUserId && storedToken) {
                    sessionStorage.setItem('userId', storedUserId);
                    sessionStorage.setItem('token', storedToken);
                }
            }

            if (!storedUserId || !storedToken) {
                const success = await syncAuth();
                if (!success) {
                    setLoading(false);
                    return;
                }
            }

            await fetchUser(); // ✅ Ambil data user terbaru (termasuk foto profil)
            setLoading(false);
        };

        initAuth();

        const handleAuthChange = (event: CustomEvent) => {
            if (event.detail?.isLoggedIn === false) {
                setUser(null);
                setToken(null);
                setLoading(false);
            }
        };

        window.addEventListener('authStateChanged', handleAuthChange as EventListener);
        return () => {
            window.removeEventListener('authStateChanged', handleAuthChange as EventListener);
        };
    }, [syncAuth, fetchUser]);

    const isAuthenticated = useCallback(() => !!user, [user]);

    return { user, token, loading, logout, isAuthenticated };
};
