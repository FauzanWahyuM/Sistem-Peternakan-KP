// app/hooks/useAuth.ts
import { useState, useEffect } from 'react';

export const useAuth = () => {
    const [userId, setUserId] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getAuthData = () => {
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

            // Jika masih tidak ada, coba dari NextAuth session
            if (!storedUserId || !storedToken) {
                // Anda perlu mengimplementasi pengambilan dari NextAuth session
                // atau sync dengan UnifiedSidebar
                const userData = localStorage.getItem('userData');
                if (userData) {
                    const parsedData = JSON.parse(userData);
                    storedUserId = parsedData._id;
                    // Untuk token, Anda perlu menyimpannya saat login
                }
            }

            setUserId(storedUserId);
            setToken(storedToken);
            setLoading(false);
        };

        getAuthData();
    }, []);

    return { userId, token, loading };
};