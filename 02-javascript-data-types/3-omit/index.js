/**
 * omit - creates an object composed of enumerable property fields
 * @param {object} obj - the source object
 * @param {...string} fields - the properties paths to omit
 * @returns {object} - returns the new object
 */
export const omit = (obj, ...fields) => {
    let entriesResult = [];

    for (let [key, value] of Object.entries(obj)) {
      if(fields.includes(key)) {
        continue;
      }
      entriesResult.push([key, value]);
    }
  
    return Object.fromEntries(entriesResult);
};
