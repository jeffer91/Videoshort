# Videoshort

PWA para transcribir videos de hasta dos minutos directamente en el navegador con Whisper Tiny multilingüe (modelo ONNX), sin claves API ni servicio de transcripción de pago.

## Uso

Abrir https://jeffer91.github.io/Videoshort/ en Chrome Android. Seleccionar un video de hasta 120 segundos, pulsar **Transcribir video**, esperar a que se descargue el modelo y se procese el archivo, y copiar o descargar el texto.

## Requisitos y limitaciones

- Requiere internet para cargar bibliotecas y descargar el modelo la primera vez.
- La extracción de audio usa ffmpeg.wasm; el navegador necesita suficiente memoria. Algunos dispositivos o códecs pueden fallar.
- El reconocimiento usa un solo motor local; no hay comparación de motores ni garantía de precisión perfecta.
- Los videos no se suben a un servidor propio. Se descargan recursos de proveedores CDN y del repositorio de modelos.
- Se recomienda Chrome Android actualizado y no bloquear el teléfono mientras procesa.

## Publicación

En GitHub Settings → Pages, elegir **Deploy from a branch**, rama **main**, carpeta **/(root)**. No se necesita una APK.
