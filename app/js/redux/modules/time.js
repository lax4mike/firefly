// action constant
export const TICK = "TICK";


// action creators
export function tick(){
    return {
        type: TICK
    };
}

const TICK_INCREMENT = 16;


// inital state
export const initialState = 0;

// reducer
export default function reducer(state = initialState, action){

    switch(action.type){

        case TICK:
            return state + TICK_INCREMENT;

        default: return state;
    }
}
