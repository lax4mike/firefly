import React from "react";
import ReactDOM from "react-dom";

import { createStore } from "redux";
import { Provider } from "react-redux";
import rootReducer from "./redux/rootReducer.js";

import App from "./components/App.jsx";


let mountNode = document.querySelector(".js-firefly-mount");

let store = (window.devToolsExtension
                ? window.devToolsExtension()(createStore)
                : createStore
            )(rootReducer);


ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    mountNode
);
