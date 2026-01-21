'use client';

import { useState, Fragment } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ReportRow {
    date: Date;
    category: string;
    tira: string;
    coachName?: string;
    presentCount: number;
    totalCount: number;
    presentPlayers: string[];
}

export default function ReportsTable({ data, groupBy = 'day' }: { data: ReportRow[], groupBy?: string }) {
    const [expandedRow, setExpandedRow] = useState<string | null>(null);

    const toggleRow = (key: string) => {
        setExpandedRow(expandedRow === key ? null : key);
    };

    return (
        <div className="card" style={{ overflowX: 'auto', padding: 0, background: '#111', border: '1px solid #333' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                    <tr style={{ background: '#222', borderBottom: '1px solid #444' }}>
                        <th style={{ padding: '1rem', color: '#aaa', fontSize: '0.85rem' }}>PERIODO</th>
                        <th style={{ padding: '1rem', color: '#aaa', fontSize: '0.85rem' }}>EQUIPO / CATEGORIA</th>
                        <th style={{ padding: '1rem', color: '#aaa', fontSize: '0.85rem' }}>PRESENTES</th>
                        <th style={{ padding: '1rem', color: '#aaa', fontSize: '0.85rem' }}>ASISTENCIA</th>
                        <th style={{ padding: '1rem' }}></th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, i) => {
                        const key = `${row.date.getTime()}_${row.category}_${row.tira}`;
                        const isExpanded = expandedRow === key;

                        const localDate = new Date(row.date);
                        let dateLabel = '';
                        let subLabel = '';

                        if (groupBy === 'day') {
                            dateLabel = format(localDate, 'dd/MM/yyyy');
                            subLabel = format(localDate, 'EEEE', { locale: es });
                        } else if (groupBy === 'week') {
                            dateLabel = `Semana ${format(localDate, 'dd/MM')}`;
                            subLabel = `Inicia el ${format(localDate, 'EEEE', { locale: es })}`;
                        } else if (groupBy === 'month') {
                            dateLabel = format(localDate, 'MMMM yyyy', { locale: es });
                        } else if (groupBy === 'year') {
                            dateLabel = format(localDate, 'yyyy');
                        }

                        return (
                            <Fragment key={key}>
                                <tr
                                    style={{
                                        borderBottom: i === data.length - 1 && !isExpanded ? 'none' : '1px solid #333',
                                        cursor: 'pointer',
                                        background: isExpanded ? '#262626' : 'transparent',
                                        transition: 'background 0.2s'
                                    }}
                                    onClick={() => toggleRow(key)}
                                >
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ fontWeight: 'bold', color: '#fff', textTransform: 'capitalize' }}>{dateLabel}</div>
                                        {subLabel && <div style={{ fontSize: '0.75rem', color: '#888', textTransform: 'capitalize' }}>{subLabel}</div>}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ fontWeight: '600', color: 'var(--primary)' }}>{row.category}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            {row.tira}
                                            {row.coachName && <span style={{ color: '#ccc', opacity: 0.8 }}>• 👔 {row.coachName}</span>}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem', color: '#fff' }}>{row.presentCount} / {row.totalCount}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden', minWidth: '80px' }}>
                                                <div style={{ width: `${(row.presentCount / row.totalCount) * 100}%`, height: '100%', background: 'var(--accent)' }} />
                                            </div>
                                            <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#fff' }}>{Math.round((row.presentCount / row.totalCount) * 100)}%</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                        <span style={{ fontSize: '1.2rem', color: '#888' }}>{isExpanded ? '▴' : '▾'}</span>
                                    </td>
                                </tr>
                                {isExpanded && (
                                    <tr style={{ background: '#1a1a1a' }}>
                                        <td colSpan={5} style={{ padding: '1rem' }}>
                                            <div style={{ background: '#000', padding: '1.25rem', borderRadius: '8px', border: '1px solid #333' }}>
                                                <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                    Jugadores Presentes ({row.presentCount}):
                                                </h4>
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
                                                    {row.presentPlayers.length > 0 ? (
                                                        row.presentPlayers.sort().map((name, idx) => (
                                                            <div key={idx} style={{ fontSize: '0.85rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                <span style={{ color: 'var(--accent)' }}>✓</span> {name}
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div style={{ color: '#666', fontSize: '0.85rem' }}>Nadie marcó asistencia.</div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </Fragment>
                        );
                    })}
                    {data.length === 0 && (
                        <tr>
                            <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--secondary)' }}>
                                No hay datos de asistencia para los filtros seleccionados.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
