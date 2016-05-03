
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
    debugFirefly: null
};

// reducer function
function reducer(state = initialState, action) {

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

        default:
            return state;
    }

}

export default reducer;
