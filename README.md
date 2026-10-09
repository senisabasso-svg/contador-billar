# Contador Billar

Marcador profesional de billar (carambola / libre) en el navegador. Todo el estado vive en memoria: no hay base de datos ni persistencia.

## Cómo usar

```bash
npm install
npm run dev
```

Abrí `http://localhost:5173/`.

1. Configurá nombres, puntos objetivo y quién abre.
2. En el turno activo, ingresá los puntos de la entrada con el teclado.
3. Pulsá **TE** (Terminar Entrada) para sumar y pasar el turno.
4. **C** limpia la carga actual, **-** resta 1, **H** muestra el historial de entradas.
5. **Deshacer** revierte la última entrada confirmada.

Al refrescar la pestaña se pierde la partida (esperado en esta versión).
