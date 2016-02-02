// http://rackt.github.io/redux/docs/basics/Store.html
import { createStore } from "redux";
import rootReducer from "./rootReducer.js";


// create a store with the root reducer and our inital state
// the intialState is read from the json file
const store = createStore(rootReducer);


// whenever the store changes
store.subscribe(function(){
    console.log("STORE", store.getState());
});

// the dispatch function
export const dispatch = store.dispatch;

export default store;
