// http://web.cs.sunyit.edu/~sengupta/swarm/firefly_alogorithms.pdf
// All of these parameters are defined in this slide deck


// action constants
const DISSIPATION_FACTOR_SET = "DISSIPATION_FACTOR_SET";
const AMPLITUDE_INCREMENT_SET = "AMPLITUDE_INCREMENT_SET";

// action creators
export function setDissipationFator(dissipationFactor){
    return {
        type: DISSIPATION_FACTOR_SET,
        dissipationFactor
    };
}

export function setAmplitudeIncrement(amplitudeIncrement){
    return {
        type: AMPLITUDE_INCREMENT_SET,
        amplitudeIncrement
    };
}

// initialState
export const initialState = {
    dissipationFactor: 0.15,
    amplitudeIncrement: 0.75
};

// reducer function
export default function reducer(state = initialState, action) {

    switch(action.type) {

        case DISSIPATION_FACTOR_SET: {
            return Object.assign({}, state, {
                dissipationFactor: action.dissipationFactor
            });
        }

        case AMPLITUDE_INCREMENT_SET: {
            return Object.assign({}, state, {
                amplitudeIncrement: action.amplitudeIncrement
            });
        }

        default: {
            return state;
        }
    }

}
