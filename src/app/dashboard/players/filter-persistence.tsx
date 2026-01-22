'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

export default function FilterPersistence() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const hasRestoredRef = useRef(false);

    // Reset restoration flag when leaving the page
    useEffect(() => {
        if (pathname !== '/dashboard/players') {
            hasRestoredRef.current = false;
        }
    }, [pathname]);

    // Restore filters logic
    useEffect(() => {
        // Only run on the players page
        if (pathname !== '/dashboard/players') return;

        // If already restored this session, don't do it again
        if (hasRestoredRef.current) return;

        const currentParams = searchParams.toString();

        // If there are already params, we consider the restoration "done"
        if (currentParams) {
            hasRestoredRef.current = true;
            return;
        }

        // No params present, try to restore from storage
        const savedFilters = sessionStorage.getItem('playerFilters');
        if (savedFilters) {
            // Avoid infinite loop if we are already at the target state
            if (currentParams === savedFilters) {
                hasRestoredRef.current = true;
                return;
            }
            hasRestoredRef.current = true;
            router.replace(`/dashboard/players?${savedFilters}`);
        } else {
            // Nothing to restore, mark as checked
            hasRestoredRef.current = true;
        }
    }, [pathname, searchParams, router]);

    // Save filters logic
    useEffect(() => {
        const paramsStr = searchParams.toString();

        if (paramsStr) {
            sessionStorage.setItem('playerFilters', paramsStr);
        } else {
            // If filters are cleared, clear the storage too
            sessionStorage.removeItem('playerFilters');
        }
    }, [searchParams]);

    return null;
}
