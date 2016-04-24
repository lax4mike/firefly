import { createSelector } from "reselect";
import { tickNextPhi } from "../../../utils/phi.js";
import { mapObject, filterObject, asArray } from "../../../utils/object.js";


// selectors
const radiusSelector     = (state) => state.signalRadius.radius;
const firefliesSelector  = (state) => state.fireflies;
const flashlightSelector = (state) => state.flashlight;

// derive the firefly neighbors (fireflies that are withing the signalRadius
// of each firelfly)
// export const getFireflies = createSelector(
//     [firefliesSelector, radiusSelector, flashlightSelector],
//
//     (fireflies, radius, flashlight) => {
//
//
//         return fireflies.map(ff => getFirefly(ff, state));
//     }
// );

export const getFireflies = (state) => {
    return asArray(mapObject(state.fireflies, ff => getFirefly(ff, state)));
};


const getFirefly = function(firefly, state){

    // console.log("calulating firefly neighbors!");

    // this is now being stored in the state so the reducers can use it (TICK action)
    // let neighbors = getNeighbors(firefly, state.fireflies, state.signalRadius.radius);

    // check to see if this firefly is being shinned on
    let isInTheLight = getIsInTheLight(firefly, state.flashlight);

    return Object.assign({}, firefly, { isInTheLight });
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

function getIsInTheLight(firefly, flashlight){
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
