
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

export function toggleVisbility(bool){
    return {
        type: RADIUS_TOGGLE,
        bool
    };
}

// inital state
let initialState = {
    radius: 200,
    isVisible: false
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
                isVisible: action.bool
            });
        }

        default:
            return state;
    }

}

export default reducer;
