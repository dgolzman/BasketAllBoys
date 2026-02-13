---
description: Guía para convertir teléfonos en enlaces de WhatsApp (Click-to-Chat)
---

# Implementación de Enlaces WhatsApp (Click-to-Chat)

Este workflow describe cómo transformar números de teléfono en enlaces directos a WhatsApp en cualquier listado de la aplicación.

## Pasos

1.  **Identificar el Componente:**
    -   Localizar el archivo `.tsx` donde se renderiza la lista (ej. `coach-list.tsx`, `player-list.tsx`).

2.  **Crear Función Helper (o usar utilidad):**
    -   Necesitamos limpiar el número de teléfono de caracteres no numéricos (espacios, guiones, paréntesis).

    ```typescript
    const getWhatsAppLink = (phone: string) => {
        // Eliminar todo lo que no sea número
        const cleanPhone = phone.replace(/\D/g, '');
        // Opcional: Agregar código de país si falta (ej. 549 para Argentina)
        // const fullPhone = cleanPhone.startsWith('54') ? cleanPhone : `549${cleanPhone}`;
        return `https://wa.me/${cleanPhone}`;
    };
    ```

3.  **Implementar en JSX:**
    -   Reemplazar el texto del teléfono por un enlace `<a>`.

    ```tsx
    {item.phone && (
        <a 
            href={getWhatsAppLink(item.phone)} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ textDecoration: 'none', color: 'inherit' }} // Ajustar estilos
        >
            📱 {item.phone}
        </a>
    )}
    ```

4.  **Verificación:**
    -   Hacer clic en el enlace y verificar que abra `api.whatsapp.com` o la app de WhatsApp.
