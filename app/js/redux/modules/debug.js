import { TICK } from "./time.js";

// action constants
const DEBUG_TOGGLE = "DEBUG_TOGGLE";
const SET_DEBUG_FIREFLY = "SET_DEBUG_FIREFLY";
const APPEND_HISTORY = "APPEND_HISTORY";

// action creators
export function toggleDebug(bool){
    return {
        type: DEBUG_TOGGLE,
        bool
    };
}

export function setDebugFirefly(fireflyId){
    return {
        type: SET_DEBUG_FIREFLY,
        fireflyId
    };
}

export function appendHistory(firefly){
    return {
        type: APPEND_HISTORY,
        firefly
    }
}

// inital state
const initialState = {
    enabled: false,
    debugFirefly: null,
    history: []
};

// reducer function
function reducer(state = initialState, action, fireflies) {

    switch(action.type) {

        case DEBUG_TOGGLE: {
            return Object.assign({}, state, {
                enabled: action.bool
            });
        }

        case SET_DEBUG_FIREFLY: {
            return Object.assign({}, state, {
                debugFirefly: action.fireflyId
            });
        }

        case TICK: {

            // if debuging isn't enabled, abort
            if (!state.enabled || !state.debugFirefly){
                return state;
            }

            // grab the debug firefly from the firefly list
            const debugFirefly = fireflies.firefliesById[state.debugFirefly]

            if (!debugFirefly){
                throw new Error("this should never happen!");
            }

            // push it to the history
            let history = state.history.concat(debugFirefly);

            // don't let the history grow too large
            if (history.length > 20){
                history.shift();
            }

            return Object.assign({}, state, { history });

            // // debug info of hovered firefly
            // if (ff.id === debugFirefly){
            //     (shouldJump)
            //         ? console.log(
            //             "DONG", debugFirefly, Math.round(ff.phi), Math.round(phi),
            //             "neighbors",
            //             justBlinkedNeighbors.map(n=>n.id).join(", ")
            //         )
            //         : console.log(
            //             "ding", debugFirefly, Math.round(ff.phi), Math.round(phi)
            //         );
            //
            //     if (justBlinked){
            //         console.log("**********blink**********", debugFirefly);
            //     }
            // }
        }

        default:
            return state;
    }

}

export default reducer;
