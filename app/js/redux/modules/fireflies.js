

// action constants
const FIREFLIES_SET = "FIREFLIES_SET";


// action creators
let fireflyId = 0;

export function setFireflies(fireflies){
    return {
        type: FIREFLIES_SET,
        fireflies: fireflies.map((f) => Object.assign(f, { id: fireflyId++ }))
    };
}

export function generateFireflies({width, height}){
    const fireflies = Array(4).fill().map((zero, i) => {
        // return {
        //     centerx: Math.random() * width,
        //     centery: Math.random() * height
        // };

        let columns = 6;
        let rows = 3;
        return {
            id: fireflyId++,
            centerx: (width/(columns+1) * ((i % columns) + 1)),
            centery: (height/2),//(height/(rows+1) * ((i % rows) + 1)),
            interval: 1000
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

        case FIREFLIES_SET: {
            return action.fireflies;
        }

        default:
            return state;
    }

}

export default reducer;
