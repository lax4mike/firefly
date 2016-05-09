import { RESET_TIME } from "./time.js";

// action constants
const SET_BLINKSTATUS = "SET_BLINKSTATUS";

import blinks from "../../blinkStatus.js";

// action creators
export function setBlinkStatus(status){

    if (blinks.indexOf(status) === -1){
        throw new Error("Firely blink must be one of ", blinks.join(", "));
    }

    return {
        type: SET_BLINKSTATUS,
        status
    };
}

// inital state ("off")
const initialState = blinks[2];

// reducer function
function reducer(state = initialState, action) {

    switch(action.type) {

        case SET_BLINKSTATUS: {
            return action.status;
        }

        // reset the blink status when the time is reset
        // if it was paused, reset it back to "off"
        case RESET_TIME: {
            return (state === "paused")
                ? initialState
                : state;
        }

        default:
            return state;
    }

}

export default reducer;
