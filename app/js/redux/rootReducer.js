
import firefliesReducer    from "./modules/fireflies/firefliesReducer.js";
import canvasReducer       from "./modules/canvas.js";
import flashlightReducer   from "./modules/flashlight.js";
import signalRadiusReducer from "./modules/signalRadius.js";
import phaseReducer        from "./modules/phaseParameters.js";
import hoveredFireflyReducer from "./modules/hoveredFirefly.js";

import blinkStatus    from "./modules/blinkStatus.js";
import debug          from "./modules/debug.js";
import time           from "./modules/time.js";

export default function reducer(state = {}, action) {

    const simpleReducerState = combineSimpleReducers({
        blinkStatus,
        debug,
        time
    })(state, action);

    // get the radius from the state if it's defined
    // and pass to the fireflies reduce
    const signalRadius = signalRadiusReducer(state.signalRadius, action);
    const phaseParameters = phaseReducer(state.phaseParameters, action);
    const hoveredFirefly = hoveredFireflyReducer(state.hoveredFirefly, action);
    const canvas     = canvasReducer(state.canvas, action);
    const flashlight = flashlightReducer(state.flashlight, action, canvas);
    const fireflies  = firefliesReducer(state.fireflies, action,
        {canvas, signalRadius, phaseParameters, hoveredFirefly, flashlight});

    return Object.assign({}, simpleReducerState, {
        hoveredFirefly,
        canvas,
        fireflies,
        flashlight,
        signalRadius,
        phaseParameters
    });

}

// a simple version of combineReducers.
// redux yells at you if you pass state with extra keys to it.
function combineSimpleReducers(reducers){
    return function(state = {}, action){
        return Object.keys(reducers).reduce((nextState, key) => {
            nextState[key] = reducers[key](state[key], action);
            return nextState;
        }, {});
    };
}
