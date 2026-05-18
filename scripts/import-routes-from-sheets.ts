import "dotenv/config";
import fs from "node:fs";
import path from "node:path";

import { LocalidadesService } from "@/services/localidades_service";
import { supabaseAdmin } from "@/services/supabase/admin";

import { guanacaste }  from "./data/guanacaste";
import { alajuela }    from "./data/alajuela";
import { cartago }     from "./data/cartago";
import { heredia }     from "./data/heredia";
import { limon }       from "./data/limon";
import { puntarenas }  from "./data/puntarenas";
import { sanjose }     from "./data/sanjose";

export type RouteSheetRow = {
  canton: string;
  distrito: string;
  ruta: string;
};

export type ProvinceImport = {
  provincia: string;
  rows: RouteSheetRow[];
};

const ALL: Record<string, ProvinceImport> = {
  guanacaste,
  alajuela,
  cartago,
  heredia,
  limon,
  puntarenas,
  sanjose,
};

// ── normalización para matching tolerante (sin acentos, uppercase) ──
function loose(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .trim();
}

// ── parsea la columna RUTA ──
//   "24 a 72 HRS"   → { min: 24, max: 72 }
//   "24 HRS"        → { min: 24, max: 0 }
//   "CRONOGRAMA"    → { min: 0,  max: 0  }  ← tiene cobertura, días se definen aparte
//   "SIN COBERTURA" → null                  ← sin cobertura, no se inserta
function parseHours(ruta: string): { min: number; max: number } | null {
  const norm = loose(ruta);

  if (norm.includes("SIN COBERTURA")) return null;

  // FIX: CRONOGRAMA = cobertura sin horas definidas → min:0 max:0
  if (norm.includes("CRONOGRAMA")) return { min: 0, max: 0 };

  const range = ruta.match(/(\d+)\s*a\s*(\d+)/i);
  if (range) return { min: Number(range[1]), max: Number(range[2]) };

  const single = ruta.match(/(\d+)/);
  if (single) return { min: Number(single[1]), max: 0 };

  return null;
}

// ── helpers de LocalidadesService ──
function findProvKey(provName: string): string | null {
  const target = loose(provName);
  return LocalidadesService.getProvincias().find((p) => loose(p) === target) ?? null;
}
function findCantonKey(provKey: string, cantonName: string): string | null {
  const target = loose(cantonName);
  return LocalidadesService.getCantones(provKey).find((c) => loose(c) === target) ?? null;
}
function findDistrictKey(provKey: string, cantonKey: string, distName: string): string | null {
  const target = loose(distName);
  return LocalidadesService.getDistritos(provKey, cantonKey).find((d) => loose(d) === target) ?? null;
}

const conflicts: string[] = [];
const log = (s: string) => conflicts.push(s);

