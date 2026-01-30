// src/hooks/useAPI.js
import { useState, useCallback } from 'react';
import api from '../utils/api';

const useAPI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const request = useCallback(async (method, url, body = null) => {
    setLoading(true);
    setError(null);
    
    try {
      let response;
      
      switch (method.toUpperCase()) {
        case 'GET':
          response = await api.get(url);
          break;
        case 'POST':
          response = await api.post(url, body);
          break;
        case 'PUT':
          response = await api.put(url, body);
          break;
        case 'DELETE':
          response = await api.delete(url);
          break;
        default:
          throw new Error(`Unknown method: ${method}`);
      }

      setData(response);
      return { success: true, data: response };
    } catch (err) {
      const errorMsg = err.error || 'API request failed';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    data,
    request,
    get: (url) => request('GET', url),
    post: (url, body) => request('POST', url, body),
    put: (url, body) => request('PUT', url, body),
    delete: (url) => request('DELETE', url)
  };
};

export default useAPI;
export { useAPI };