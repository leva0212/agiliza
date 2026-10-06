# Detección de códigos de barras en evidencias

## Flujo simple Flutter Web (2026-10-06)

El editor usa `simple-barcode-batch.ts`: elegir Normal o HD y pulsar **Leer imágenes nuevas**. Solo toma evidencias todavía no procesadas en esa sesión; los cambios de notas y miniaturas no cancelan sus resultados. Las selecciones superiores a 30 muestran «Solo las primeras 30 imágenes serán tomadas en cuenta» y continúan con las primeras 30 en el orden del selector.

Primero se preparan todos los JPEG del lote. Hasta 1.048.576 bytes inclusive se mantienen dimensiones y bytes de los JPEG existentes; otros formatos se convierten realmente a JPEG con calidad 100. Por encima del límite, Normal conserva 50 % de ancho/alto con calidad 60; HD conserva 90 % con calidad 75. Luego se realiza una sola llamada `Html5Qrcode.scanFile(file, true)` por imagen, secuencialmente, con limpieza en `finally`. No se filtra por prefijo/longitud y no se ejecutan OCR, regiones ni fallbacks propios. Una imagen inválida o sin lectura no interrumpe las siguientes. Se respeta la configuración interna predeterminada de html5-qrcode 2.3.8, incluido su uso de BarcodeDetector cuando esté disponible.

La optimización de lectura es independiente de las ediciones y la compresión de subida existentes. El modo elegido aquí corresponde a la lectura del lote. Cerrar el editor cancela entre operaciones: no aborta un `scanFile` ya iniciado. No se usa un timeout que deje decodificaciones simultáneas en segundo plano.

En desarrollo, `/dev/barcode-benchmark` permite probar Normal o HD y activar explícitamente la comparación con el lector avanzado sobre los originales, sin OCR. La comparación avanzada está desactivada por defecto y nunca se activa por un fallo del flujo simple. Las referencias JSON son opcionales: sin ellas, detección no significa acierto. El JSON exporta nombre, dimensiones, bytes, tiempos de optimización/scanFile, código, errores y total del lote. Los tiempos incluyen la carga inicial del lector; cada `scanMs` mide únicamente la llamada `scanFile`. La comparación ejecuta primero el lote simple y luego el avanzado; considerar calentamiento/caché al interpretar tiempos.

Prueba de navegador: `node scripts/tests/simple-barcode-browser.cjs` (Playwright y esbuild disponibles, `BARCODE_CHROME` opcional). Verifica límite inclusivo de tamaño, dos fases, tope de 30, continuación tras errores, lectura exacta de un CODE_128 sintético y cancelación. Luego procesa las primeras 15 fotos ordenadas de cada carpeta Claro/Liberty en ambos modos y guarda `test-images/benchmark-results/simple-results.json`. `BARCODE_CONTRACT_ONLY=1` omite la medición real.

Resultado local: Chrome headless 154 en Windows, **sin BarcodeDetector**: Normal 0/30 detectados en 7,15 s; HD 0/30 en 13,12 s. El control CODE_128 sí se decodificó exactamente. No demuestra el rendimiento en Chrome Android ni reproduce aún las lecturas reportadas de Flutter. Repetir allí con las mismas fotos y referencias impresas antes de concluir equivalencia.

## Implementación avanzada conservada

Los módulos `analyze-evidence-image.ts` y `barcode-regions.ts` permanecen disponibles sin cambios. Lo siguiente documenta ese flujo y su arnés histórico; el editor ya no lo ejecuta automáticamente.

La etapa de regiones se ejecuta antes del lector nativo y Html5Qrcode. Busca gradientes paralelos en toda una previsualización de hasta 1200 píxeles de lado, conserva hasta ocho candidatos, recorta desde el original y prueba orientación y contraste. ZXing se limita a CODE_128 y se acepta únicamente `^895\d{15,16}$`. No cambia el worker, preparación ni reconocimiento de Tesseract.

El presupuesto de intentos en regiones es de 2,5 segundos, comprobado entre operaciones; una decodificación síncrona puede sobrepasarlo. El timeout externo de barcode pasa de 15 a 20 segundos para permitir la nueva etapa. No es cancelación: como en la implementación anterior, una operación que ya está en curso puede continuar después del timeout. No hay rectificación proyectiva ni garantía de lectura de todas las fotos.

## Prueba manual en navegador

Ejecutar `npm run dev`, abrir `/dev/barcode-benchmark` y seleccionar fotos. Introducir un JSON de ICC esperados por nombre de archivo, con valores como texto: `{"foto.jpg":"895000000000000000"}`. Usar valores verificados contra la impresión, no inferidos del lector. La página requiere referencias para todos los archivos seleccionados y solo está disponible en desarrollo.

El resultado compara el flujo anterior con regiones + fallback, alterna el orden entre fotos y exporta JSON. El OCR se excluye para medir exclusivamente barcode. Las imágenes se procesan localmente. Los tiempos incluyen preparación y fallback; `decodeMs` de regiones suma solo sus intentos de lectura. Los diagnósticos incluyen coordenadas originales, dimensiones, rotación, lector y resultado por intento.

## Prueba automatizada local

El conjunto recibido contiene 42 JPG: 22 en `test-images/Sims Claro` y 20 en `test-images/Sims liberty`.

`node scripts/tests/benchmark-barcodes.cjs` ejecuta los mismos módulos de navegador en Chrome mediante Playwright y guarda `test-images/benchmark-results/results.json`. Requiere Playwright y esbuild disponibles en el entorno de pruebas; no son dependencias de producción. En esta sesión se utilizó Playwright del runtime de Codex mediante `NODE_PATH`, y `BARCODE_CHROME` apuntó al ejecutable local de Chrome. `BARCODE_LIMIT` limita opcionalmente el número de fotos. El arnés sirve solo en loopback las fotos enumeradas, sin subirlas a servicios externos.

La referencia del arnés es el flujo anterior sin el timeout externo del analizador. Chrome headless de escritorio puede carecer de BarcodeDetector nativo: sus resultados no representan Chrome Android. No comparar tiempos de una pasada suspendida o interrumpida. Verificar lecturas positivas contra el ICC impreso antes de contabilizarlas como aciertos. Conservar resultados por imagen, incluidos los fallos.

Pruebas de localización sintética: `npx tsx --test scripts/tests/barcode-regions.test.ts`. Cubren imagen vacía, distintas orientaciones, posición superior y varias regiones; no sustituyen fotografías reales.
