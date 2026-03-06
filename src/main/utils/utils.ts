// Recursively changes all 'id' fields in an object to string type
export function changeObjectsIDType(object: any): void {
    for (const key in object) {
        if (key === 'id' || key === 'uuid') {
            if (typeof object[key] === 'number') {
                object[key] = object[key].toString();
            }
        } else if (typeof object[key] === 'object' && object[key] !== null) {
            changeObjectsIDType(object[key]);
        }
    }
    return object;
}
