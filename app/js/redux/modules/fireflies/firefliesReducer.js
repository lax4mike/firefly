import { TICK } from "../time.js";
import {
    PHI_THRESHOLD, PHI_TICK,
    tickNextPhi, jumpNextPhi } from "../../../utils/phi.js";
import { getNeighbors } from "./firefliesSelectors.js";
import { getPhaseParameters } from "../phaseSelectors.js";
import { mapObject, filterObject } from "../../../utils/object.js";

import {
    FIREFLIES_SET,
    FIREFLY_SET_POSITION,
    FIREFLY_ADD,
    FIREFLY_DELETE
} from "./firefliesActions.js";

// inital state, fireflies indexed by id
const initialState = {};

/**
 * a firefly = {
 *    id: number,
 *    x: number,
 *    y: number,
 *    phi: number,
 *    justBlinked: boolean, whether this ff fired on this tick
 *    jumps: number, number of times jumped in this phi cycle
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

// reducer function
function reducer(state = initialState, action,
    {canvas, signalRadius, phaseParameters, hoveredFirefly}) {

    const radius = signalRadius.radius;

    switch(action.type) {

        case TICK: {
            const { alpha, beta } = getPhaseParameters(phaseParameters);

            const fireflies = state;

            // increment phi for each firefly
            return mapObject(fireflies, (ff) => {

                const justBlinkedNeighbors = ff.neighbors
                    .filter(n => fireflies[n.id].justBlinked);
                // add the data of the firefly, just for debugging
                // .map(f => Object.assign({}, f, fireflies[f.id]) );

                // whether or not this firefly should jump when it see's
                // it's neighbor blink
                const shouldJump = justBlinkedNeighbors.length > 0
                                && ff.phi > 0
                                // only jump once per cycle
                                // TODO do we want this?
                                // && ff.jumps === 0;

                // all the neighbors that blinked on this tick
                // *NOTE* if two neightbors blinked on this tick, we're ignoring
                // it, and only jumping once
                const phi = (shouldJump)
                    ? jumpNextPhi(ff.phi, alpha, beta)
                    : tickNextPhi(ff.phi);

                // if this jump pushed phi over the threshold
                const justBlinked = phi < ff.phi;

                // if we just blinked, reset
                // if we jumped, increment the jumps
                const jumps = (justBlinked) ? 0
                            : (shouldJump)  ? ff.jumps + 1
                            : ff.jumps;

                if (ff.id === hoveredFirefly){
                    (shouldJump)
                        ? console.log("DONG", hoveredFirefly, ff.phi, phi, jumps)
                        : console.log("ding", hoveredFirefly, ff.phi, phi,
                            "neigh", justBlinkedNeighbors.map(n=>n.id).join(", "));

                    if (justBlinked){
                        console.log("*blink!", hoveredFirefly);
                    }
                }

                // update phis
                return Object.assign({}, ff, { phi, justBlinked, jumps });
            });
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
