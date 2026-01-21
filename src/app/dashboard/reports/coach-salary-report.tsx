'use client';

import { useState } from 'react';

export default function CoachSalaryReport({ coaches, year }: { coaches: any[], year: number }) {
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    const reportData = coaches.map(coach => {
        const monthlySalaries = Array(12).fill(0);
        let total = 0;

        // Use registration date or start of year if registration was earlier
        const regDate = coach.registrationDate ? new Date(coach.registrationDate) : new Date(year, 0, 1);
        const withdrawalDate = coach.withdrawalDate ? new Date(coach.withdrawalDate) : null;

        for (let i = 0; i < 12; i++) {
            const currentMonthStart = new Date(year, i, 1);
            const currentMonthEnd = new Date(year, i + 1, 0);

            // Check if coach was active during this month
            // 1. Must be after registration (or same month)
            // 2. Must be before withdrawal (or null)

            // Logic:
            // - If currently in a month BEFORE registration month, inactive.
            // - If currently in a month AFTER withdrawal month, inactive.

            const isAfterStart = regDate <= currentMonthEnd;
            const isBeforeEnd = !withdrawalDate || withdrawalDate >= currentMonthStart;

            // Project only up to next month relative to current actual date
            const today = new Date();
            const projectLimit = new Date(today.getFullYear(), today.getMonth() + 2, 0); // End of next month
            const isWithinProjectionLimit = currentMonthStart <= projectLimit;

            if (isAfterStart && isBeforeEnd && isWithinProjectionLimit) {
                // Find effective salary for this month
                // Get the last history record where date <= Month End
                const history = coach.salaryHistory || [];
                const effectiveRecord = history
                    .filter((h: any) => new Date(h.date) <= currentMonthEnd)
                    .sort((a: any, b: any) => {
                        const timeDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
                        if (timeDiff !== 0) return timeDiff;
                        return b.id.localeCompare(a.id);
                    })[0];

                if (effectiveRecord) {
                    monthlySalaries[i] = effectiveRecord.amount;
                    total += effectiveRecord.amount;
                }
            }
        }

        return {
            name: coach.name,
            months: monthlySalaries,
            total
        };
    }).sort((a, b) => a.name.localeCompare(b.name));

    // Calculate monthly totals
    const monthlyTotals = Array(12).fill(0);
    let grandTotal = 0;
    reportData.forEach(c => {
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
                    {reportData.map((row, idx) => (
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

                    {reportData.length === 0 && (
                        <tr>
                            <td colSpan={14} style={{ padding: '2rem', textAlign: 'center' }}>No hay registros de sueldos para este año.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
