'use client';

import { useState } from 'react';

interface SalaryRecord {
    id: string;
    amount: number;
    date: Date;
    month?: number; // derived from date if not stored
    year?: number;
    coachId: string;
    coachName: string;
}

interface Props {
    data: SalaryRecord[];
    year: number;
}

export default function CoachSalaryReport({ data, year }: Props) {
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    // Pivot data: Coach -> [Month Vals]
    const pivot = data.reduce((acc, record) => {
        if (!acc[record.coachId]) {
            acc[record.coachId] = {
                name: record.coachName,
                months: Array(12).fill(0),
                total: 0
            };
        }
        const date = new Date(record.date);
        const monthIdx = date.getMonth(); // 0-11
        // If the record has specific month/year fields we should use them, but schema had "date". 
        // Schema also had "SalaryHistory" with just "date" and "amount". 
        // Let's assume date determines the month paid.

        acc[record.coachId].months[monthIdx] += record.amount;
        acc[record.coachId].total += record.amount;
        return acc;
    }, {} as Record<string, { name: string, months: number[], total: number }>);

    const sortedCoaches = Object.values(pivot).sort((a, b) => a.name.localeCompare(b.name));

    // Calculate monthly totals
    const monthlyTotals = Array(12).fill(0);
    let grandTotal = 0;
    sortedCoaches.forEach(c => {
        c.months.forEach((val, idx) => {
            monthlyTotals[idx] += val;
        });
        grandTotal += c.total;
    });

    return (
        <div className="card" style={{ padding: 0, overflowX: 'auto', border: '1px solid var(--border)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ background: 'var(--secondary)', borderBottom: '1px solid var(--border)' }}>
                        <th style={{ padding: '1rem', textAlign: 'left', minWidth: '150px' }}>Entrenador</th>
                        {months.map(m => (
                            <th key={m} style={{ padding: '0.5rem', fontSize: '0.8rem', textAlign: 'center' }}>{m.slice(0, 3)}</th>
                        ))}
                        <th style={{ padding: '1rem', textAlign: 'right' }}>Total</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedCoaches.map((row, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '1rem', fontWeight: '500' }}>{row.name}</td>
                            {row.months.map((amount, mIdx) => (
                                <td key={mIdx} style={{ padding: '0.5rem', textAlign: 'center', color: amount > 0 ? 'var(--foreground)' : 'gray', fontSize: '0.9rem' }}>
                                    {amount > 0 ? `$${amount.toLocaleString()}` : '-'}
                                </td>
                            ))}
                            <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold', color: 'var(--primary)' }}>
                                ${row.total.toLocaleString()}
                            </td>
                        </tr>
                    ))}
                    {/* Totals Row */}
                    <tr style={{ background: '#1c1c1c', borderTop: '2px solid #eab308' }}>
                        <td style={{ padding: '1rem', color: '#ffffff', fontWeight: 800, fontSize: '0.9rem' }}>TOTAL MENSUAL</td>
                        {monthlyTotals.map((total, idx) => (
                            <td key={idx} style={{ padding: '0.5rem', textAlign: 'center', fontSize: '0.9rem', color: total > 0 ? '#fbbf24' : '#525252', fontWeight: total > 0 ? 700 : 400 }}>
                                {total > 0 ? `$${total.toLocaleString()}` : '-'}
                            </td>
                        ))}
                        <td style={{ padding: '1rem', textAlign: 'right', color: '#fbbf24', fontSize: '1rem', fontWeight: 800 }}>
                            ${grandTotal.toLocaleString()}
                        </td>
                    </tr>

                    {sortedCoaches.length === 0 && (
                        <tr>
                            <td colSpan={14} style={{ padding: '2rem', textAlign: 'center' }}>No hay registros de sueldos para este año.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
