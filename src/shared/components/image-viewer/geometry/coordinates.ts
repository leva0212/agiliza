import {
    Point,
    Transform,
} from "../types/image-viewer.types";

/**
 * Convierte un punto de pantalla
 * a coordenadas de la imagen.
 */
export function screenToImage(
    point: Point,
    transform: Transform,
): Point {
    return {
        x:
            (point.x - transform.translateX) /
            transform.scale,

        y:
            (point.y - transform.translateY) /
            transform.scale,
    };
}

/**
 * Convierte un punto de la imagen
 * a coordenadas de pantalla.
 */
export function imageToScreen(
    point: Point,
    transform: Transform,
): Point {
    return {
        x:
            point.x * transform.scale +
            transform.translateX,

        y:
            point.y * transform.scale +
            transform.translateY,
    };
}

/**
 * Aplica un desplazamiento a un punto.
 */
export function translatePoint(
    point: Point,
    delta: Point,
): Point {
    return {
        x: point.x + delta.x,
        y: point.y + delta.y,
    };
}

/**
 * Escala un punto respecto al origen.
 */
export function scalePoint(
    point: Point,
    scale: number,
): Point {
    return {
        x: point.x * scale,
        y: point.y * scale,
    };
}