/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
  return (obj) => {
    const pathKeys = path.split(".");
    let result = {...obj};

    for (const key of pathKeys) {
      if (!result) {
        break;
      }

      result = result.hasOwnProperty([key]) ? result[key] : undefined;
    } 
    
    return result;
  }
}
