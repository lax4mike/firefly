
// action constants
const SET_FIREFLY_HOVER = "SET_FIREFLY_HOVER";

// action creators
export function setHoveredFirefly(fireflyId){
    return {
        type: SET_FIREFLY_HOVER,
        fireflyId
    };
}

// inital state
let initialState = null;

// reducer function
function reducer(state = initialState, action) {

    switch(action.type) {

        case SET_FIREFLY_HOVER: {
            return action.fireflyId;
        }

        default:
            return state;
    }

}

export default reducer;
