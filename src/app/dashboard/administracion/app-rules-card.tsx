import React from 'react';

export default function AppRulesCard() {
    const rules = [
        {
            title: "🏷️ Estados de Jugador",
            items: [
                "ACTIVO: Jugador con datos completos y participación regular.",
                "INACTIVO: Jugador que se ha retirado o no participa.",
                "REVISAR: Se asigna automáticamente si falta el DNI real (TEMP-), la fecha de nacimiento es inválida o no está cargada."
            ]
        },
        {
            title: "👕 Números de Camiseta",
            items: [
                "No pueden repetirse dentro de la misma Tira.",
                "Validación de Adyacencia: Un número no puede usarse en la categoría actual ni en la inmediatamente anterior o posterior (Ej: U13 bloquea U11 y U15)."
            ]
        },
        {
            title: "💳 Reglas de Saldado (Federación)",
            items: [
                "Categorías Infantiles (Mosquitos, U9, U11 / MINI): Se salda con 1 cuota.",
                "Categorías Competitivas (U13 en adelante): Se salda con 3 cuotas.",
                "Año de vigencia actual: 2026."
            ]
        },
        {
            title: "🎓 Becas y Pagos",
            items: [
                "Los jugadores marcados con 'BECA' están exentos del pago de cuota de actividad.",
                "La deuda se calcula automáticamente en base al historial de pagos y meses activos."
            ]
        }
    ];

    return (
        <div className="card" style={{ border: '1px solid var(--primary)', background: 'rgba(124, 58, 237, 0.03)', gridColumn: 'span 2' }}>
            <h3 className="ui-mayusculas" style={{ marginBottom: '1.5rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                📜 Reglas de Negocio del Sistema
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                {rules.map((section, idx) => (
                    <div key={idx} style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                        <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--foreground)', opacity: 0.9 }}>{section.title}</h4>
                        <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.85rem', color: 'var(--foreground)', opacity: 0.8, lineHeight: '1.4' }}>
                            {section.items.map((item, i) => (
                                <li key={i} style={{ marginBottom: '0.5rem' }}>{item}</li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            <p style={{ marginTop: '1.5rem', fontSize: '0.8rem', opacity: 0.6, fontStyle: 'italic', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                Estas reglas son aplicadas automáticamente durante la creación, edición e importación de jugadores.
            </p>
        </div>
    );
}
