import React from "react";
import ReactDOM from "react-dom";

import { createStore } from "redux";
import { Provider } from "react-redux";
import rootReducer from "./redux/rootReducer.js";

import App from "./components/App.jsx";


const mountNode = document.querySelector(".js-firefly-mount");

const store = (window.devToolsExtension
                ? window.devToolsExtension()(createStore)
                : createStore
            )(rootReducer);


import { tick, initailState as startTime } from "./redux/modules/time.js";
import { PHI_TICK } from "./utils/phi.js";

let time = startTime;

store.subscribe(() => {
    const state = store.getState();
    const newTime = state.time;

    // if the time has changed, tick!
    if (newTime !== time && newTime < 20000){
        time = newTime;

        // console.log(newTime);

        setTimeout(() => {
            store.dispatch(tick());
        }, PHI_TICK);
    }

    try{
        // console.log(state.fireflies.map(f => f.phi));
    } catch(e){}
});

store.dispatch(tick());

ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    mountNode
);
