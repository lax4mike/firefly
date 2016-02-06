
// action constants
const FIREFLY_BLINK = "FIREFLY_BLINK";

import blinks from "../../blink-status.js";

// action creators
export function setFireflyBlink(status){

    if (blinks.indexOf(status) === -1){
        throw new Error("Firely blink must be one of ", blinks.join(", "));
    }

    return {
        type: FIREFLY_BLINK,
        status
    }
}

// inital state
let initialState = blinks[1];

// reducer function
function reducer(state = initialState, action) {

    switch(action.type) {

        case FIREFLY_BLINK: {
            return action.status;
        }

        default:
            return state;
    }

}

export default reducer;
