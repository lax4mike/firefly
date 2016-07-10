import { TICK } from "../time.js";
import {
    PHI_THRESHOLD, PHI_TICK,
    tickNextPhi, jumpNextPhi, tick } from "../../../utils/phi.js";

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
 *    color: one of the colors from colors.js
 * }
 * state.positionsById[ffid] = {
 *    id: number,
 *    x: number,
 *    y: number,
 * }
 */


// reducer function
function reducer(state = initialState, action,
    {time, phaseParameters, signalRadius, debugFirefly, flashlight}) {

    switch(action.type) {

        case TICK: {

            const fireflies = state;
            return tick({fireflies, time, phaseParameters, signalRadius, debugFirefly, flashlight})

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
