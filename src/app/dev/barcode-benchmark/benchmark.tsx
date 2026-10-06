'use client';

import { useRef, useState, useEffect } from 'react';
import { readEvidenceBarcode } from '@/modules/shipments/utils/analyze-evidence-image';
import { BARCODE_LIMIT_MESSAGE, scanSimpleBarcodeBatch, type BarcodeMetrics } from '@/modules/shipments/utils/simple-barcode-batch';

type Row = { file: string; mode: string; barcode: string | null; totalMs: number; correct: boolean | null; error?: string; metrics?: BarcodeMetrics };

export default function BarcodeBenchmark() {
  const [files, setFiles] = useState<File[]>([]);
  const [manifest, setManifest] = useState('{}');
  const [rows, setRows] = useState<Row[]>([]);
  const [hd, setHd] = useState(false);
  const [advanced, setAdvanced] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [totals, setTotals] = useState<Record<string, number>>({});
  const controllerRef = useRef<AbortController | null>(null);
  useEffect(() => () => controllerRef.current?.abort(), []);

  async function run() {
    if (controllerRef.current) return;
    let expected: Record<string, string>;
    try {
      expected = JSON.parse(manifest);
      if (!expected || Array.isArray(expected) || typeof expected !== 'object' || Object.values(expected).some(value => typeof value !== 'string')) {
        throw new Error('Las referencias deben ser un objeto JSON con valores de texto.');
      }
    } catch (error) { setMessage(String(error)); return; }
    const controller = new AbortController();
    controllerRef.current = controller;
    setBusy(true); setRows([]); setTotals({});
    const mode = hd ? 'Simple HD' : 'Simple Normal';
    try {
      const result = await scanSimpleBarcodeBatch(files.map((file, i) => ({ id: String(i), file, hd })), {
        signal: controller.signal,
        onProgress: progress => setMessage((progress.phase === 'optimizing' ? 'Optimizando todas las fotos: ' : 'Leyendo fotos: ') + progress.completed + '/' + progress.total),
        onResult: metrics => setRows(current => [...current, {
          file: metrics.name, mode, barcode: metrics.barcode, metrics,
          totalMs: metrics.optimizationMs + metrics.scanMs, error: metrics.error,
          correct: expected[metrics.name] === undefined ? null : metrics.barcode === expected[metrics.name],
        }]),
      });
      setTotals(current => ({ ...current, [mode]: result.totalMs }));
      // Explicit comparison only; never a fallback for failed simple scans.
      if (advanced) {
        const started = performance.now();
        for (const [i, file] of files.entries()) {
          controller.signal.throwIfAborted();
          setMessage('Comparación avanzada: ' + (i + 1) + '/' + files.length);
          const before = performance.now();
          try {
            const result = await readEvidenceBarcode(file);
            controller.signal.throwIfAborted();
            setRows(current => [...current, { file: file.name, mode: 'Avanzado original', barcode: result.barcode, totalMs: result.totalMs,
              correct: expected[file.name] === undefined ? null : result.barcode === expected[file.name] }]);
          } catch (error) {
            controller.signal.throwIfAborted();
            setRows(current => [...current, { file: file.name, mode: 'Avanzado original', barcode: null, totalMs: performance.now() - before, correct: null, error: String(error) }]);
          }
        }
        setTotals(current => ({ ...current, 'Avanzado original': performance.now() - started }));
      }
      setMessage('Lote terminado');
    } catch (error) {
      if (!controller.signal.aborted) setMessage(String(error));
    } finally { controllerRef.current = null; setBusy(false); }
  }

  function download() {
    const blob = new Blob([JSON.stringify({ date: new Date().toISOString(), userAgent: navigator.userAgent, hd, manifest, totals, rows }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = url; a.download = 'barcode-benchmark.json'; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return <main style={{ padding: 24, display: 'grid', gap: 16 }}>
    <h1>Comparación de códigos de barras</h1>
    <p>Lectura local de hasta 30 fotos. Primero se optimiza todo el lote; después se lee cada JPEG completo una sola vez. Sin OCR ni filtro ICC en el flujo simple.</p>
    <input aria-label="Fotografías" type="file" multiple accept="image/*" disabled={busy} onChange={event => {
      const selected = Array.from(event.target.files ?? []);
      setFiles(selected.slice(0, 30)); setRows([]); setTotals({});
      setMessage(selected.length > 30 ? BARCODE_LIMIT_MESSAGE : selected.length + ' fotos seleccionadas');
      event.target.value = '';
    }} />
    <label>Optimización: <select disabled={busy} value={hd ? 'hd' : 'normal'} onChange={event => setHd(event.target.value === 'hd')}>
      <option value="normal">Normal: 50 % de dimensiones, calidad 60</option>
      <option value="hd">HD: 90 % de dimensiones, calidad 75</option>
    </select></label>
    <p>Hasta 1 MB (1.048.576 bytes): mismas dimensiones; JPEG original sin recomprimir, otros formatos a JPEG calidad 100.</p>
    <label><input type="checkbox" checked={advanced} disabled={busy} onChange={event => setAdvanced(event.target.checked)} /> Comparar también con el lector avanzado sobre los originales (regiones + fallbacks, sin OCR)</label>
    <label>Códigos esperados por nombre (JSON opcional; sin referencias solo se cuenta detección, no acierto)
      <textarea style={{ display: 'block', width: '100%' }} rows={4} value={manifest} disabled={busy} onChange={event => setManifest(event.target.value)} />
    </label>
    <button disabled={busy || !files.length} onClick={() => void run()}>{busy ? 'Procesando…' : 'Procesar ' + files.length + ' fotos'}</button>
    <p role="status">{message}</p>
    {Object.entries(totals).map(([mode, ms]) => {
      const group = rows.filter(row => row.mode === mode);
      return <p key={mode}>{mode}: {group.filter(row => row.barcode).length}/{group.length} detectados; {group.filter(row => row.correct).length}/{group.filter(row => row.correct !== null).length} aciertos con referencia. Total lote: {(ms / 1000).toFixed(2)} s.</p>;
    })}
    <button disabled={busy || !rows.length} onClick={download}>Descargar métricas JSON</button>
    <div style={{ overflowX: 'auto' }}><table><thead><tr>{['Foto', 'Flujo', 'Código', 'Acierto', 'Original px / bytes', 'JPEG px / bytes', 'Optimización ms', 'scanFile ms', 'Total ms', 'Detalle'].map(label => <th key={label}>{label}</th>)}</tr></thead>
      <tbody>{rows.map((row, i) => <tr key={i}>
        <td>{row.file}</td><td>{row.mode}</td><td>{row.barcode ?? 'NO DETECTADO'}</td><td>{row.correct === null ? 'Sin referencia' : row.correct ? 'Sí' : 'No'}</td>
        <td>{row.metrics ? row.metrics.originalWidth + ' × ' + row.metrics.originalHeight + ' / ' + row.metrics.originalBytes : '—'}</td>
        <td>{row.metrics ? row.metrics.optimizedWidth + ' × ' + row.metrics.optimizedHeight + ' / ' + row.metrics.optimizedBytes : '—'}</td>
        <td>{row.metrics?.optimizationMs.toFixed(0) ?? '—'}</td><td>{row.metrics?.scanMs.toFixed(0) ?? '—'}</td><td>{row.totalMs.toFixed(0)}</td><td>{row.error ?? ''}</td>
      </tr>)}</tbody></table></div>
  </main>;
}
