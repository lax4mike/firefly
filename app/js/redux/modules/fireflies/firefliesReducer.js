import { TICK } from "../time.js";
import { initialState as signalRadiusInitialState } from "../signal-radius.js";
import { PHI_THRESHOLD, tickNextPhi } from "../../../utils/phi.js";

import {
    FIREFLIES_SET,
    FIREFLY_SET_POSITION,
    FIREFLY_ADD,
    FIREFLY_DELETE
} from "./firefliesActions.js";

// inital state
const initialState = [];

// reducer function
function reducer(state = initialState, action, canvas) {

    switch(action.type) {

        case TICK: {
            // increment phi for each firefly
            return state.map((ff) => Object.assign({}, ff, {
                phi: tickNextPhi(ff.phi)
            }));
        }

        case FIREFLIES_SET: {
            return action.fireflies;
        }

        case FIREFLY_ADD: {
            return state.concat(
                Object.assign(action.firefly)
            );
        }

        case FIREFLY_DELETE: {
            return state.filter((ff) => ff.id !== action.id);
        }

        case FIREFLY_SET_POSITION: {
            let { fireflyId, x, y } = action;
            let newState = state.slice();

            let firefly = newState.find((f) => f.id === fireflyId);
            Object.assign(firefly, {
                x: x,
                y: y
            });

            return newState;

        }

        default:
            return state;
    }

}

export default reducer;
