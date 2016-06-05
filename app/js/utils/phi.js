import { getNeighborsById, getIsInTheLightIds } from "../redux/modules/fireflies/firefliesSelectors.js";
import { getPhaseParameters } from "../redux/modules/phaseSelectors.js";
import { mapObject, filterObject, indexBy, withoutKeys, withKeys } from "./object.js";

// when this threshold is hit, the firefly will blink and reset phi to 0
export const PHI_THRESHOLD = 2000;

// how much to go up when there are no neighbor blinks detected
export const PHI_TICK = 64;

export function tick(args){

    // const WHICH = "lauder";
    const WHICH = "strogatz";

    if (WHICH === "lauder") {
        return tickLauder(args);
    }
    else if (WHICH === "strogatz"){
        return tickStrogatz(args);
    }

}

// http://web.cs.sunyit.edu/~sengupta/swarm/firefly_alogorithms.pdf
// increment a bunch (when a neighbor blink is detected)
export function jumpNextPhi(phi, alpha, beta){
    const next = Math.min(alpha * phi + beta, PHI_THRESHOLD);
    // console.log("jump!", phi, next);

    return (next === PHI_THRESHOLD) ? 0 : next;
}

// increment the regular amount (without a neighbor detection)
export function tickNextPhi(phi){
    const next = (phi + PHI_TICK);
    // console.log("TICK", phi, next);
    return (next >= PHI_THRESHOLD) ? 0 : next;
}

function jumpNextPhiLauder(phi){
    const next = (phi + PHI_TICK*2);

    return (next >= PHI_THRESHOLD) ? 0 : next;
}



function tickLauder({fireflies, time, phaseParameters, signalRadius, debugFirefly, flashlight}){

    const firefliesById = fireflies.firefliesById;

    const neighborsById = getNeighborsById(fireflies.positionsById, signalRadius.radius);
    const isInTheLightIds = getIsInTheLightIds(fireflies.positionsById, flashlight);

    // increment phi for each firefly
    const newFirefliesById = mapObject(firefliesById, (ff) => {

        // all the neighbors that blinked on this tick
        const justBlinkedNeighbors = neighborsById[ff.id]
            .filter(n => firefliesById[n.id].justBlinked);

        // whether or not this firefly is in the light
        const isInTheLight = isInTheLightIds.includes(ff.id);

        // whether or not this firefly should jump when it see's
        // it's neighbor blink

        const shouldJump = justBlinkedNeighbors.length > 0
                        && ff.phi > (PHI_THRESHOLD/4)*3 // only jump if we're in the last quarter
                        && !ff.didJump; // if we haven't already blinked this phase

        // calculate the next phi.
        // if it's in the light, reset to 0; or jump; or just tick
        const phi = (isInTheLight) ? 0
                  : (shouldJump)   ? jumpNextPhiLauder(ff.phi)
                  : tickNextPhi(ff.phi);

        // set didJump to true if the ff jumped
        // or reset it
        const didJump = (phi === 0)
                ? false
                : ff.didJump || shouldJump;


        // if this tick pushed phi over the threshold, mark it so other
        // fireflies can see next tick
        const justBlinked = (!isInTheLight) && (phi === 0);

        // update the lastBlink if we just blinked
        const lastBlink = Object.assign({}, ff.lastBlink,
            (justBlinked) ? {
                time: time,
                duration: time - ff.lastBlink.time
            } : {}
        );

        // debug info of hovered firefly
        if (ff.id === debugFirefly){
            (shouldJump)
                ? console.log(
                    "DONG", debugFirefly, Math.round(ff.phi), Math.round(phi), ff.didJump,
                    "neighbors",
                    justBlinkedNeighbors.map(n=>n.id).join(", ")
                )
                : console.log(
                    "ding", debugFirefly, Math.round(ff.phi), Math.round(phi), ff.didJump
                );

            if (justBlinked){
                console.log("**********blink**********", debugFirefly, justBlinkedNeighbors.map(n=>n.id).join(", "));
            }
        }

        // update this firefly
        return Object.assign({}, ff, { phi, justBlinked, lastBlink, didJump });
    });

    return Object.assign({}, fireflies, {
        firefliesById: newFirefliesById
    });

}







function tickStrogatz({fireflies, time, phaseParameters, signalRadius, debugFirefly, flashlight}){

    const firefliesById = fireflies.firefliesById;
    const { alpha, beta } = getPhaseParameters(phaseParameters);

    const neighborsById = getNeighborsById(fireflies.positionsById, signalRadius.radius);
    const isInTheLightIds = getIsInTheLightIds(fireflies.positionsById, flashlight);

    // increment phi for each firefly
    const newFirefliesById = mapObject(firefliesById, (ff) => {

        // all the neighbors that blinked on this tick
        const justBlinkedNeighbors = neighborsById[ff.id]
            .filter(n => firefliesById[n.id].justBlinked);
            // add the data of the firefly, just for debugging
            // .map(f => Object.assign({}, f, fireflies[f.id]) );

        // whether or not this firefly is in the light
        const isInTheLight = isInTheLightIds.includes(ff.id);

        // whether or not this firefly should jump when it see's
        // it's neighbor blink
        // *NOTE* if two neightbors blinked on this tick, we're ignoring
        // it, and only jumping once
        const shouldJump = justBlinkedNeighbors.length > 0
                        && ff.phi > 0;

        // calculate the next phi.
        // if it's in the light, reset to 0; or jump; or just tick
        const phi = (isInTheLight) ? 0
                  : (shouldJump)   ? jumpNextPhi(ff.phi, alpha, beta)
                  : tickNextPhi(ff.phi);

        // if this tick pushed phi over the threshold, mark it so other
        // fireflies can see next tick
        const justBlinked = (!isInTheLight) && (phi === 0);

        // update the lastBlink if we just blinked
        const lastBlink = Object.assign({}, ff.lastBlink,
            (justBlinked) ? {
                time: time,
                duration: time - ff.lastBlink.time
            } : {}
        );

        // debug info of hovered firefly
        if (ff.id === debugFirefly){
            (shouldJump)
                ? console.log(
                    "DONG", debugFirefly, Math.round(ff.phi), Math.round(phi),
                    "neighbors",
                    justBlinkedNeighbors.map(n=>n.id).join(", ")
                )
                : console.log(
                    "ding", debugFirefly, Math.round(ff.phi), Math.round(phi)
                );

            if (justBlinked){
                console.log("**********blink**********", debugFirefly, justBlinkedNeighbors.map(n=>n.id).join(", "));
            }
        }

        // update this firefly
        return Object.assign({}, ff, { phi, justBlinked, lastBlink });
    });

    return Object.assign({}, fireflies, {
        firefliesById: newFirefliesById
    });
}
