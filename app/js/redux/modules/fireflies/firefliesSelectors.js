import { createSelector } from "reselect";
import { tickNextPhi } from "../../../utils/phi.js";



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
    return state.fireflies.map(ff => getFirefly(ff, state));
};


const getFirefly = function(firefly, state){

    // console.log("calulating firefly neighbors!");

    let neighbors = state.fireflies
        // we only need the id, calculate the distance from firefly
        .map(f2 => {
            return Object.assign({}, {
                id: f2.id,
                distance: getDistance(firefly, f2)
            });
        })
        // only keep the fireflies that are close to firefly
        .filter(f3 => {
            return (f3.id !== firefly.id) && (f3.distance < state.signalRadius.radius);
        })
        .sort((a, b) => b.distance - a.distance);

    // check to see if this firefly is being shinned on
    let isInTheLight = (() => {
        if (!state.flashlight.isShining) { return false; }

        let distance = getDistance(firefly, state.flashlight);
        return distance < state.flashlight.radius;
    })();

    return Object.assign({}, firefly, { neighbors, isInTheLight });
};




function getDistance(f1, f2){
    const distY = Math.abs(f1.y - f2.y);
    const distX = Math.abs(f1.x - f2.x);
    return Math.sqrt(Math.pow(distX, 2) + Math.pow(distY, 2));
}
