import { initialState as signalRadiusInitialState } from "./signalRadius.js";

// action constants
const FIREFLIES_SET = "FIREFLIES_SET";
const FIREFLY_SET_POSITION = "FIREFLY_SET_POSITION";
const FIREFLY_ADD_RANDOM = "FIREFLY_ADD_RANDOM";
const FIREFLY_ADD = "FIREFLY_ADD";
const FIREFLY_DELETE = "FIREFLY_DELETE";


// action creators
let fireflyId = 0;

export function setFireflies(fireflies) {
    return {
        type: FIREFLIES_SET,
        fireflies: fireflies.map((f) => Object.assign(f, { id: fireflyId++ }))
    };
}

export function addFirefly({x, y}){

    let firefly = {x, y};
    return {
        type: FIREFLY_ADD,
        firefly
    };
}

export function deleteFirefly(id){
    return {
        type: FIREFLY_DELETE,
        id
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
            x: (width/2) + ((isEven) ? -50 : 50),
            y: (height/2) + ((i < 2) ? -50 : 50)
        };
    });

    return {
        type: FIREFLIES_SET,
        fireflies
    };
}

export function addTrianglePatternOfFireflies({width, height}){

    const radius = signalRadiusInitialState.radius - 20;
    const padding = 60;

    let fireflies = [];

    let x = padding;
    let y = padding;

    // pthag, 30-60-90 triange, 1-2-rad(3)
    const rowheight = (radius/2) * Math.sqrt(3);

    // break when y is off the canvas
    while (height - y > padding) {

        fireflies.push({
            id: fireflyId++,
            x: x,
            y: y
        });

        x += radius;

        // if the x is off the canvas, reset
        if (width - x < padding){
            y += rowheight;
            // indent every other row
            const isEvenRow = Math.round((y-padding) / rowheight) % 2 === 1;
            x = (isEvenRow) ? padding + (radius/2) : padding;
        }
    }

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

        case FIREFLY_ADD_RANDOM: {
            let firefly = {
                id: fireflyId++,
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height
            };

            return state.concat(firefly);
        }

        case FIREFLY_ADD: {
            return state.concat(
                Object.assign(action.firefly, { id: fireflyId++ })
            );
        }

        case FIREFLY_DELETE: {
            return state.filter((ff) => ff.id !== action.id);
        }

        case FIREFLY_SET_POSITION: {
            let { fireflyId, x, y } = action;
            let newState = state.slice();

            let firefly = newState.find((f) => f.id === fireflyId);
            Object.assign(firefly, {
                x: x,
                y: y
            });

            return newState;

        }

        default:
            return state;
    }

}

export default reducer;
