
// action constants
const RADIUS_UPDATE = "RADIUS_UPDATE";
const RADIUS_TOGGLE = "RADIUS_TOGGLE";

// action creators
export function updateRadius(radius){
    return {
        type: RADIUS_UPDATE,
        radius
    };
}

export function toggleHidden(bool){
    return {
        type: RADIUS_TOGGLE,
        bool
    }
}

// inital state
let initialState = {
    radius: 200,
    isHidden: true
};

// reducer function
function reducer(state = initialState, action) {

    switch(action.type) {

        case RADIUS_UPDATE: {
            return Object.assign({}, state, {
                radius: action.radius || ""
            });
        }

        case RADIUS_TOGGLE: {
            return Object.assign({}, state, {
                isHidden: action.bool
            });
        }

        default:
            return state;
    }

}

export default reducer;
