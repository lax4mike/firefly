

// action constants
const FIREFLIES_SET = "FIREFLIES_SET";
const FIREFLY_SET_POSITION = "FIREFLY_SET_POSITION";
const FIREFLY_ADD = "FIREFLY_ADD";


// action creators
let fireflyId = 0;

export function setFireflies(fireflies) {
    return {
        type: FIREFLIES_SET,
        fireflies: fireflies.map((f) => Object.assign(f, { id: fireflyId++ }))
    };
}

export function addFirefly(){

    return {
        type: FIREFLY_ADD
    };
}

// for dragging
export function setFireflyPosition({fireflyId, x, y}){
    return {
        type: FIREFLY_SET_POSITION,
        fireflyId, x, y
    };
}



export function addBoxOfFireflies({width, height}){

    const fireflies = Array(4).fill().map((zero, i) => {

        let isEven = i%2;

        return {
            id: fireflyId++,
            centerx: (width/2) + ((isEven) ? -50 : 50),
            centery: (height/2) + ((i < 2) ? -50 : 50)
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
function reducer(state = initialState, action, canvas) {

    switch(action.type) {

        case FIREFLIES_SET: {
            return action.fireflies;
        }

        case FIREFLY_ADD: {
            let firefly = {
                id: fireflyId++,
                centerx: Math.random() * canvas.width,
                centery: Math.random() * canvas.height
            };

            return state.concat(firefly);
        }

        case FIREFLY_SET_POSITION: {
            let { fireflyId, x, y } = action;
            let newState = state.slice();

            let firefly = newState.find((f) => f.id === fireflyId);
            Object.assign(firefly, {
                centerx: x,
                centery: y
            });

            return newState;

        }

        default:
            return state;
    }

}

export default reducer;
