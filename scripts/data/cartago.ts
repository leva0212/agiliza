import type { ProvinceImport } from "../import-routes-from-sheets";

export const cartago: ProvinceImport = {
  provincia: "CARTAGO",
  rows: [
    // ── Cartago ───────────────────────────────────────────────
    { canton: "CARTAGO", distrito: "ORIENTAL",                   ruta: "Maximo 24HRS" },
    { canton: "CARTAGO", distrito: "OCCIDENTAL",                 ruta: "Maximo 24HRS" },
    { canton: "CARTAGO", distrito: "CARMEN",                     ruta: "Maximo 24HRS" },
    { canton: "CARTAGO", distrito: "SAN NICOLÁS",                ruta: "Maximo 24HRS" },
    { canton: "CARTAGO", distrito: "AGUACALIENTE O SAN FRANCISCO", ruta: "Maximo 24HRS" },
    { canton: "CARTAGO", distrito: "GUADALUPE O ARENILLA",       ruta: "Maximo 24HRS" },
    { canton: "CARTAGO", distrito: "CORRALILLO",                 ruta: "SIN COBERTURA" },
    { canton: "CARTAGO", distrito: "TIERRA BLANCA",              ruta: "SIN COBERTURA" },
    { canton: "CARTAGO", distrito: "DULCE NOMBRE",               ruta: "Maximo 24HRS" },
    { canton: "CARTAGO", distrito: "LLANO GRANDE",               ruta: "Maximo 24HRS" },
    { canton: "CARTAGO", distrito: "QUEBRADILLA",                ruta: "Maximo 24HRS" },

    // ── Paraíso ───────────────────────────────────────────────
    { canton: "PARAÍSO", distrito: "PARAÍSO",                    ruta: "Maximo 24 A 48 HRS" },
    { canton: "PARAÍSO", distrito: "SANTIAGO",                   ruta: "Maximo 24 A 48 HRS" },
    { canton: "PARAÍSO", distrito: "OROSI",                      ruta: "CRONOGRAMA" },       // VIERNES
    { canton: "PARAÍSO", distrito: "CACHÍ",                      ruta: "Maximo 24 A 48 HRS" },
    { canton: "PARAÍSO", distrito: "LLANOS DE SANTA LUCÍA",      ruta: "Maximo 24 A 48 HRS" },

    // ── La Unión ──────────────────────────────────────────────
    { canton: "LA UNIÓN", distrito: "TRES RÍOS",                 ruta: "CRONOGRAMA" },       // LUNES A VIERNES
    { canton: "LA UNIÓN", distrito: "SAN DIEGO",                 ruta: "CRONOGRAMA" },
    { canton: "LA UNIÓN", distrito: "SAN JUAN",                  ruta: "CRONOGRAMA" },
    { canton: "LA UNIÓN", distrito: "SAN RAFAEL",                ruta: "CRONOGRAMA" },
    { canton: "LA UNIÓN", distrito: "CONCEPCIÓN",                ruta: "CRONOGRAMA" },
    { canton: "LA UNIÓN", distrito: "DULCE NOMBRE",              ruta: "CRONOGRAMA" },
    { canton: "LA UNIÓN", distrito: "SAN RAMÓN",                 ruta: "CRONOGRAMA" },
    { canton: "LA UNIÓN", distrito: "RÍO AZUL",                  ruta: "SIN COBERTURA" },

    // ── Jiménez ───────────────────────────────────────────────
    { canton: "JIMÉNEZ", distrito: "JUAN VIÑAS",                 ruta: "24 A 72 HRS" },
    { canton: "JIMÉNEZ", distrito: "TUCURRIQUE",                 ruta: "SIN COBERTURA" },
    { canton: "JIMÉNEZ", distrito: "PEJIVALLE",                  ruta: "24 A 72 HRS" },
    { canton: "JIMÉNEZ", distrito: "LA VICTORIA",                ruta: "24 a 48 hrs" },

    // ── Turrialba ─────────────────────────────────────────────
    { canton: "TURRIALBA", distrito: "TURRIALBA",                ruta: "24 A 72 HRS" },
    { canton: "TURRIALBA", distrito: "LA SUIZA",                 ruta: "24 A 72 HRS" },
    { canton: "TURRIALBA", distrito: "PERALTA",                  ruta: "24 A 72 HRS" },
    { canton: "TURRIALBA", distrito: "SANTA CRUZ",               ruta: "24 A 72 HRS" },
    { canton: "TURRIALBA", distrito: "SANTA TERESITA",           ruta: "24 A 72 HRS" },
    { canton: "TURRIALBA", distrito: "PAVONES",                  ruta: "24 A 72 HRS" },
    { canton: "TURRIALBA", distrito: "TUIS",                     ruta: "24 A 72 HRS" },
    { canton: "TURRIALBA", distrito: "TAYUTIC",                  ruta: "SIN COBERTURA" },
    { canton: "TURRIALBA", distrito: "SANTA ROSA",               ruta: "24 A 72 HRS" },
    { canton: "TURRIALBA", distrito: "TRES EQUIS",               ruta: "24 A 72 HRS" },
    { canton: "TURRIALBA", distrito: "LA ISABEL",                ruta: "24 A 72 HRS" },
    { canton: "TURRIALBA", distrito: "CHIRRIPÓ",                 ruta: "SIN COBERTURA" },

    // ── Alvarado ──────────────────────────────────────────────
    { canton: "ALVARADO", distrito: "PACAYAS",                   ruta: "CRONOGRAMA" },       // VIERNES
    { canton: "ALVARADO", distrito: "CERVANTES",                 ruta: "CRONOGRAMA" },       // JUEVES
    { canton: "ALVARADO", distrito: "CAPELLADES",                ruta: "SIN COBERTURA" },

    // ── Oreamuno ──────────────────────────────────────────────
    { canton: "OREAMUNO", distrito: "SAN RAFAEL",                ruta: "Maximo 24HRS" },
    { canton: "OREAMUNO", distrito: "COT",                       ruta: "CRONOGRAMA" },       // MIERCOLES
    { canton: "OREAMUNO", distrito: "POTRERO CERRADO",           ruta: "SIN COBERTURA" },
    { canton: "OREAMUNO", distrito: "CIPRESES",                  ruta: "CRONOGRAMA" },       // MIERCOLES
    { canton: "OREAMUNO", distrito: "SANTA ROSA",                ruta: "SIN COBERTURA" },

    // ── El Guarco ─────────────────────────────────────────────
    { canton: "EL GUARCO", distrito: "EL TEJAR",                 ruta: "Maximo 24HRS" },
    { canton: "EL GUARCO", distrito: "SAN ISIDRO",               ruta: "SIN COBERTURA" },
    { canton: "EL GUARCO", distrito: "TOBOSI",                   ruta: "Maximo 24HRS" },
    { canton: "EL GUARCO", distrito: "PATIO DE AGUA",            ruta: "SIN COBERTURA" },
  ],
};
