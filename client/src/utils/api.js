export const getApiUrl = (endpoint = '') => {
  const baseUrl = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace(/\/$/, '')
    : '';
  return `${baseUrl}${endpoint}`;
};

export const apiFetch = (endpoint, options = {}) => {
  return fetch(getApiUrl(endpoint), options);
};

export default apiFetch;
