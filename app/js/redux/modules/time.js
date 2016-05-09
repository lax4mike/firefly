import { PHI_TICK } from "../../utils/phi.js";

// action constant
export const TICK = "TICK";
export const RESET_TIME = "RESET_TIME";


// action creators
export function tick(){
    return {
        type: TICK
    };
}

export function resetTime(){
    return {
        type: RESET_TIME
    };
}

const TICK_INCREMENT = PHI_TICK;


// inital state
export const initialState = 0;

// reducer
export default function reducer(state = initialState, action){

    switch(action.type){

        case TICK:
            return state + TICK_INCREMENT;

        case RESET_TIME:
            return 0;

        default: return state;
    }
}
