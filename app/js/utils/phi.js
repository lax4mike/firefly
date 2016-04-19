
// when this threshold is hit, the firefly will blink and reset phi to 0
export const PHI_THRESHOLD = 1000;

// how much to go up when there are no neighbor blinks detected
export const PHI_TICK = 16;

// http://web.cs.sunyit.edu/~sengupta/swarm/firefly_alogorithms.pdf
// increment a bunch (when a neighbor blink is detected)
export function getNextPhi(phi, alpha, beta){
    return Math.min(alpha * phi + beta, PHI_THRESHOLD);
}

// increment the regular amount (without a neighbor detection)
export function tickNextPhi(phi){
    return (phi + PHI_TICK) % PHI_THRESHOLD;
}
