/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
  const sortOrder = param !== 'desc' ? (a, b) => a.localeCompare(b,'ru-u-kf-upper') :
                                       (a, b) => b.localeCompare(a,'ru-u-kf-upper');                                      
                                        
  return arr.slice().sort(sortOrder);
}
