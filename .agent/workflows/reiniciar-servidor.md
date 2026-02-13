---
description: Reinicia el servidor de desarrollo local de Next.js limpiando procesos previos.
---

Este workflow detiene cualquier instancia previa de Next.js y arranca el servidor de desarrollo.

// turbo-all
### Pasos

1. **Parar procesos existentes**
   - Ejecutar comando para liberar el puerto 3000 (típico de Next.js):
     `powershell -Command "Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess -Force -ErrorAction SilentlyContinue"`

2. **Iniciar Servidor**
   - Ejecutar `npm run dev`.

3. **Verificación**
   - Confirmar que el servidor está escuchando en [http://localhost:3000](http://localhost:3000).
