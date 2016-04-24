import { createSelector } from "reselect";
import { asArray } from "../../../utils/object.js";


export const getFireflies = (state) => {
    return asArray(state.fireflies);
};


export function getNeighbors(firefly, fireflies, radius) {

    if (typeof(radius) === "undefined") {
        throw new Error("getNeighbors: radius is required!");
    }

    // we only need the id, calculate the distance from firefly
    return asArray(fireflies)
        .map(f2 => {
            return Object.assign({}, {
                id: f2.id,
                distance: getDistance(firefly, f2)
            });
        })
        // only keep the fireflies that are close to firefly
        .filter(f3 => {
            return (f3.id !== firefly.id) && (f3.distance < radius);
        })
        .sort((a, b) => b.distance - a.distance);
}

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
