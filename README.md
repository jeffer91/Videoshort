# 11 Récords Studio

Editor web gratuito para Shorts de fútbol. Proyecto desplegado desde la rama main en GitHub Pages.

## Flujo
1. Cargar video grabado del gancho, elegir plantilla, agregar una fotografía y recortar opcionalmente.
2. Cargar video del desarrollo y entre 1 y 10 fotografías; el tiempo de cada foto se distribuye automáticamente. Puedes reordenarlas.
3. Cargar video del cierre, sin fotografías adicionales. Se presenta la pregunta hablada con el texto «SÍGUENOS».
4. Aprobar cada escena, reproducir el conjunto y descargar.

Los recortes pueden durar de 1 a 180 segundos por escena. El video original no se altera. El estilo elegido en el gancho se mantiene en las tres escenas.

## Exportación
El navegador intenta grabar MP4 cuando MediaRecorder lo admite; de lo contrario exporta WebM. Se usa un lienzo de salida de 1080 × 1920 a 30 FPS nominales. **La composición original es de 540 × 960 y se amplía**: no representa detalle nativo 1080p. La grabación depende del rendimiento del teléfono y no garantiza FPS constantes ni sincronización perfecta. El audio es el original de los videos. La mejora de audio posterior a la unión sigue pendiente.

## Limitaciones
- Aplicación experimental: no se ha validado la exportación en todos los dispositivos Android.
- La segmentación automática de la persona depende de MediaPipe descargado desde CDN; puede producir halos o no estar disponible.
- No existen todavía fondos gráficos premium ni un recorte visual libre de fotografías.
- Los archivos permanecen en el dispositivo; cerrar o recargar la pestaña pierde la sesión.
- En móviles con memoria limitada, la exportación puede fallar o ralentizarse.

## Publicación
GitHub Actions publica automáticamente main mediante `.github/workflows/pages.yml`.
