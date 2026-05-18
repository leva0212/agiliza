import type { ProvinceImport } from "../import-routes-from-sheets";

export const alajuela: ProvinceImport = {
  provincia: "ALAJUELA",
  rows: [
    // ── Alajuela ──────────────────────────────────────────────
    { canton: "ALAJUELA", distrito: "SAN JOSÉ",          ruta: "Maximo 24HRS" },
    { canton: "ALAJUELA", distrito: "CARRIZAL",          ruta: "Maximo 24HRS" },
    { canton: "ALAJUELA", distrito: "SAN ANTONIO",       ruta: "Maximo 24HRS" },
    { canton: "ALAJUELA", distrito: "GUÁCIMA",           ruta: "Maximo 24HRS" },
    { canton: "ALAJUELA", distrito: "SAN ISIDRO",        ruta: "Maximo 24HRS" },
    { canton: "ALAJUELA", distrito: "SAN RAFAEL",        ruta: "Maximo 24HRS" },
    { canton: "ALAJUELA", distrito: "TURRÚCARES",        ruta: "SABADO" },
    { canton: "ALAJUELA", distrito: "DESAMPARADOS",      ruta: "Maximo 24HRS" },
    { canton: "ALAJUELA", distrito: "SABANILLA",         ruta: "SABADO" },
    { canton: "ALAJUELA", distrito: "RÍO SEGUNDO",       ruta: "Maximo 24HRS" },
    { canton: "ALAJUELA", distrito: "GUÁTUSO",           ruta: "Maximo 24HRS" },   // Guatusa
    { canton: "ALAJUELA", distrito: "TAMBOR",            ruta: "48 A 72HRS" },
    { canton: "ALAJUELA", distrito: "LA GARITA",         ruta: "Maximo 24HRS" },   // La Garita → GARITA in service
    { canton: "ALAJUELA", distrito: "SARAPIQUÍ",         ruta: "SIN COBERTURA" },
    // Dulce Nombre / Fraijanes / Poasito — sub-barrios of Poás canton, not Alajuela
    // (sheet rows 13-15 map to Alajuela canton; keeping as written)
    //{ canton: "ALAJUELA", distrito: "DESAMPARADOS",      ruta: "Maximo 24HRS" },

    // ── San Ramón ─────────────────────────────────────────────
    { canton: "SAN RAMÓN", distrito: "SAN RAMÓN",        ruta: "24 A 72 HRS" },
    { canton: "SAN RAMÓN", distrito: "SANTIAGO",         ruta: "24 A 72 HRS" },
    { canton: "SAN RAMÓN", distrito: "SAN JUAN",         ruta: "24 A 72 HRS" },
    { canton: "SAN RAMÓN", distrito: "PIEDADES NORTE",   ruta: "24 A 72 HRS" },
    { canton: "SAN RAMÓN", distrito: "PIEDADES SUR",     ruta: "24 A 72 HRS" },
    { canton: "SAN RAMÓN", distrito: "SAN RAFAEL",       ruta: "24 A 72 HRS" },
    { canton: "SAN RAMÓN", distrito: "SAN ISIDRO",       ruta: "24 A 72 HRS" },
    { canton: "SAN RAMÓN", distrito: "ÁNGELES",          ruta: "24 A 72 HRS" },
    { canton: "SAN RAMÓN", distrito: "ALFARO",           ruta: "24 A 72 HRS" },
    { canton: "SAN RAMÓN", distrito: "VOLIO",            ruta: "24 A 72 HRS" },
    { canton: "SAN RAMÓN", distrito: "CONCEPCIÓN",       ruta: "24 A 72 HRS" },
    { canton: "SAN RAMÓN", distrito: "ZAPOTAL",          ruta: "24 A 72 HRS" },
    { canton: "SAN RAMÓN", distrito: "PEÑAS BLANCAS",    ruta: "24 A 72 HRS" },
    { canton: "SAN RAMÓN", distrito: "SAN LORENZO",      ruta: "24 A 72 HRS" },

    // ── Grecia ────────────────────────────────────────────────
    { canton: "GRECIA", distrito: "GRECIA",              ruta: "24 A 72 HRS" },
    { canton: "GRECIA", distrito: "SAN ISIDRO",          ruta: "24 A 72 HRS" },
    { canton: "GRECIA", distrito: "SAN JOSÉ",            ruta: "24 A 72 HRS" },
    { canton: "GRECIA", distrito: "SAN ROQUE",           ruta: "24 A 72 HRS" },
    { canton: "GRECIA", distrito: "TACARES",             ruta: "24 A 72 HRS" },
    { canton: "GRECIA", distrito: "PUENTE DE PIEDRA",    ruta: "24 A 72 HRS" },
    { canton: "GRECIA", distrito: "BOLÍVAR",             ruta: "24 A 72 HRS" },

    // ── San Mateo ─────────────────────────────────────────────
    { canton: "SAN MATEO", distrito: "SAN MATEO",        ruta: "SIN COBERTURA" },
    { canton: "SAN MATEO", distrito: "DESMONTE",         ruta: "SIN COBERTURA" },
    { canton: "SAN MATEO", distrito: "JESÚS MARÍA",      ruta: "SIN COBERTURA" },
    { canton: "SAN MATEO", distrito: "LABRADOR",         ruta: "SIN COBERTURA" },

    // ── Atenas ────────────────────────────────────────────────
    { canton: "ATENAS", distrito: "ATENAS",              ruta: "SIN COBERTURA" },
    { canton: "ATENAS", distrito: "JESÚS",               ruta: "SIN COBERTURA" },
    { canton: "ATENAS", distrito: "MERCEDES",            ruta: "SIN COBERTURA" },
    { canton: "ATENAS", distrito: "SAN ISIDRO",          ruta: "SIN COBERTURA" },
    { canton: "ATENAS", distrito: "CONCEPCIÓN",          ruta: "SIN COBERTURA" },
    { canton: "ATENAS", distrito: "SAN JOSÉ",            ruta: "SIN COBERTURA" },
    { canton: "ATENAS", distrito: "SANTA EULALIA",       ruta: "SIN COBERTURA" },
    { canton: "ATENAS", distrito: "ESCOBAL",             ruta: "SIN COBERTURA" },

    // ── Naranjo ───────────────────────────────────────────────
    { canton: "NARANJO", distrito: "NARANJO",            ruta: "24 A 72 HRS" },
    { canton: "NARANJO", distrito: "SAN MIGUEL",         ruta: "24 A 72 HRS" },
    { canton: "NARANJO", distrito: "SAN JOSÉ",           ruta: "24 A 72 HRS" },
    { canton: "NARANJO", distrito: "CIRRÍ SUR",          ruta: "24 A 72 HRS" },
    { canton: "NARANJO", distrito: "SAN JERÓNIMO",       ruta: "24 A 72 HRS" },
    { canton: "NARANJO", distrito: "SAN JUAN",           ruta: "24 A 72 HRS" },
    { canton: "NARANJO", distrito: "EL ROSARIO",         ruta: "24 A 72 HRS" },
    { canton: "NARANJO", distrito: "PALMITOS",           ruta: "24 A 72 HRS" },

    // ── Palmares ──────────────────────────────────────────────
    { canton: "PALMARES", distrito: "PALMARES",          ruta: "24 A 72 HRS" },
    { canton: "PALMARES", distrito: "ZARAGOZA",          ruta: "24 A 72 HRS" },
    { canton: "PALMARES", distrito: "BUENOS AIRES",      ruta: "24 A 72 HRS" },
    { canton: "PALMARES", distrito: "SANTIAGO",          ruta: "24 A 72 HRS" },
    { canton: "PALMARES", distrito: "CANDELARIA",        ruta: "24 A 72 HRS" },
    { canton: "PALMARES", distrito: "ESQUIPULAS",        ruta: "24 A 72 HRS" },
    { canton: "PALMARES", distrito: "LA GRANJA",         ruta: "24 A 72 HRS" },

    // ── Poás ──────────────────────────────────────────────────
    { canton: "POÁS", distrito: "SAN PEDRO",             ruta: "SABADO" },
    { canton: "POÁS", distrito: "SAN JUAN",              ruta: "SABADO" },
    { canton: "POÁS", distrito: "SAN RAFAEL",            ruta: "SABADO" },
    { canton: "POÁS", distrito: "CARRILLOS",             ruta: "SIN COBERTURA" },
    { canton: "POÁS", distrito: "SABANA REDONDA",        ruta: "SABADO" },

    // ── Orotina ───────────────────────────────────────────────
    { canton: "OROTINA", distrito: "OROTINA",            ruta: "SIN COBERTURA" },
    { canton: "OROTINA", distrito: "EL MASTATE",         ruta: "SIN COBERTURA" },
    { canton: "OROTINA", distrito: "HACIENDA VIEJA",     ruta: "SIN COBERTURA" },
    { canton: "OROTINA", distrito: "COYOLAR",            ruta: "SIN COBERTURA" },
    { canton: "OROTINA", distrito: "LA CEIBA",           ruta: "SIN COBERTURA" },

    // ── San Carlos ────────────────────────────────────────────
    { canton: "SAN CARLOS", distrito: "QUESADA",         ruta: "24 A 72 HRS" },
    { canton: "SAN CARLOS", distrito: "FLORENCIA",       ruta: "24 A 72 HRS" },
    { canton: "SAN CARLOS", distrito: "BUENAVISTA",      ruta: "SIN COBERTURA" },
    { canton: "SAN CARLOS", distrito: "AGUAS ZARCAS",    ruta: "24 A 72 HRS" },
    { canton: "SAN CARLOS", distrito: "VENECIA",         ruta: "24 A 72 HRS" },
    { canton: "SAN CARLOS", distrito: "PITAL",           ruta: "24 A 72 HRS" },
    { canton: "SAN CARLOS", distrito: "LA FORTUNA",      ruta: "24 A 72 HRS" },
    { canton: "SAN CARLOS", distrito: "LA TIGRA",        ruta: "24 A 72 HRS" },
    { canton: "SAN CARLOS", distrito: "LA PALMERA",      ruta: "24 A 72 HRS" },
    { canton: "SAN CARLOS", distrito: "VENADO",          ruta: "SIN COBERTURA" },
    { canton: "SAN CARLOS", distrito: "CUTRIS",          ruta: "24 A 72 HRS" },
    { canton: "SAN CARLOS", distrito: "MONTERREY",       ruta: "SIN COBERTURA" },
    { canton: "SAN CARLOS", distrito: "POCOSOL",         ruta: "24 A 72 HRS" },

    // ── Zarcero ───────────────────────────────────────────────
    { canton: "ZARCERO", distrito: "ZARCERO",            ruta: "SIN COBERTURA" },
    { canton: "ZARCERO", distrito: "LAGUNA",             ruta: "SIN COBERTURA" },
    { canton: "ZARCERO", distrito: "TAPESCO",            ruta: "SIN COBERTURA" },
    { canton: "ZARCERO", distrito: "GUADALUPE",          ruta: "SIN COBERTURA" },
    { canton: "ZARCERO", distrito: "PALMIRA",            ruta: "SIN COBERTURA" },
    { canton: "ZARCERO", distrito: "ZAPOTE",             ruta: "SIN COBERTURA" },
    { canton: "ZARCERO", distrito: "BRISAS",             ruta: "SIN COBERTURA" },

    // ── Sarchí ────────────────────────────────────────────────
    { canton: "SARCHÍ", distrito: "SARCHÍ NORTE",        ruta: "24 A 72 HRS" },
    { canton: "SARCHÍ", distrito: "SARCHÍ SUR",          ruta: "24 A 72 HRS" },
    { canton: "SARCHÍ", distrito: "TORO AMARILLO",       ruta: "24 A 72 HRS" },
    { canton: "SARCHÍ", distrito: "SAN PEDRO",           ruta: "24 A 72 HRS" },
    { canton: "SARCHÍ", distrito: "RODRÍGUEZ",           ruta: "SIN COBERTURA" }, // TEMPORALMENTE FUERA DE COBERTURA

    // ── Upala ─────────────────────────────────────────────────
    { canton: "UPALA", distrito: "UPALA",                ruta: "24 A 72 HRS" },
    { canton: "UPALA", distrito: "AGUAS CLARAS",         ruta: "SIN COBERTURA" },
    { canton: "UPALA", distrito: "SAN JOSÉ O PIZOTE",    ruta: "24 A 72 HRS" },
    { canton: "UPALA", distrito: "BIJAGUA",              ruta: "SIN COBERTURA" },
    { canton: "UPALA", distrito: "DELICIAS",             ruta: "24 A 72 HRS" },
    { canton: "UPALA", distrito: "DOS RÍOS",             ruta: "SIN COBERTURA" },
    { canton: "UPALA", distrito: "YOLILLAL",             ruta: "24 A 72 HRS" },
    { canton: "UPALA", distrito: "CANALETE",             ruta: "24 A 72 HRS" },

    // ── Los Chiles ────────────────────────────────────────────
    { canton: "LOS CHILES", distrito: "LOS CHILES",      ruta: "SIN COBERTURA" },
    { canton: "LOS CHILES", distrito: "CAÑO NEGRO",      ruta: "SIN COBERTURA" },
    { canton: "LOS CHILES", distrito: "EL AMPARO",       ruta: "SIN COBERTURA" },
    { canton: "LOS CHILES", distrito: "SAN JORGE",       ruta: "SIN COBERTURA" },

    // ── Guatuso ───────────────────────────────────────────────
    { canton: "GUATUSO", distrito: "SAN RAFAEL",         ruta: "SIN COBERTURA" },
    { canton: "GUATUSO", distrito: "BUENAVISTA",         ruta: "SIN COBERTURA" },
    { canton: "GUATUSO", distrito: "COTE",               ruta: "SIN COBERTURA" },
    { canton: "GUATUSO", distrito: "KATIRA",             ruta: "SIN COBERTURA" },

    // ── Río Cuarto ────────────────────────────────────────────
    { canton: "RÍO CUARTO", distrito: "RÍO CUARTO",      ruta: "24 A 72 HRS" },
    { canton: "RÍO CUARTO", distrito: "SANTA RITA",      ruta: "24 A 72 HRS" },
    { canton: "RÍO CUARTO", distrito: "SANTA ISABEL",    ruta: "24 A 72 HRS" },
  ],
};
