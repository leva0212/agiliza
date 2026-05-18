// Extraído de las 3 capturas en public/images/tmp/Guanacaste
// Hoja con 3 columnas: Cantón / Distrito / RUTA
// Valores RUTA observados: "24 a 72 HRS" o "SIN COBERTURA"
//
// NOTA: Las filas con observación al final son las que durante la lectura
// se vieron sospechosas (posibles errores del documento). El script las
// va a intentar igual y loguear si no calzan contra localidades_service.

import type { ProvinceImport } from "../import-routes-from-sheets";

export const guanacaste: ProvinceImport = {
  provincia: "Guanacaste",
  rows: [
    // ─── LIBERIA ─────────────────────────────────────────────
    { canton: "Liberia", distrito: "Liberia",       ruta: "24 a 72 HRS"   },
    { canton: "Liberia", distrito: "Cañas Dulces",  ruta: "SIN COBERTURA" },
    { canton: "Liberia", distrito: "Mayorga",       ruta: "SIN COBERTURA" },
    { canton: "Liberia", distrito: "Nacascolo",     ruta: "24 a 72 HRS"   },
    { canton: "Liberia", distrito: "Curubandé",     ruta: "24 a 72 HRS"   },

    // ─── NICOYA ──────────────────────────────────────────────
    { canton: "Nicoya",  distrito: "Nicoya",            ruta: "24 a 72 HRS"   },
    { canton: "Nicoya",  distrito: "Mansión",           ruta: "SIN COBERTURA" },
    { canton: "Nicoya",  distrito: "San Antonio",       ruta: "SIN COBERTURA" },
    { canton: "Nicoya",  distrito: "Quebrada Honda",    ruta: "SIN COBERTURA" },
    { canton: "Nicoya",  distrito: "Sámara",            ruta: "24 a 72 HRS"   },
    { canton: "Nicoya",  distrito: "Nosara",            ruta: "24 a 72 HRS"   },
    { canton: "Nicoya",  distrito: "Belén de Nosarita", ruta: "SIN COBERTURA" },
    // Posibles barrios del distrito Nicoya listados como distritos en el doc
    { canton: "Nicoya",  distrito: "Moracia",           ruta: "24 a 72 HRS"   },
    { canton: "Nicoya",  distrito: "Corralillo",        ruta: "24 a 72 HRS"   },
    { canton: "Nicoya",  distrito: "San Vicente",       ruta: "24 a 72 HRS"   },
    { canton: "Nicoya",  distrito: "Santa Barbara",     ruta: "24 a 72 HRS"   },

    // ─── SANTA CRUZ ──────────────────────────────────────────
    { canton: "Santa Cruz", distrito: "Santa Cruz",           ruta: "24 a 72 HRS"   },
    { canton: "Santa Cruz", distrito: "Bolsón",               ruta: "24 a 72 HRS"   },
    { canton: "Santa Cruz", distrito: "Veintisiete de Abril", ruta: "24 a 72 HRS"   },
    { canton: "Santa Cruz", distrito: "Tempate",              ruta: "24 a 72 HRS"   },
    { canton: "Santa Cruz", distrito: "Cartagena",            ruta: "24 a 72 HRS"   },
    { canton: "Santa Cruz", distrito: "Cuajiniquil",          ruta: "SIN COBERTURA" },
    { canton: "Santa Cruz", distrito: "Diriá",                ruta: "24 a 72 HRS"   },
    { canton: "Santa Cruz", distrito: "Cabo Velas",           ruta: "24 a 72 HRS"   },
    { canton: "Santa Cruz", distrito: "Tamarindo",            ruta: "24 a 72 HRS"   },

    // ─── BAGACES ─────────────────────────────────────────────
    { canton: "Bagaces", distrito: "Bagaces",     ruta: "24 a 72 HRS"   },
    { canton: "Bagaces", distrito: "La Fortuna",  ruta: "24 a 72 HRS"   },
    { canton: "Bagaces", distrito: "Mogote",      ruta: "SIN COBERTURA" },
    { canton: "Bagaces", distrito: "Río Naranjo", ruta: "SIN COBERTURA" },

    // ─── CARRILLO ────────────────────────────────────────────
    { canton: "Carrillo", distrito: "Filadelfia", ruta: "24 a 72 HRS"   },
    { canton: "Carrillo", distrito: "Palmira",    ruta: "SIN COBERTURA" },
    { canton: "Carrillo", distrito: "Sardinal",   ruta: "24 a 72 HRS"   },
    { canton: "Carrillo", distrito: "Belén",      ruta: "24 a 72 HRS"   },

    // ─── CAÑAS ───────────────────────────────────────────────
    { canton: "Cañas", distrito: "Cañas",       ruta: "24 a 72 HRS"   },
    { canton: "Cañas", distrito: "Palmira",     ruta: "SIN COBERTURA" },
    { canton: "Cañas", distrito: "San Miguel",  ruta: "SIN COBERTURA" },
    { canton: "Cañas", distrito: "Bebedero",    ruta: "24 a 72 HRS"   },
    { canton: "Cañas", distrito: "Porozal",     ruta: "SIN COBERTURA" },

    // ─── ABANGARES ───────────────────────────────────────────
    { canton: "Abangares", distrito: "Las Juntas", ruta: "24 a 72 HRS"   },
    { canton: "Abangares", distrito: "Sierra",     ruta: "SIN COBERTURA" },
    { canton: "Abangares", distrito: "San Juan",   ruta: "24 a 72 HRS"   },
    { canton: "Abangares", distrito: "Colorado",   ruta: "SIN COBERTURA" },

    // ─── TILARÁN ─────────────────────────────────────────────
    // "Tilarán Centro" del doc probablemente es solo "Tilarán" en localidades
    { canton: "Tilarán", distrito: "Tilarán Centro",  ruta: "24 a 72 HRS"   },
    { canton: "Tilarán", distrito: "Chopo",           ruta: "SIN COBERTURA" },
    { canton: "Tilarán", distrito: "Los angeles",     ruta: "SIN COBERTURA" },
    { canton: "Tilarán", distrito: "Quebrada Grande", ruta: "SIN COBERTURA" },
    { canton: "Tilarán", distrito: "Tronadora",       ruta: "SIN COBERTURA" },
    { canton: "Tilarán", distrito: "Santa Rosa",      ruta: "SIN COBERTURA" },
    { canton: "Tilarán", distrito: "Líbano",          ruta: "SIN COBERTURA" },
    { canton: "Tilarán", distrito: "Tierras Morenas", ruta: "SIN COBERTURA" },
    { canton: "Tilarán", distrito: "Arenal",          ruta: "SIN COBERTURA" },
    { canton: "Tilarán", distrito: "Cabeceras",       ruta: "SIN COBERTURA" },

    // ─── NANDAYURE ───────────────────────────────────────────
    // "Centro" del doc probablemente es un error (Carmona es la cabecera)
    { canton: "Nandayure", distrito: "Centro",     ruta: "SIN COBERTURA" },
    { canton: "Nandayure", distrito: "Carmona",    ruta: "SIN COBERTURA" },
    { canton: "Nandayure", distrito: "Santa Rita", ruta: "SIN COBERTURA" },
    { canton: "Nandayure", distrito: "Zapotal",    ruta: "SIN COBERTURA" },
    { canton: "Nandayure", distrito: "San Pablo",  ruta: "SIN COBERTURA" },
    { canton: "Nandayure", distrito: "Porvenir",   ruta: "SIN COBERTURA" },
    { canton: "Nandayure", distrito: "Bejuco",     ruta: "SIN COBERTURA" },

    // ─── LA CRUZ ─────────────────────────────────────────────
    { canton: "La Cruz", distrito: "La Cruz",       ruta: "SIN COBERTURA" },
    { canton: "La Cruz", distrito: "Santa Cecilia", ruta: "SIN COBERTURA" },
    { canton: "La Cruz", distrito: "La Garita",     ruta: "SIN COBERTURA" },
    { canton: "La Cruz", distrito: "Santa Elena",   ruta: "SIN COBERTURA" },

    // ─── HOJANCHA ────────────────────────────────────────────
    { canton: "Hojancha", distrito: "Hojancha",        ruta: "SIN COBERTURA" },
    { canton: "Hojancha", distrito: "Monte Romo",      ruta: "SIN COBERTURA" },
    { canton: "Hojancha", distrito: "Puerto Carrillo", ruta: "SIN COBERTURA" },
    { canton: "Hojancha", distrito: "Huacas",          ruta: "SIN COBERTURA" },
    { canton: "Hojancha", distrito: "Matambú",         ruta: "SIN COBERTURA" },
  ],
};
