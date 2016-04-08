
import firefliesReducer  from "./modules/fireflies.js";
import canvasReducer     from "./modules/canvas.js";
import flashlightReducer from "./modules/flashlight.js";

import blinkLog         from "./modules/blink-log.js";
import blinkStatus      from "./modules/fireflies-blink-status.js";
import debug            from "./modules/debug.js";
import signalRadius     from "./modules/signal-radius.js";
import phaseParameters  from "./modules/phase-parameters.js";

export default function reducer(state = {}, action) {

    let simpleReducerState = combineSimpleReducers({
        blinkLog,
        blinkStatus,
        debug,
        signalRadius,
        phaseParameters
    })(state, action);

    let canvas    = canvasReducer(state.canvas, action);
    let fireflies = firefliesReducer(state.fireflies, action, canvas);
    let flashlight = flashlightReducer(state.flashlight, action, canvas);

    return Object.assign({}, simpleReducerState, {
        canvas,
        fireflies,
        flashlight
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
