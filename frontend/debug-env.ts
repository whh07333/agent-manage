console.log('环境变量:', {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  DEFAULT_TOKEN: import.meta.env.VITE_DEFAULT_TOKEN ? import.meta.env.VITE_DEFAULT_TOKEN.substring(0, 20) + '...' : 'undefined'
});
