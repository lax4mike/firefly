
// action constants
const BLINK_LOGIT = "BLINK_LOGIT";

// action creators
export function logBlink(firefly){

    let blink = {
        id: firefly.id,
        timestamp: Date.now()
    };

    return {
        type: BLINK_LOGIT,
        blink
    };
}

// inital state
let initialState = [];

// reducer function
function reducer(state = initialState, action) {

    switch(action.type) {

        case BLINK_LOGIT: {
            let pruned = pruneLog(state);
            return pruned.concat(action.blink);
        }

        default:
            return state;
    }

}

// remove all entries older than 2000ms
function pruneLog(log){
    let now = Date.now();
    return log.filter((b) => {
        return now - b.timestamp < 2000 ;
    });
}

export default reducer;
