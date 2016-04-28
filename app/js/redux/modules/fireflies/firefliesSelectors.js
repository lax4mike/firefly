import { createSelector } from "reselect";
import { asArray, mapObject, filterObject } from "../../../utils/object.js";


export const getFireflies = (state) => {

    const { firefliesById, positionsById } = state.fireflies;
    const neighborsById    = getNeighborsById(positionsById, state.signalRadius.radius);
    const isInTheLightById = getIsInTheLightById(positionsById, state.flashlight);

    // merge the firefliesById and positionsById
    const fireflies = Object.keys(firefliesById).map(id =>
        Object.assign({}, firefliesById[id], positionsById[id], {
            neightbors: neighborsById[id],
            isInTheLight: isInTheLightById[id]
        }));

    return asArray(fireflies);
};

/**
 * getNeighborsById[ffid] = [ids]
 */
export const getNeighborsById = createSelector(
    (positionsById, radius) => positionsById,
    (positionsById, radius) => radius,
    (positionsById, radius) => {

        // we only need the id, calculate the distance from firefly
        return mapObject(positionsById, firefly => {
            return asArray(positionsById)
                .map(f2 => {
                    return Object.assign({}, {
                        id: f2.id,
                        distance: getDistance(firefly, f2)
                    });
                })
                // only keep the fireflies that are close to firefly
                .filter(f3 => {
                    return (f3.id !== firefly.id) && (f3.distance < radius);
                });
        });
    }
);

export const getIsInTheLightById = createSelector(
    (positionsById, flashlight) => positionsById,
    (positionsById, flashlight) => flashlight,
    (positionsById, flashlight) => {

        // we only need the id, calculate the distance from firefly
        return mapObject(positionsById, (ff) => getIsInTheLight(ff, flashlight));
    }
);


export function getIsInTheLight(firefly, flashlight){
    // definitely not in the light if the flashlight isn't on...
    if (!flashlight.isShining) { return false; }

    let distance = getDistance(firefly, flashlight);
    return distance < flashlight.radius;
}


export function getDistance(f1, f2){
    const distY = Math.abs(f1.y - f2.y);
    const distX = Math.abs(f1.x - f2.x);
    return Math.sqrt(Math.pow(distX, 2) + Math.pow(distY, 2));
}
