import React from "react";
import ReactDOM from "react-dom";
import Kefir from "kefir";
import { createStore } from "redux";
import { Provider } from "react-redux";

import rootReducer from "./redux/rootReducer.js";
import App from "./components/App.jsx";
import { tick, initailState as startTime } from "./redux/modules/time.js";
import { PHI_TICK } from "./utils/phi.js";

const mountNode = document.querySelector(".js-firefly-mount");

// create the store and attach to the devtools if present
const store = (window.devToolsExtension
                ? window.devToolsExtension()(createStore)
                : createStore
              )(rootReducer);


// a kefir stream of our state
const stateStream = Kefir.stream((emitter) => {
    store.subscribe(() => {
        const state = store.getState();
        emitter.emit(state);
    });
});

// t/f whether or not we're currently blinking
const isBlinkingStream = stateStream
    .map((s) => s.blinkStatus === "blink")
    .skipDuplicates();

// when the time changes, schedule the next tick
const timeStream = stateStream
    .map(state => state.time)   // get time
    .skipDuplicates()           // don't continue if the time hasn't changed.
    // .log("time")
    .flatMapLatest(time => Kefir.later(PHI_TICK, time)) // in some time...
    .filterBy(isBlinkingStream) // if we're blinkin'
    .onValue((v) => {           // tick again
        store.dispatch(tick());
    });

// when the blink stream emits "true", tick
isBlinkingStream
    .filter()         // only keep true values
    .onValue((v) => { // start the blinking
        store.dispatch(tick());
    });


ReactDOM.render(
    <Provider store={store}>
        <App debug={store.getState().debug}/>
    </Provider>,
    mountNode
);
