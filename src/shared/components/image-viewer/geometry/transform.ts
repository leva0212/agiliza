import {
    Delta,
    Point,
    Transform,
} from "../types/image-viewer.types";

/**
 * Crea un Transform identidad.
 */
export function createTransform(): Transform {
    return {
        scale: 1,
        translateX: 0,
        translateY: 0,
    };
}

/**
 * Crea un Transform con valores específicos.
 */
export function createTransformValues(
    scale: number,
    translateX: number,
    translateY: number,
): Transform {
    return {
        scale,
        translateX,
        translateY,
    };
}

/**
 * Cambia únicamente la escala.
 */
export function setScale(
    transform: Transform,
    scale: number,
): Transform {
    return {
        ...transform,
        scale,
    };
}

/**
 * Cambia únicamente la traslación.
 */
export function setTranslation(
    transform: Transform,
    point: Point,
): Transform {
    return {
        ...transform,
        translateX: point.x,
        translateY: point.y,
    };
}

/**
 * Desplaza un Transform utilizando un Delta.
 */
export function translateTransform(
    transform: Transform,
    delta: Delta,
): Transform {
    return {
        ...transform,
        translateX: transform.translateX + delta.x,
        translateY: transform.translateY + delta.y,
    };
}

/**
 * Compara dos Transform.
 */
export function equalsTransform(
    a: Transform,
    b: Transform,
): boolean {
    return (
        a.scale === b.scale &&
        a.translateX === b.translateX &&
        a.translateY === b.translateY
    );
}