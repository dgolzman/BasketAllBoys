'use client';

import { useRouter, useSearchParams } from 'next/navigation';

interface SortableHeaderProps {
    label: string;
    value: string;
    currentSort: string;
    currentOrder: string;
}

export default function SortableHeader({ label, value, currentSort, currentOrder }: SortableHeaderProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleSort = () => {
        const params = new URLSearchParams(searchParams.toString());
        if (currentSort === value) {
            params.set('sortOrder', currentOrder === 'asc' ? 'desc' : 'asc');
        } else {
            params.set('sort', value);
            params.set('sortOrder', 'asc');
        }
        router.push(`?${params.toString()}`);
    };

    const isSorted = currentSort === value;
    const arrow = isSorted ? (currentOrder === 'asc' ? ' ↑' : ' ↓') : '';

    return (
        <th
            style={{ padding: '1rem', color: 'var(--foreground)', fontSize: '0.85rem', cursor: 'pointer', userSelect: 'none' }}
            onClick={handleSort}
        >
            {label}{arrow}
        </th>
    );
}
