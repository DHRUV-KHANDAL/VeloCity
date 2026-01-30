// src/hooks/useRide.js
import { useState, useCallback, useMemo } from 'react';
import useAuth from './useAuth';
import api from '../utils/api';

const useRide = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rideData, setRideData] = useState(null);

  const apiCallMemo = useMemo(() => api, []);

  const bookRide = useCallback(async (rideRequestData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiCallMemo.post('/rides/request', rideRequestData);
      
      if (response.success) {
        setRideData(response.data.ride);
        return { success: true, ride: response.data.ride };
      } else {
        const errorMsg = response.error || 'Failed to book ride';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      const errorMessage = err.error || err.message || 'Network error';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [apiCallMemo]);

  const cancelRide = useCallback(async (rideId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiCallMemo.post(`/rides/${rideId}/cancel`);
      
      if (response.success) {
        setRideData(null);
        return { success: true };
      } else {
        const errorMsg = response.error || 'Failed to cancel ride';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      const errorMessage = err.error || err.message || 'Network error';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [apiCallMemo]);

  const getRideHistory = useCallback(async (type = 'all', page = 1, limit = 10) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiCallMemo.get(`/rides/history/${type}?page=${page}&limit=${limit}`);
      
      if (response.success) {
        return { success: true, data: response.data };
      } else {
        const errorMsg = response.error || 'Failed to fetch ride history';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      const errorMessage = err.error || err.message || 'Network error';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [apiCallMemo]);

  const rateRide = useCallback(async (rideId, rating, comment = '') => {
    setLoading(true);
    setError(null);

    try {
      if (!rating || rating < 1 || rating > 5) {
        throw new Error('Rating must be between 1 and 5');
      }

      const response = await apiCallMemo.post(`/rides/${rideId}/rate`, { rating, comment });
      
      if (response.success) {
        return { success: true };
      } else {
        const errorMsg = response.error || 'Failed to submit rating';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      const errorMessage = err.error || err.message || 'Network error';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [apiCallMemo]);

  return {
    loading,
    error,
    rideData,
    bookRide,
    cancelRide,
    getRideHistory,
    rateRide
  };
};

export default useRide;