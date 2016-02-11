export default function getOffset(container, event) {
    const rect = container.getBoundingClientRect();

    // min/max make sure that it never goes out of the
    // bounds of the container
    const offsetX = Math.min(
        Math.max(0, event.pageX - rect.left),
        rect.width
    );
    const offsetY =  Math.min(
        Math.max(0, event.pageY - rect.top),
        rect.height
    );

    return {
        x: offsetX,
        y: offsetY
    };
}
