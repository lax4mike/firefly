import React from "react";
import ReactDOM from "react-dom";
import App from "./components/App.jsx";


let mountNode = document.querySelector(".js-firefly-mount");

ReactDOM.render(
    <App />,
    mountNode
);
