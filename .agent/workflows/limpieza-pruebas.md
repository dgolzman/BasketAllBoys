---
description: Guía para eliminar datos de prueba tras verificaciones
---

# Limpieza de Datos de Prueba

Este workflow debe ejecutarse SIEMPRE al finalizar una tarea que haya implicado la creación de datos de prueba en la base de datos.

## Comando de Limpieza

Ejecuta el siguiente comando en la terminal para limpiar automáticamente los datos de prueba (patrones: "Test", "Prueba", "Verificado", "Borrar", "Contacto"):

```bash
npx tsx src/scripts/clean-test-data.ts
```

## Verificación
El script mostrará en consola la cantidad de registros eliminados.
