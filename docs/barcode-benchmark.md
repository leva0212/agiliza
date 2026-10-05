# Detección de códigos de barras en evidencias

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
