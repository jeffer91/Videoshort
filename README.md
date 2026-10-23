# Videoshort Studio

Editor PWA gratuito para combinar tres videos: gancho, contenido y pregunta/CTA. Se ejecuta en el navegador y se publica con GitHub Actions.

## Funciones
- Carga de tres videos de hasta 120 segundos cada uno y varias imágenes para el fondo.
- Animaciones alrededor del gancho.
- Eliminación automática aproximada del fondo de la persona en contenido y CTA mediante MediaPipe Selfie Segmentation.
- Posición y tamaño configurables de la figura.
- Vista previa secuencial y exportación WebM mediante MediaRecorder donde el navegador lo permita.

## Limitaciones importantes
- Esta es una primera versión experimental. No se ha validado aún en dispositivos Android reales.
- La segmentación puede dejar halos y perder cabello, manos u objetos; los efectos son plantillas, no edición semántica automática.
- Los videos no se cargan a servidores de la app. Las bibliotecas y modelos se descargan de un CDN.
- La exportación MP4/H.264 y 1080p no está implementada; se exporta WebM a 540x960 cuando el navegador lo soporta.
- En teléfonos con poca memoria, tres videos y la segmentación en tiempo real pueden fallar o ir lentos.
- Para audio se usa Web Audio API + MediaRecorder, sujeto a compatibilidad del navegador.

## Publicación
Settings → Pages → Source: GitHub Actions. El workflow existente publica main automáticamente.
