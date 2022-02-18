/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  let result = '';

  if (string.length === 0 || size === 0) {
    return result;
  } else if (!size) {
    return string;
  }

  result = string[0];
  let counter = 1;
  
  for (let i = 1; i < string.length; i++) {
    if (string[i] === string[i-1]) {
      if (counter < size) {
        result += string[i];
        counter++;
      } 
    } else {
      result += string[i];
      counter = 1;
    }
  }
  
  return result;
}
