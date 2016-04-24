
// when this threshold is hit, the firefly will blink and reset phi to 0
export const PHI_THRESHOLD = 2000;

// how much to go up when there are no neighbor blinks detected
export const PHI_TICK = 64;

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
    return (next > PHI_THRESHOLD) ? 0 : next;
}