async function importProvince(p: ProvinceImport) {
  console.log(`\n→ Importando ${p.provincia}...`);

  // ── 1. Provincia en BD ──────────────────────────────────────
  const { data: allProvinces, error: provErr } = await supabaseAdmin
    .from("provinces")
    .select("id, name");
  if (provErr) throw provErr;

  const province = (allProvinces ?? []).find(
    (x: any) => loose(x.name) === loose(p.provincia),
  );
  if (!province) {
    log(`[PROV NO EN BD] ${p.provincia}`);
    return;
  }

  // ── 2. Cantones de la provincia en BD ───────────────────────
  const { data: allCantons } = await supabaseAdmin
    .from("cantons")
    .select("id, name")
    .eq("province_id", province.id);

  const cantonByLoose = new Map<string, { id: number; name: string }>();
  for (const c of allCantons ?? []) cantonByLoose.set(loose(c.name), c as any);

  // ── 3. Distritos de la provincia en BD ──────────────────────
  const cantonIds = (allCantons ?? []).map((c: any) => c.id);
  const { data: allDistricts } =
    cantonIds.length > 0
      ? await supabaseAdmin
          .from("districts")
          .select("id, name, canton_id")
          .in("canton_id", cantonIds)
      : { data: [] as any[] };

  const districtByCantonLoose = new Map<string, { id: number; name: string; canton_id: number }>();
  for (const d of allDistricts ?? []) {
    districtByCantonLoose.set(`${d.canton_id}::${loose(d.name)}`, d as any);
  }

  // ── 4. Validar provincia en LocalidadesService ──────────────
  const provServiceKey = findProvKey(p.provincia);
  if (!provServiceKey) {
    log(`[PROV NO EN LOCALIDADES_SERVICE] ${p.provincia}`);
  }

  // ── 5. Procesar filas ───────────────────────────────────────
  const districtDeliveryTimes: { district_id: number; min_hours: number; max_hours: number }[] = [];
  const selectedNeighborhoodIds = new Set<number>();

  for (const row of p.rows) {
    const hours = parseHours(row.ruta);

    // SIN COBERTURA → null, se omite sin loguear (es esperado)
    if (!hours) continue;

    // BD: cantón
    const canton = cantonByLoose.get(loose(row.canton));
    if (!canton) {
      log(`[CANTÓN NO EN BD] ${p.provincia} → ${row.canton} → ${row.distrito} (ruta: "${row.ruta}")`);
      continue;
    }

    // BD: distrito
    const district = districtByCantonLoose.get(`${canton.id}::${loose(row.distrito)}`);
    if (!district) {
      log(`[DISTRITO NO EN BD] ${p.provincia} → ${canton.name} → ${row.distrito} (ruta: "${row.ruta}")`);
      continue;
    }

    // LocalidadesService: solo loguea, no aborta inserción
    if (provServiceKey) {
      const cantonKey = findCantonKey(provServiceKey, canton.name);
      if (!cantonKey) {
        log(`[CANTÓN NO EN LOCALIDADES_SERVICE] ${p.provincia} → ${canton.name}`);
      } else {
        const distKey = findDistrictKey(provServiceKey, cantonKey, district.name);
        if (!distKey) {
          log(`[DISTRITO NO EN LOCALIDADES_SERVICE] ${p.provincia} → ${canton.name} → ${district.name} (fila doc: "${row.distrito}")`);
        }
      }
    }

    // BD: barrios del distrito → todos a cobertura
    const { data: nbs } = await supabaseAdmin
      .from("neighborhoods")
      .select("id")
      .eq("district_id", district.id);

    if (!nbs || nbs.length === 0) {
      log(`[SIN BARRIOS EN BD] ${p.provincia} → ${canton.name} → ${district.name}`);
      continue;
    }

    for (const n of nbs) selectedNeighborhoodIds.add(n.id);

    districtDeliveryTimes.push({
      district_id: district.id,
      min_hours: hours.min,
      max_hours: hours.max,
    });
  }

  if (selectedNeighborhoodIds.size === 0) {
    log(`[RUTA VACÍA] ${p.provincia} — sin distritos cubiertos, ruta NO creada`);
    return;
  }

  // ── 6. Upsert de la ruta por nombre ─────────────────────────
  const routeName = p.provincia;

  const { data: existing } = await supabaseAdmin
    .from("routes")
    .select("id")
    .eq("name", routeName)
    .maybeSingle();

  let routeId: string;
  if (existing) {
    routeId = existing.id;
    const { error } = await supabaseAdmin
      .from("routes")
      .update({
        estimated_hours: 24,
        company_delivery_charge: 0,
        courier_delivery_pay: 0,
        company_failed_charge: 0,
        courier_failed_pay: 0,
      })
      .eq("id", routeId);
    if (error) throw error;

    await supabaseAdmin.from("route_visit_days").delete().eq("route_id", routeId);
    await supabaseAdmin.from("route_coverage").delete().eq("route_id", routeId);
    await supabaseAdmin.from("route_district_delivery_times").delete().eq("route_id", routeId);
    await supabaseAdmin.from("route_district_visit_days").delete().eq("route_id", routeId);
    console.log(`  · Ruta existente reescrita: ${routeName}`);
  } else {
    const { data, error } = await supabaseAdmin
      .from("routes")
      .insert({
        name: routeName,
        estimated_hours: 24,
        company_delivery_charge: 0,
        courier_delivery_pay: 0,
        company_failed_charge: 0,
        courier_failed_pay: 0,
      })
      .select("id")
      .single();
    if (error) throw error;
    routeId = data.id;
    console.log(`  · Ruta creada: ${routeName}`);
  }

  // ── 7. Cobertura (barrios) ──────────────────────────────────
  const coverageRows = [...selectedNeighborhoodIds].map((id) => ({
    route_id: routeId,
    neighborhood_id: id,
  }));
  for (let i = 0; i < coverageRows.length; i += 1000) {
    const chunk = coverageRows.slice(i, i + 1000);
    const { error } = await supabaseAdmin.from("route_coverage").insert(chunk);
    if (error) throw error;
  }

  // ── 8. Horas por distrito ───────────────────────────────────
  // FIX: usar dedupedTimes (no districtDeliveryTimes) para el insert
  const seenDistrictIds = new Set<number>();
  const dedupedTimes = districtDeliveryTimes.filter((d) => {
    if (seenDistrictIds.has(d.district_id)) return false;
    seenDistrictIds.add(d.district_id);
    return true;
  });

  if (dedupedTimes.length > 0) {
    const timesRows = dedupedTimes.map((d) => ({
      route_id: routeId,
      district_id: d.district_id,
      min_hours: d.min_hours,
      max_hours: d.max_hours,
    }));
    const { error } = await supabaseAdmin
      .from("route_district_delivery_times")
      .insert(timesRows);
    if (error) throw error;
  }

  // Nota: route_visit_days y route_district_visit_days no se insertan aquí.
  // Los distritos CRONOGRAMA quedan con min:0 max:0 y sin días → se configuran
  // manualmente desde la UI de rutas.

  console.log(
    `  ✓ ${dedupedTimes.length} distritos | ${selectedNeighborhoodIds.size} barrios`,
  );
}

async function main() {
  const arg = process.argv[2];
  const targets = arg ? [arg] : Object.keys(ALL);

  for (const name of targets) {
    const dataset = ALL[name];
    if (!dataset) {
      console.error(
        `No existe data file para "${name}". Disponibles: ${Object.keys(ALL).join(", ")}`,
      );
      process.exit(1);
    }
    await importProvince(dataset);
  }

  const logsDir = path.join(process.cwd(), "logs");
  fs.mkdirSync(logsDir, { recursive: true });
  const logPath = path.join(logsDir, `import-routes-conflicts.log`);
  const header =
    `Importación corrida: ${new Date().toISOString()}\n` +
    `Provincias: ${targets.join(", ")}\n` +
    `${"─".repeat(60)}\n`;
  const body = conflicts.length > 0 ? conflicts.join("\n") : "Sin conflictos.";
  fs.writeFileSync(logPath, header + body + "\n", "utf8");

  console.log(`\n${conflicts.length} conflicto(s). Log: ${logPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
