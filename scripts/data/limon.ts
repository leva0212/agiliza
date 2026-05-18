import type { ProvinceImport } from "../import-routes-from-sheets";

// NOTA: La hoja de Limón lista barrios individuales dentro del distrito LIMÓN
// (Bananito Sur, Siglo 21, Cieneguita, etc.). El script opera a nivel de distrito,
// por lo que se consolida la ruta más representativa por distrito.
// Distritos con rutas mixtas (algunos barrios con cobertura, otros sin) se marcan
// con la ruta predominante; revisar manualmente si se requiere granularidad mayor.

export const limon: ProvinceImport = {
  provincia: "LIMÓN",
  rows: [
    // ── Limón (canton) ────────────────────────────────────────
    // Barrios del distrito LIMÓN: mezcla de 24-48HRS, Lunes-Jueves, Viernes, SIN COBERTURA
    // Se registran los 4 distritos del cantón Limón con su ruta agregada:
    { canton: "LIMÓN", distrito: "LIMÓN",            ruta: "24-48 HRS" },   // mayoría de barrios
    { canton: "LIMÓN", distrito: "VALLE LA ESTRELLA", ruta: "CRONOGRAMA" }, // VIERNES
    { canton: "LIMÓN", distrito: "MATAMA",            ruta: "CRONOGRAMA" }, // Lunes y Jueves
    { canton: "LIMÓN", distrito: "RÍO BLANCO",        ruta: "CRONOGRAMA" }, // Lunes - Jueves (Río Blanco / Matama)

    // ── Pococi ────────────────────────────────────────────────
    { canton: "POCOCI", distrito: "GUÁPILES",         ruta: "CRONOGRAMA" }, // Miercoles a sabado
    { canton: "POCOCI", distrito: "JIMÉNEZ",          ruta: "CRONOGRAMA" }, // Miercoles a sabado
    { canton: "POCOCI", distrito: "RITA",             ruta: "CRONOGRAMA" }, // Miercoles a sabado
    { canton: "POCOCI", distrito: "ROXANA",           ruta: "CRONOGRAMA" }, // Miercoles a sabado
    { canton: "POCOCI", distrito: "CARIARI",          ruta: "CRONOGRAMA" }, // Miercoles a sabado
    { canton: "POCOCI", distrito: "COLORADO",         ruta: "SIN COBERTURA" },
    { canton: "POCOCI", distrito: "LA COLONIA",       ruta: "CRONOGRAMA" }, // Miercoles a sabado

    // ── Siquirres ─────────────────────────────────────────────
    { canton: "SIQUIRRES", distrito: "SIQUIRRES",     ruta: "CRONOGRAMA" }, // MARTES
    { canton: "SIQUIRRES", distrito: "PACUARITO",     ruta: "CRONOGRAMA" },
    { canton: "SIQUIRRES", distrito: "FLORIDA",       ruta: "CRONOGRAMA" },
    { canton: "SIQUIRRES", distrito: "GERMANIA",      ruta: "CRONOGRAMA" },
    { canton: "SIQUIRRES", distrito: "EL CAIRO",      ruta: "CRONOGRAMA" },
    { canton: "SIQUIRRES", distrito: "ALEGRÍA",       ruta: "CRONOGRAMA" },
    { canton: "SIQUIRRES", distrito: "REVENTAZÓN",    ruta: "CRONOGRAMA" },

    // ── Talamanca ─────────────────────────────────────────────
    { canton: "TALAMANCA", distrito: "BRATSI",        ruta: "SIN COBERTURA" },
    { canton: "TALAMANCA", distrito: "SIXAOLA",       ruta: "CRONOGRAMA" }, // Viernes
    { canton: "TALAMANCA", distrito: "CAHUITA",       ruta: "CRONOGRAMA" }, // Viernes
    { canton: "TALAMANCA", distrito: "TELIRE",        ruta: "SIN COBERTURA" },

    // ── Matina ────────────────────────────────────────────────
    { canton: "MATINA", distrito: "MATINA",           ruta: "CRONOGRAMA" }, // Lunes y Jueves
    { canton: "MATINA", distrito: "BATÁN",            ruta: "CRONOGRAMA" },
    { canton: "MATINA", distrito: "CARRANDI",         ruta: "CRONOGRAMA" },

    // ── Guácimo ───────────────────────────────────────────────
    { canton: "GUÁCIMO", distrito: "GUÁCIMO",         ruta: "CRONOGRAMA" }, // Miercoles a sabado
    { canton: "GUÁCIMO", distrito: "MERCEDES",        ruta: "CRONOGRAMA" },
    { canton: "GUÁCIMO", distrito: "POCORA",          ruta: "CRONOGRAMA" }, // martes
    { canton: "GUÁCIMO", distrito: "RÍO JIMÉNEZ",     ruta: "CRONOGRAMA" }, // Miercoles a sabado
    { canton: "GUÁCIMO", distrito: "DUACARÍ",         ruta: "CRONOGRAMA" },
  ],
};
