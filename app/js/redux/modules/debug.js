
// action constants
const DEBUG_TOGGLE = "DEBUG_TOGGLE";

// action creators
export function toggleDebug(bool){
    return {
        type: DEBUG_TOGGLE,
        bool
    };
}

// inital state
let initialState = false;

// reducer function
function reducer(state = initialState, action) {

    switch(action.type) {

        case DEBUG_TOGGLE: {
            return action.bool;
        }

        default:
            return state;
    }

}

export default reducer;
