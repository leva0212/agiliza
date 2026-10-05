'use client';

import { useState } from 'react';
import { readEvidenceBarcode } from '@/modules/shipments/utils/analyze-evidence-image';

type Row = { file: string; mode: string; expected: string; correct: boolean | null; error?: string } & Partial<Awaited<ReturnType<typeof readEvidenceBarcode>>>;

export default function BarcodeBenchmark() {
  const [files, setFiles] = useState<File[]>([]);
  const [manifest, setManifest] = useState('{}');
  const [rows, setRows] = useState<Row[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function run() {
    setError('');
    let expected: Record<string, string>;
    try {
      expected = JSON.parse(manifest);
      if (!expected || typeof expected !== 'object' || files.some(f => typeof expected[f.name] !== 'string' || !/^895\d{15,16}$/.test(expected[f.name]))) {
        throw new Error('Indica un ICC válido esperado para cada archivo.');
      }
    } catch (e) { setError(String(e)); return; }
    setBusy(true); setRows([]);
    try {
      // Warm imports before timing; alternate order to reduce systematic cache bias.
      await Promise.all([import('@zxing/browser'), import('@zxing/library'), import('html5-qrcode')]);
      for (const [i, file] of files.entries()) {
        for (const regions of (i % 2 ? [true, false] : [false, true])) {
          const base = { file: file.name, mode: regions ? 'regiones + fallback' : 'anterior', expected: expected[file.name] };
          try {
            const result = await readEvidenceBarcode(file, regions);
            setRows(current => [...current, { ...base, ...result, correct: result.barcode === base.expected }]);
          } catch (e) { setRows(current => [...current, { ...base, correct: false, error: String(e) }]); }
        }
      }
    } catch (e) { setError(String(e)); } finally { setBusy(false); }
  }
  function download() {
    const blob = new Blob([JSON.stringify({ date: new Date().toISOString(), userAgent: navigator.userAgent, rows }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = url; a.download = 'barcode-benchmark.json'; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return <main style={{ padding: 24, display: 'grid', gap: 16 }}>
    <h1>Comparación de códigos de barras</h1>
    <p>Selecciona las fotografías que deseas comparar. Procesamiento local, sin OCR. Tiempos en milisegundos; mismas fotos y navegador para ambos flujos.</p>
    <input aria-label="Fotografías" type="file" multiple accept="image/*" disabled={busy} onChange={e => setFiles(Array.from(e.target.files ?? []).sort((a, b) => a.name.localeCompare(b.name)))} />
    <label>ICC esperado por nombre de archivo (JSON, valores como texto)
      <textarea style={{ display: 'block', width: '100%' }} rows={6} value={manifest} disabled={busy} onChange={e => setManifest(e.target.value)} placeholder={'{"foto.jpg":"895000000000000000"}'} />
    </label>
    <button disabled={busy || !files.length} onClick={run}>{busy ? 'Procesando…' : `Comparar ${files.length} fotos`}</button>
    {error && <p role="alert">{error}</p>}
    {['anterior', 'regiones + fallback'].map(mode => {
      const group = rows.filter(r => r.mode === mode);
      return <p key={mode}>{mode}: {group.filter(r => r.correct).length}/{group.length} aciertos ({files.length} fotos seleccionadas)</p>;
    })}
    <button disabled={busy || !rows.length} onClick={download}>Descargar resultados y diagnóstico JSON</button>
    <div style={{ overflowX: 'auto' }}><table><thead><tr>{['Foto', 'Flujo', 'ICC', 'Acierto', 'Candidatos', 'Detección ms', 'Decodificación regiones ms', 'Total ms'].map(s => <th key={s}>{s}</th>)}</tr></thead>
      <tbody>{rows.map((r, i) => <tr key={i}><td>{r.file}</td><td>{r.mode}</td><td>{r.error ?? r.barcode ?? 'Sin lectura'}</td><td>{r.correct ? 'Sí' : 'No'}</td><td>{r.regions?.candidates.length ?? '—'}</td><td>{r.regions?.detectionMs.toFixed(0) ?? '—'}</td><td>{r.regions?.decodeMs.toFixed(0) ?? '—'}</td><td>{r.totalMs?.toFixed(0) ?? '—'}</td></tr>)}</tbody></table></div>
  </main>;
}
