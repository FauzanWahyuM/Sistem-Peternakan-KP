// app/hooks/useKuesionerStatus.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

const months = [
    { id: 'januari', name: 'Januari', number: 1 },
    { id: 'februari', name: 'Februari', number: 2 },
    { id: 'maret', name: 'Maret', number: 3 },
    { id: 'april', name: 'April', number: 4 },
    { id: 'mei', name: 'Mei', number: 5 },
    { id: 'juni', name: 'Juni', number: 6 },
    { id: 'juli', name: 'Juli', number: 7 },
    { id: 'agustus', name: 'Agustus', number: 8 },
    { id: 'september', name: 'September', number: 9 },
    { id: 'oktober', name: 'Oktober', number: 10 },
    { id: 'november', name: 'November', number: 11 },
    { id: 'desember', name: 'Desember', number: 12 },
];

export const useKuesionerStatus = () => {
    const { data: session } = useSession();
    const [status, setStatus] = useState<{ [key: string]: boolean }>({});
    const [loading, setLoading] = useState(true);

    const fetchStatus = useCallback(async () => {
        if (!session?.user?.id) return;

        try {
            setLoading(true);
            const newStatus: { [key: string]: boolean } = {};

            for (const month of months) {
                const res = await fetch(
                    `/api/kuesioner?questionnaireId=${month.name}&userId=${session.user.id}&month=${month.number}&year=${new Date().getFullYear()}`
                );

                if (res.ok) {
                    const data = await res.json();
                    newStatus[month.id] = data?.status === true;
                } else {
                    newStatus[month.id] = false;
                }
            }

            setStatus(newStatus);
        } catch (err) {
            console.error("Gagal ambil status kuesioner:", err);
        } finally {
            setLoading(false);
        }
    }, [session]);

    const updateStatus = useCallback((monthId: string, newStatus: boolean) => {
        setStatus(prev => ({ ...prev, [monthId]: newStatus }));
    }, []);

    useEffect(() => {
        fetchStatus();
    }, [fetchStatus]);

    return { status, loading, refetch: fetchStatus, updateStatus };
};