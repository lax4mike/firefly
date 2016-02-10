
import firefliesReducer from "./modules/fireflies.js";
import canvasReducer    from "./modules/canvas.js";

import blinkStatus      from "./modules/fireflies-blink-status.js";
import signalRadius     from "./modules/signalRadius.js";
import blinkLog         from "./modules/blink-log.js";
import debug            from "./modules/debug.js";

export default function reducer(state = {}, action) {

    let canvas    = canvasReducer(state.canvas, action);
    let fireflies = firefliesReducer(state.fireflies, action, canvas);

    let simpleReducerState = combineSimpleReducers({
        signalRadius,
        blinkLog,
        blinkStatus,
        debug
    })(state, action);

    return Object.assign({}, simpleReducerState, {
        canvas,
        fireflies
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
    }
}
