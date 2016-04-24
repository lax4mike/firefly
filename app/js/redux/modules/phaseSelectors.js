import { createSelector } from "reselect";

// phase selectors
const dissipationFactorSelector = (phaseParameters) => phaseParameters.dissipationFactor;
const amplitudeIncrementSelector = (phaseParameters) => phaseParameters.amplitudeIncrement;


// http://web.cs.sunyit.edu/~sengupta/swarm/firefly_alogorithms.pdf
// the forumla is in the slides
export const getPhaseParameters = createSelector(
    [dissipationFactorSelector, amplitudeIncrementSelector],

    (dissipationFactor, amplitudeIncrement) => {

        const alpha = Math.exp(dissipationFactor * amplitudeIncrement);
        const beta = (alpha - 1) / (Math.exp(dissipationFactor) - 1);

        return {
            dissipationFactor,
            amplitudeIncrement,
            alpha,
            beta
        };
    }
);
