/**
 * Punto en un espacio 2D.
 */
export interface Point {
    x: number;
    y: number;
}

export interface Delta {
    x: number;
    y: number;
}

/**
 * Dimensiones de un elemento.
 */
export interface Size {
    width: number;
    height: number;
}

/**
 * Transformación aplicada a la imagen.
 *
 * Este es el ÚNICO estado persistente del visor.
 */
export interface Transform {
    scale: number;
    translateX: number;
    translateY: number;
}

/**
 * Información del viewport y de la imagen.
 */
export interface Viewport {

    image: ImageSize;

    viewport: ViewportSize;

}

/**
 * Modos de ajuste inicial.
 */
export type FitMode =
    | "contain"
    | "cover"
    | "original";


export interface FitOptions {
    mode: FitMode;

    /**
     * Permite ampliar imágenes pequeñas
     * durante el fit inicial.
     */
    allowUpscale: boolean;

    /**
     * Espacio interno entre la imagen
     * y los bordes del viewport.
     */
    padding: number;
}

/**
 * Límites permitidos para el zoom.
 */
export interface ScaleLimits {
    min: number;
    max: number;
}

/**
 * Estado temporal utilizado durante gestos.
 *
 * Nunca debe persistirse.
 */
export interface GestureState {
    dragging: boolean;

    lastPointer: Point | null;

    pinchDistance: number | null;

    pinchCenter: Point | null;
}

export interface ImageViewerState {
    viewport: Viewport;
    transform: Transform;
    fit: FitOptions;
    scaleLimits: ScaleLimits;
}

export interface Bounds {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
}

export interface ImageSize extends Size {}

export interface ViewportSize extends Size {}