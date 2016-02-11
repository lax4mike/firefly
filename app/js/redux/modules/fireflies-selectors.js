import { createSelector } from "reselect";

// selectors
const radiusSelector = (state) => state.signalRadius.radius;
const firefliesSelector = (state) => state.fireflies;
const flashlightSelector = (state) => state.flashlight;

// derive the firefly neighbors (fireflies that are withing the signalRadius
// of each firelfly)
export const getFireflies = createSelector(
    [firefliesSelector, radiusSelector, flashlightSelector],

    (fireflies, radius, flashlight) => {
        return fireflies.map(f1 => {
            let neighbors = fireflies
                // we only need the id, calculate the distance from f1
                .map(f2 => {
                    return Object.assign({}, {
                        id: f2.id,
                        distance: getDistance(f1, f2)
                    });
                })
                // only keep the fireflies that are close to f1
                .filter(f3 => {
                    return (f3.id !== f1.id) && (f3.distance < radius);
                })
                .sort((a, b) => b.distance - a.distance);

            // check to see if this firefly is being shinned on
            let isInTheLight = (() => {
                if (!flashlight.isShining) { return false; }

                let distance = getDistance(f1, flashlight);
                return distance < flashlight.radius;
            })();

            return Object.assign({}, f1, { neighbors, isInTheLight });
        });
    }
);

function getDistance(f1, f2){
    const distY = Math.abs(f1.y - f2.y);
    const distX = Math.abs(f1.x - f2.x);
    return Math.sqrt(Math.pow(distX, 2) + Math.pow(distY, 2));
}
