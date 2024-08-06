/**
 * Get the value of a query parameter from the current URL
 * @param {string} key - The query parameter key
 * @returns {string|null} - The value of the query parameter, or null if not found
 */
export function getQueryParam(key: string) {
  const urlParams = new URLSearchParams(window.location.search)
  console.log('urlParams', urlParams, urlParams.get(key))
  return urlParams.get(key)
}
