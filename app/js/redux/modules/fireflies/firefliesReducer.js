import { TICK } from "../time.js";
import {
    PHI_THRESHOLD, PHI_TICK,
    tickNextPhi, jumpNextPhi } from "../../../utils/phi.js";
import { getNeighbors } from "./firefliesSelectors.js";
import { getPhaseParameters } from "../phase-selectors.js";
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
function reducer(state = initialState, action, canvas, signalRadius, phaseParameters) {

    const radius = signalRadius.radius;

    switch(action.type) {

        case TICK: {
            const { alpha, beta } = getPhaseParameters(phaseParameters);

            const fireflies = state;

            // increment phi for each firefly
            return mapObject(fireflies, (ff) => {

                // all the neighbors that blinked on this tick
                const justBlinkedNeighbors = ff.neighbors.filter(n => {
                    // TODO is this correct?
                    // return fireflies[n.id].phi < PHI_TICK;

                    return fireflies[n.id].justBlinked;
                })
                .map(f => Object.assign({}, f, fireflies[f.id]) );

                // *NOTE* if two neightbors blinked on this tick, we're ignoring
                // it, and only jumping once
                const phi = (justBlinkedNeighbors.length > 0)
                    ? jumpNextPhi(ff.phi, alpha, beta)
                    : tickNextPhi(ff.phi);

                // if this jump pushed phi over the threshold
                const justBlinked = phi < ff.phi;

                // if (ff.id === 8){
                //     (justBlinkedNeighbors.length > 0)
                //         ? console.log("DONG", justBlinkedNeighbors)
                //         : null;//console.log("ding", ff.phi, phi);
                //     if (justBlinked){
                //         console.log("just blinked!");
                //     }
                // }

                // update phis
                return Object.assign({}, ff, { phi, justBlinked });
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
