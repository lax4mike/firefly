import { createSelector } from "reselect";
import d3 from "d3-quadtree";
import { asArray, mapObject, filterObject } from "../../../utils/object.js";

/**
 * get the fireflies as an array and include the neightbors and isInTheLight
 */
export const getFireflies = (state) => {

    const { firefliesById, positionsById } = state.fireflies;
    const neighborsById   = getNeighborsById(positionsById, state.signalRadius.radius);
    const isInTheLightIds = getIsInTheLightIds(positionsById, state.flashlight);


    // merge the firefliesById and positionsById
    const fireflies = Object.keys(firefliesById).map(id =>
        Object.assign({}, firefliesById[id], positionsById[id], {
            neightbors: neighborsById[id],
            isInTheLight: isInTheLightIds.includes(id)
        })
    );

    return fireflies;
};

// create a quadtree with the current firefly positions
// http://www.mikechambers.com/blog/2011/03/21/javascript-quadtree-implementation/
export const makeQuadtree = createSelector(
    (positionsById) => positionsById,
    (positionsById) => {

        const quadtree = d3.quadtree()
            .x(d => d.x)
            .y(d => d.y)
            .addAll(asArray(positionsById));

        return quadtree;
    }
);

/**
 * getNeighborsById[ffid] = [ids]
 */
export const getNeighborsById = createSelector(
    (positionsById, radius) => positionsById,
    (positionsById, radius) => radius,
    (positionsById, radius) => {

        // TODO? use the quadtree

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

export const getIsInTheLightIds = createSelector(
    (positionsById, flashlight) => positionsById,
    (positionsById, flashlight) => flashlight,
    (positionsById, flashlight) => {

        const quadtree = makeQuadtree(positionsById);

        const checkThese = [];
        quadtree.visit((node, x0, y0, x1, y1) => {

            // if this is a leaf, add it.
            if (!node.length){ checkThese.push(node); }

            // http://www.migapro.com/circle-and-rotated-rectangle-collision-detection/
            // find the point in the rectangle that is closet
            // to the flashlight center
            const x = flashlight.x < x0 ? x0
                    : flashlight.x > x1 ? x1
                    : flashlight.x;
            const y = flashlight.y < y0 ? y0
                    : flashlight.y > y1 ? y1
                    : flashlight.y;

            // the distance between the flashlight center and the
            // closest point on the rectangle
            const distance = getDistance(flashlight, {x, y});

            // return true is we should NOT continue down this quadtree node
            return distance > flashlight.radius;
        });

        // out of these, check to see which are actually in the light
        // return array of id strings
        return checkThese
            .filter(node => getIsInTheLight(node.data, flashlight))
            .map(node => node.data.id);
    }
);


export function getIsInTheLight(firefly, flashlight){
    // definitely not in the light if the flashlight isn't on...
    if (!flashlight.isShining) { return false; }

    const distance = getDistance(firefly, flashlight);
    return distance < flashlight.radius;
}


export function getDistance(f1, f2){
    const distY = Math.abs(f1.y - f2.y);
    const distX = Math.abs(f1.x - f2.x);
    return Math.sqrt(Math.pow(distX, 2) + Math.pow(distY, 2));
}
