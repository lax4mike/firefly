import React from "react";

import CanvasContainer   from "./CanvasContainer.js";
import ControlsContainer from "./ControlsContainer.js";

export default React.createClass({

    displayName: "App",

    render: function(){

        return (
            <div className="fireflies-app" ref="app">
                <ControlsContainer />
                <CanvasContainer />
            </div>
        );
    }

});
