
// action constants
export const FLASHLIGHT_UPDATE = "FLASHLIGHT_UPDATE";

// action creators
export function updateFlashlight(flashlight){
    return {
        type: FLASHLIGHT_UPDATE,
        flashlight
    };
}

// inital state
const initialState = {
    isShining: false,
    isResizing: false, // visible, but won't stop blinking
    x: 0,
    y: 0,
    radius: 100
};

// reducer function
function reducer(state = initialState, action, canvas) {

    switch(action.type) {

        case FLASHLIGHT_UPDATE: {

            const newState = Object.assign({}, state, action.flashlight);

            // if this is the first call with isResizing, center then flashlight
            if (state.isResizing === false && action.flashlight.isResizing === true){
                Object.assign(newState, { x: canvas.width/2, y: canvas.height/2});
            }

            return newState;
        }

        default:
            return state;
    }

}

export default reducer;
