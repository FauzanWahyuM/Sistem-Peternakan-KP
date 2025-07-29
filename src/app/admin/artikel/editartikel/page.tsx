// app/admin/user/edituser/page.tsx
import { Suspense } from 'react';
import EditArtikel from './EditArtikel';

export default function Page() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <EditArtikel />
        </Suspense>
    );
}
