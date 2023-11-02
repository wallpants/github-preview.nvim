/* eslint-disable */

/**
 * Performs a partial deep comparison between object and source
 * to determine if object contains equivalent property values.
 *
 * @see {@link https://youmightnotneed.com/lodash#isMatch}
 */
export function isMatch(object: any, source: any): boolean {
    for (const key in source) {
        // For arrays we look for partial matches
        if (Array.isArray(source[key]) && Array.isArray(object[key])) {
            return source[key].every((v: any) => object[key].includes(v));
        }
        // For any other data type we look for equality of the values
        return typeof source[key] === "object"
            ? isMatch(object[key], source[key])
            : object[key] === source[key];
    }

    // This should catch emtpy structures
    return JSON.stringify(object) === JSON.stringify(source);
}
