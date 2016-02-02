
// action constants
const FIREFLY_ADD = "FIREFLY_ADD";
const FIREFLIES_SET = "FIREFLIES_SET";


// action creators
let fireflyId = 0;
export function addFirefly(firefly){
    return {
        type: FIREFLY_ADD,
        // add the id to the firefly
        firefly: Object.assign({}, firefly, {
            id: fireflyId++
        })
    };
}

export function setFireflies(fireflies){
    return {
        type: FIREFLIES_SET,
        fireflies: fireflies.map((f) => Object.assign(f, { id: fireflyId++ }))
    };
}

export function generateFireflies({width, height}){
    const fireflies = Array(20).fill().map((zero, i) => {
        // return {
        //     centerx: Math.random() * width,
        //     centery: Math.random() * height
        // };

        let columns = 4;
        let rows = 5;
        return {
            centerx: (width/(columns+1) * ((i % columns) + 1)),
            centery: (height/(rows+1) * ((i % rows) + 1))
        };
    });

    return {
        type: FIREFLIES_SET,
        fireflies
    };
}

// inital state
let initialState = [];

// reducer function
function reducer(state = initialState, action) {

    switch(action.type) {

        case FIREFLY_ADD: {
            return state.concat(action.firefly);
        }

        case FIREFLIES_SET: {
            return action.fireflies;
        }

        default:
            return state;
    }

}

export default reducer;
