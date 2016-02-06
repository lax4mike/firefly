import { combineReducers } from "redux";
import fireflies from "./modules/fireflies.js";
import blinkStatus from "./modules/fireflies-blink-status.js";
import signalRadius from "./modules/signalRadius.js";
import blinkLog from "./modules/blink-log.js";

export default combineReducers({
    fireflies,
    signalRadius,
    blinkLog,
    blinkStatus
});
