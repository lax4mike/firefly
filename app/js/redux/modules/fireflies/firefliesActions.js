import { PHI_THRESHOLD } from "../../../utils/phi.js";
import { initialState as signalRadiusInitialState } from "../signalRadius.js";

// action constants
export const FIREFLIES_SET = "FIREFLIES_SET";
export const FIREFLY_SET_POSITION = "FIREFLY_SET_POSITION";
export const FIREFLY_ADD = "FIREFLY_ADD";
export const FIREFLY_DELETE = "FIREFLY_DELETE";

// action creators

// increment the id for every new firely
let fireflyId = 0;


// all fireflies should start at a random time.
export function getRandomPhi(){
    return Math.round(Math.random() * PHI_THRESHOLD);
}

function makeFirefly(props){

    const defaultFirefly = {
        id: -1,
        phi: 0,
        x: 0,
        y: 0,
        color: "blue",
        justBlinked: false,
        furthestPulse: 0,
        lastBlink: {
            time: 0,
            duration: 0
        }
    };

    // id's should be strings
    if (typeof(props.id) !== "undefined"){
        props.id = String(props.id);
    }

    return Object.assign({}, defaultFirefly, props);
}


// NOT USED, in the future if i implement this, use makeFirefly()
// export function setFireflies(fireflies) {
//     console.log(fireflies);
//     return {
//         type: FIREFLIES_SET,
//         fireflies: fireflies.map((f) => Object.assign(f, {
//             id: fireflyId++,
//             phi: getRandomPhi()
//         }))
//     };
// }

export function addFirefly({x, y}){
    const firefly = {
        id: fireflyId++,
        phi: getRandomPhi(),
        x, y
    };
    return {
        type: FIREFLY_ADD,
        firefly: makeFirefly(firefly)
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

        const isEven = i%2;

        return makeFirefly({
            id: fireflyId++,
            x: (width/2) + ((isEven) ? -50 : 50),
            y: (height/2) + ((i < 2) ? -50 : 50),
            phi: getRandomPhi()
        });
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

        fireflies.push(makeFirefly({
            id: fireflyId++,
            x: x,
            y: y,
            phi: getRandomPhi()
        }));

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
