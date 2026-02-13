---
description: usa esto para detectar el error, aislar la causa y proponer el arreglo
---

Este workflow ayuda a diagnosticar problemas rápidamente ofreciendo diferentes enfoques claros.

### Pasos

1. **Definir el Alcance**
   - Preguntar al usuario cuál de estos enfoques prefiere:
     1. **Cambios Recientes**: ¿El error apareció tras el último cambio que hicimos?
     2. **Inspección de Código**: Analizar sintaxis, tipos y logs del servidor.
     3. **Prueba en Navegador**: Debugging visual, capturas y consola web.
     4. **Testeo Profundo**: Revisión integral de base de datos y flujos lógicos.

2. **Opción 1: Análisis de Cambios Recientes**
   - Ejecutar `git log -n 5 --patch` para revisar los últimos commits.
   - Identificar posibles regresiones en los archivos modificados.

3. **Opción 2: Diagnóstico de Código**
   - Correr `npm run lint` para buscar errores de TypeScript o ESLint.
   - Revisar los logs más recientes de la terminal o errores de Prisma.

4. **Opción 3: Diagnóstico en Navegador**
   - Abrir el navegador en la URL donde se reporta el error.
   - Tomar capturas de pantalla de la UI.
   - Revisar errores en la consola del desarrollador (browser console).

5. **Opción 4: Testeo Profundo**
   - Revisar exhaustivamente `prisma/schema.prisma` y las relaciones.
   - Analizar las server actions (`src/lib/*.ts`) involucradas paso a paso.

6. **Propuesta de Arreglo**
   - Basado en el diagnóstico elegido, proponer la solución técnica.
   - Aplicar el arreglo una vez aprobado.
