
// action constants
const SET_BLINKSTATUS = "SET_BLINKSTATUS";

import blinks from "../../blink-status.js";

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

// inital state
let initialState = blinks[1];

// reducer function
function reducer(state = initialState, action) {

    switch(action.type) {

        case SET_BLINKSTATUS: {
            return action.status;
        }

        default:
            return state;
    }

}

export default reducer;
