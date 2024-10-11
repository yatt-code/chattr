const isDevelopment = import.meta.env.MODE === 'development';

const getApiUrl = () => {
  if (isDevelopment) {
    return '/api'; // This will be proxied by Vite
  } else {
    return `${import.meta.env.VITE_PRODUCTION_API_URL}`;
  }
};

export const API_URL = getApiUrl();