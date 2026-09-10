import {
    Point,
    Transform,
} from "../types/image-viewer.types";

/**
 * Aplica un Transform a un punto de imagen,
 * obteniendo su posición en pantalla.
 */
export function applyTransform(
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
 * Aplica la transformación inversa.
 */
export function applyInverseTransform(
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