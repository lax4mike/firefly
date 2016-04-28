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

// return an object of the array elements keyed by key
export function indexBy(array, key){
    return array.reduce((obj, item) => {
        obj[item[key]] = item;
        return obj;
    }, {});
}

// return a new object omiting certain keys
export function withoutKeys(obj, keys){
    return Object.keys(obj).reduce((newObj, key, i) => {
        if (!keys.includes(key)){
            newObj[key] = obj[key];
        }
        return newObj;
    }, {});
}

// return a new object including only the specified keys
export function withKeys(obj, keys){
    return Object.keys(obj).reduce((newObj, key, i) => {
        if (keys.includes(key)){
            newObj[key] = obj[key];
        }
        return newObj;
    }, {});
}

export function asArray(obj){
    return Object.keys(obj).map(k => obj[k]);
}
