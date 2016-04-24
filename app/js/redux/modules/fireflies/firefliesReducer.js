import { TICK } from "../time.js";
import {
    PHI_THRESHOLD, PHI_TICK,
    tickNextPhi, jumpNextPhi } from "../../../utils/phi.js";
import { getNeighbors, getIsInTheLight } from "./firefliesSelectors.js";
import { getPhaseParameters } from "../phaseSelectors.js";
import { mapObject, filterObject } from "../../../utils/object.js";

import {
    FIREFLIES_SET,
    FIREFLY_SET_POSITION,
    FIREFLY_ADD,
    FIREFLY_DELETE
} from "./firefliesActions.js";

import { FLASHLIGHT_UPDATE } from "../flashlight.js";

// inital state, fireflies indexed by id
const initialState = {};

/**
 * a firefly = {
 *    id: number,
 *    x: number,
 *    y: number,
 *    phi: number,
 *    justBlinked: boolean, whether this ff fired on this tick
 *    neighbors: [ids] << added by augmentNeighbors()
 * }
 */



function augmentNeighbors(fireflies, radius){

    // if we're not provided a radius, just return the fireflies
    if (typeof(radius) === "undefined"){
        return fireflies;
    }

    const newFireflies = mapObject(fireflies, f => Object.assign({}, f, {
        neighbors: getNeighbors(f, fireflies, radius)
    }));

    // console.log("calc neighbors", radius, newFireflies)

    return newFireflies;
}

function augmentIsInTheLight(fireflies, flashlight){

    // if we're not provided a flashlight, just return the fireflies
    if (typeof(flashlight) === "undefined"){
        return fireflies;
    }

    const newFireflies = mapObject(fireflies, f => Object.assign({}, f, {
        isInTheLight: getIsInTheLight(f, flashlight)
    }));

    // console.log("calc neighbors", radius, newFireflies)

    return newFireflies;
}

// reducer function
function reducer(state = initialState, action,
    {canvas, signalRadius, phaseParameters, hoveredFirefly, flashlight}) {

    const radius = signalRadius.radius;

    switch(action.type) {

        case TICK: {
            const { alpha, beta } = getPhaseParameters(phaseParameters);

            const fireflies = state;

            // increment phi for each firefly
            return mapObject(fireflies, (ff) => {

                // all the neighbors that blinked on this tick
                const justBlinkedNeighbors = ff.neighbors
                    .filter(n => fireflies[n.id].justBlinked);
                    // add the data of the firefly, just for debugging
                    // .map(f => Object.assign({}, f, fireflies[f.id]) );

                // whether or not this firefly should jump when it see's
                // it's neighbor blink
                // *NOTE* if two neightbors blinked on this tick, we're ignoring
                // it, and only jumping once
                const shouldJump = justBlinkedNeighbors.length > 0
                                && ff.phi > 0;

                // calculate the next phi.
                // if it's in the light, reset to 0; or jump; or just tick
                const phi = (ff.isInTheLight) ? 0
                          : (shouldJump)      ? jumpNextPhi(ff.phi, alpha, beta)
                          : tickNextPhi(ff.phi);

                // if this tick pushed phi over the threshold, mark it so other
                // fireflies can see next tick
                const justBlinked = (!ff.isInTheLight) && (phi === 0);

                // debug info of hovered firefly
                if (ff.id === hoveredFirefly){
                    (shouldJump)
                        ? console.log("DONG", hoveredFirefly, ff.phi, phi)
                        : console.log("ding", hoveredFirefly, ff.phi, phi,
                            "neighbors", justBlinkedNeighbors.map(n=>n.id).join(", "));

                    if (justBlinked){
                        console.log("*blink!", hoveredFirefly);
                    }
                }

                // update this firefly
                return Object.assign({}, ff, { phi, justBlinked });
            });
        }

        case FLASHLIGHT_UPDATE: {
            return augmentIsInTheLight(state, flashlight);
        }

        case FIREFLIES_SET: {
            return augmentNeighbors(action.fireflies, radius);
        }

        case FIREFLY_ADD: {

            const { firefly } = action;

            // add this firefly to the map
            const newState = Object.assign({}, state, {
                [firefly.id]: firefly
            });

            return augmentNeighbors(newState, radius);
        }

        case FIREFLY_DELETE: {

            const newState = filterObject(state, ff => ff.id !== action.id);

            return augmentNeighbors(newState, radius);
        }

        case FIREFLY_SET_POSITION: {
            const { fireflyId, x, y } = action;

            const firefly = state[fireflyId];

            const newFirefly = Object.assign({}, firefly, {
                x: x,
                y: y
            });

            const newState = Object.assign({}, state);
            newState[fireflyId] = newFirefly;

            return augmentNeighbors(newState, radius);
        }

        default:
            return state;
    }

}

export default reducer;
