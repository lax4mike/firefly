import { combineReducers } from "redux";
import fireflies from "./modules/fireflies.js";
import signalRadius from "./modules/signalRadius.js";

export default combineReducers({
    fireflies,
    signalRadius
});
