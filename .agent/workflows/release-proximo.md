---
description: Proceso para subir versión, crear tag y documentar cambios en GitHub automáticamente.
---

Este workflow automatiza la subida de una nueva versión del BasketAllBoys App.

### Pasos

1. **Revisión de Cambios Locales**
   - Correr `git status` para confirmar que no hay archivos sin seguimiento importantes.
   - Correr `git diff` para entender qué cambios se están incluyendo.

2. **Actualización de Versión (Bump Version)**
   - Preguntar al usuario cuál es el nuevo número de versión (ej. 2.3.0).
   - Actualizar el campo `version` en `package.json`.

3. **Commit y Tagging**
   - Ejecutar un commit con el formato: `Build [VERSION]: [Resumen corto de cambios]`.
   - Crear un tag git local: `v[VERSION]`.

4. **Sincronización con GitHub**
   - Hacer `git push origin main`.
   - Hacer `git push origin v[VERSION]`.

5. **Documentación del Cambio**
   - Usar el MCP de GitHub para listar los commits entre el tag anterior y el nuevo.
   - Generar un resumen de cambios (`walkthrough.md`) para el usuario.
   - Proporcionar el link de comparación de GitHub.

// turbo
6. **Limpieza Final**
   - Actualizar `task.md` para marcar el release como completado.
