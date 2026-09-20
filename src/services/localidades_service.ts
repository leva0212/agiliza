// ============================================================
// localidades_service.ts
// Fuente: Instituto Geográfico Nacional (IGN) — EPSG:8908
// 13,526 centros poblados de Costa Rica con coordenadas WGS84.
// Coordenadas convertidas de CRTM05 → WGS84 (lat/lng).
// ============================================================

import localidadesPuntarenas from "./localidades/provinces/puntarenas";
import localidadesSanJose from "./localidades/provinces/san-jose";
import localidadesLimon from "./localidades/provinces/limon";
import localidadesCartago from "./localidades/provinces/cartago";
import localidadesAlajuela from "./localidades/provinces/alajuela";
import localidadesGuanacaste from "./localidades/provinces/guanacaste";
import localidadesHeredia from "./localidades/provinces/heredia";
import { LOCALIDADES_PROVINCES } from "./localidades/provinces";

export interface Localidad {
  nombre: string
  tipo: string
  lat: number
  lng: number
}

export interface Coordenadas {
  lat: number
  lng: number
}

export type LocalidadesMap = Record<
  string, // provincia
  Record<
    string, // cantón
    Record<
      string, // distrito
      Localidad[]
    >
  >
>

export class LocalidadesService {

  // ── Lista de provincias ──────────────────────────────────
  static provinciasLista: string[] = [...LOCALIDADES_PROVINCES];

  // ── Mapa completo ─────────────────────────────────────────
  static localidadesMap: LocalidadesMap = {
    "PUNTARENAS": localidadesPuntarenas,
    "SAN JOSÉ": localidadesSanJose,
    "LIMÓN": localidadesLimon,
    "CARTAGO": localidadesCartago,
    "ALAJUELA": localidadesAlajuela,
    "GUANACASTE": localidadesGuanacaste,
    "HEREDIA": localidadesHeredia,
  };

  // ── Getters básicos ──────────────────────────────────────

  static getProvincias(): string[] {
    return this.provinciasLista
  }

  static getCantones(provincia: string): string[] {
    return Object.keys(this.localidadesMap[provincia] || {})
  }

  static getDistritos(provincia: string, canton: string): string[] {
    return Object.keys(this.localidadesMap[provincia]?.[canton] || {})
  }

  /**
   * Retorna todas las localidades de un distrito con sus coordenadas.
   */
  static getLocalidades(
    provincia: string,
    canton: string,
    distrito: string
  ): Localidad[] {
    return this.localidadesMap[provincia]?.[canton]?.[distrito] || []
  }

  /**
   * Solo los nombres (compatible con BarriosService.getBarrios).
   */
  static getNombres(
    provincia: string,
    canton: string,
    distrito: string
  ): string[] {
    return this.getLocalidades(provincia, canton, distrito).map((l) => l.nombre)
  }

  // ── Coordenadas ──────────────────────────────────────────

  /**
   * Coordenadas exactas de una localidad por nombre.
   * Busca en el distrito dado (case-insensitive).
   */
  static getCoordsLocalidad(
    provincia: string,
    canton: string,
    distrito: string,
    nombre: string
  ): Coordenadas | null {
    const localidades = this.getLocalidades(provincia, canton, distrito)
    const match = localidades.find(
      (l) => l.nombre.toLowerCase() === nombre.toLowerCase()
    )
    return match ? { lat: match.lat, lng: match.lng } : null
  }

  /**
   * Centroide del distrito (promedio de todas sus localidades).
   */
  static getCoordsDistrito(
    provincia: string,
    canton: string,
    distrito: string
  ): Coordenadas | null {
    const locs = this.getLocalidades(provincia, canton, distrito)
    if (locs.length === 0) return null
    const lat = locs.reduce((s, l) => s + l.lat, 0) / locs.length
    const lng = locs.reduce((s, l) => s + l.lng, 0) / locs.length
    return { lat: parseFloat(lat.toFixed(6)), lng: parseFloat(lng.toFixed(6)) }
  }

  /**
   * Centroide del cantón.
   */
  static getCoordsCanton(
    provincia: string,
    canton: string
  ): Coordenadas | null {
    const distritos = this.localidadesMap[provincia]?.[canton]
    if (!distritos) return null
    const locs = Object.values(distritos).flat()
    if (locs.length === 0) return null
    const lat = locs.reduce((s, l) => s + l.lat, 0) / locs.length
    const lng = locs.reduce((s, l) => s + l.lng, 0) / locs.length
    return { lat: parseFloat(lat.toFixed(6)), lng: parseFloat(lng.toFixed(6)) }
  }

  /**
   * Centroide de la provincia.
   */
  static getCoordsProvicia(provincia: string): Coordenadas | null {
    const cantones = this.localidadesMap[provincia]
    if (!cantones) return null
    const locs = Object.values(cantones).flatMap((d) => Object.values(d).flat())
    if (locs.length === 0) return null
    const lat = locs.reduce((s, l) => s + l.lat, 0) / locs.length
    const lng = locs.reduce((s, l) => s + l.lng, 0) / locs.length
    return { lat: parseFloat(lat.toFixed(6)), lng: parseFloat(lng.toFixed(6)) }
  }

  // ── Navegación ───────────────────────────────────────────

  /**
   * URL Google Maps para navegar a una localidad específica.
   * Si no se pasa nombre, navega al centroide del distrito.
   *   Linking.openURL(url)  // React Native / Expo
   */
  static getGoogleMapsUrl(
    provincia: string,
    canton: string,
    distrito: string,
    nombre?: string
  ): string | null {
    const c = nombre
      ? this.getCoordsLocalidad(provincia, canton, distrito, nombre)
      : this.getCoordsDistrito(provincia, canton, distrito)
    if (!c) return null
    return `https://www.google.com/maps/dir/?api=1&destination=${c.lat},${c.lng}`
  }

  /**
   * URL Waze para navegar a una localidad específica.
   * Si no se pasa nombre, navega al centroide del distrito.
   */
  static getWazeUrl(
    provincia: string,
    canton: string,
    distrito: string,
    nombre?: string
  ): string | null {
    const c = nombre
      ? this.getCoordsLocalidad(provincia, canton, distrito, nombre)
      : this.getCoordsDistrito(provincia, canton, distrito)
    if (!c) return null
    return `https://waze.com/ul?ll=${c.lat},${c.lng}&navigate=yes`
  }

  /**
   * Ambas URLs a la vez.
   */
  static getNavUrls(
    provincia: string,
    canton: string,
    distrito: string,
    nombre?: string
  ): { googleMaps: string; waze: string } | null {
    const c = nombre
      ? this.getCoordsLocalidad(provincia, canton, distrito, nombre)
      : this.getCoordsDistrito(provincia, canton, distrito)
    if (!c) return null
    return {
      googleMaps: `https://www.google.com/maps/dir/?api=1&destination=${c.lat},${c.lng}`,
      waze:       `https://waze.com/ul?ll=${c.lat},${c.lng}&navigate=yes`,
    }
  }
}