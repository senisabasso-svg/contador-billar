# Contador Billar

Marcador profesional de billar (carambola / libre) en el navegador. Todo el estado vive en memoria: no hay base de datos ni persistencia.

## Cómo usar

```bash
npm install
npm run dev
```

Abrí `http://localhost:5173/`.

1. Configurá nombres, precio de mesa y quién abre.
2. En el turno activo, tocá un valor del **2 al 16** para sumar al instante.
3. **Corregir (−)** + un valor resta para enmendar errores.
4. **TE** termina la volada y pasa el turno (reinicia el reloj de 40s).
5. El centro muestra **tiempo de volada** (barra verde → roja + alarma).
6. **Deshacer** revierte la última anotación o cambio de turno.

Al refrescar la pestaña se pierde la partida (esperado en esta versión).
