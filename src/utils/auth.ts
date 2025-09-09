// src/utils/auth.ts
export const getUserId = (): string | null => {
    if (typeof window === 'undefined') return null;

    // Coba dari sessionStorage dulu
    const sessionUserId = sessionStorage.getItem('userId');
    if (sessionUserId) return sessionUserId;

    // Coba dari localStorage
    const localUserId = localStorage.getItem('userId');
    if (localUserId) {
        // Simpan ke sessionStorage untuk konsistensi
        sessionStorage.setItem('userId', localUserId);
        return localUserId;
    }

    return null;
};

export const setUserId = (userId: string): void => {
    if (typeof window === 'undefined') return;

    // Simpan di kedua tempat untuk redundancy
    sessionStorage.setItem('userId', userId);
    localStorage.setItem('userId', userId);
};

export const clearUserId = (): void => {
    if (typeof window === 'undefined') return;

    sessionStorage.removeItem('userId');
    localStorage.removeItem('userId');
};