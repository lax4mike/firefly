// helper methods for objects

export function mapObject(obj, fn){
    return Object.keys(obj).reduce((newObj, key, i) => {
        newObj[key] = fn(obj[key], i, key);
        return newObj;
    }, {});
}

export function filterObject(obj, fn){
    return Object.keys(obj).reduce((newObj, key, i) => {
        // if the function returns true, add this item to the newObj
        if (fn(obj[key], i, key)){
            newObj[key] = obj[key];
        }
        return newObj;
    }, {});
}

export function asArray(obj){
    return Object.keys(obj).map(k => obj[k]);
}
