
// action constants
const CANVAS_SET_DIMENSIONS = "CANVAS_SET_DIMENSIONS";

// action creators
export function setCanvasDimensions(dimentions){
    return {
        type: CANVAS_SET_DIMENSIONS,
        dimentions
    };
}

// inital state
let initialState = {
    width: 0,
    height: 0
};

// reducer function
function reducer(state = initialState, action) {

    switch(action.type) {

        case CANVAS_SET_DIMENSIONS: {
            let { width, height } = action.dimentions;
            return Object.assign({}, state, {
                width, height
            });
        }

        default:
            return state;
    }

}

export default reducer;
