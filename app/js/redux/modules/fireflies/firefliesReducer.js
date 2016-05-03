import { TICK } from "../time.js";
import {
    PHI_THRESHOLD, PHI_TICK,
    tickNextPhi, jumpNextPhi } from "../../../utils/phi.js";
import { getNeighborsById, getIsInTheLightIds } from "./firefliesSelectors.js";
import { getPhaseParameters } from "../phaseSelectors.js";
import { mapObject, filterObject, indexBy, withoutKeys, withKeys } from "../../../utils/object.js";

import {
    FIREFLIES_SET,
    FIREFLY_SET_POSITION,
    FIREFLY_ADD,
    FIREFLY_DELETE
} from "./firefliesActions.js";

// inital state, fireflies indexed by id
const initialState = {
    firefliesById: {},
    positionsById: {}
};

/**
 * state.firefliesById[ffid] = {
 *    id: number,
 *    phi: number,
 *    justBlinked: boolean, whether this ff fired on this tick
 * }
 * state.positionsById[ffid] = {
 *    id: number,
 *    x: number,
 *    y: number,
 * }
 */


// reducer function
function reducer(state = initialState, action,
    {canvas, time, phaseParameters, signalRadius, flashlight}) {

    switch(action.type) {

        case TICK: {

            const fireflies = state;
            const firefliesById = fireflies.firefliesById;
            const { alpha, beta } = getPhaseParameters(phaseParameters);

            const neighborsById = getNeighborsById(fireflies.positionsById, signalRadius.radius);
            const isInTheLightIds = getIsInTheLightIds(fireflies.positionsById, flashlight);

            // increment phi for each firefly
            const newFirefliesById = mapObject(firefliesById, (ff) => {

                // all the neighbors that blinked on this tick
                const justBlinkedNeighbors = neighborsById[ff.id]
                    .filter(n => firefliesById[n.id].justBlinked);
                    // add the data of the firefly, just for debugging
                    // .map(f => Object.assign({}, f, fireflies[f.id]) );

                // whether or not this firefly is in the light
                const isInTheLight = isInTheLightIds.includes(ff.id);

                // whether or not this firefly should jump when it see's
                // it's neighbor blink
                // *NOTE* if two neightbors blinked on this tick, we're ignoring
                // it, and only jumping once
                const shouldJump = justBlinkedNeighbors.length > 0
                                && ff.phi > 0;

                // calculate the next phi.
                // if it's in the light, reset to 0; or jump; or just tick
                const phi = (isInTheLight) ? 0
                          : (shouldJump)      ? jumpNextPhi(ff.phi, alpha, beta)
                          : tickNextPhi(ff.phi);

                // if this tick pushed phi over the threshold, mark it so other
                // fireflies can see next tick
                const justBlinked = (!isInTheLight) && (phi === 0);

                // update the lastBlink if we just blinked
                const lastBlink = Object.assign({}, ff.lastBlink,
                    (justBlinked) ? {
                        time: time,
                        duration: time - ff.lastBlink.time
                    } : {}
                );

                // update this firefly
                return Object.assign({}, ff, { phi, justBlinked, lastBlink });
            });

            return Object.assign({}, state, {
                firefliesById: newFirefliesById
            });
        }

        case FIREFLIES_SET: {

            const newFireflies = action.fireflies;

            // split out the x and y
            const withoutPosition = newFireflies.map(ff => withoutKeys(ff, ["x", "y"]));
            const firefliesById = indexBy(withoutPosition, "id");

            const xAndY = newFireflies.map(ff => withKeys(ff, ["id", "x", "y"]));
            const positionsById = indexBy(xAndY, "id");

            const newState = {
                firefliesById,
                positionsById
            };

            return newState;
        }

        case FIREFLY_ADD: {

            const { firefly } = action;

            // add this firefly to the maps
            const newState = Object.assign({}, state, {
                firefliesById: Object.assign({}, state.firefliesById, {
                    [firefly.id]: withoutKeys(firefly, ["x", "y"])
                }),
                positionsById: Object.assign({}, state.positionsById, {
                    [firefly.id]: withKeys(firefly, ["id", "x", "y"])
                })
            });

            return Object.assign({}, state, newState);
        }

        case FIREFLY_DELETE: {

            const firefliesById = filterObject(state.firefliesById, ff => ff.id !== action.id);
            const positionsById = filterObject(state.positionsById, ff => ff.id !== action.id);

            return {
                firefliesById,
                positionsById
            };
        }

        case FIREFLY_SET_POSITION: {
            const { fireflyId, x, y } = action;

            const firefly = state.positionsById[fireflyId];

            const newFirefly = Object.assign({}, firefly, {
                x: x,
                y: y
            });

            const positionsById = Object.assign({}, state.positionsById);
            positionsById[fireflyId] = newFirefly;

            return Object.assign({}, state, { positionsById } );
        }

        default:
            return state;
    }

}

export default reducer;
