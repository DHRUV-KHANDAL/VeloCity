// src/hooks/useRide.js
import { useState, useCallback } from 'react';
import  useAuth  from './useAuth';
import toast from 'react-hot-toast';

const useRide = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { apiCall } = useAuth();

  const bookRide = useCallback(async (rideData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiCall('POST', '/rides/request', rideData);
      
      if (response.success) {
        toast.success('Ride booked successfully!');
        return { success: true, ride: response.data.ride };
      } else {
        toast.error(response.error || 'Failed to book ride');
        return { success: false, error: response.error };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Network error';
      toast.error(errorMessage);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  const cancelRide = useCallback(async (rideId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiCall('POST', `/rides/${rideId}/cancel`);
      
      if (response.success) {
        toast.success('Ride cancelled successfully');
        return { success: true };
      } else {
        toast.error(response.error || 'Failed to cancel ride');
        return { success: false, error: response.error };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Network error';
      toast.error(errorMessage);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  const getRideHistory = useCallback(async (type = 'all', page = 1, limit = 10) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiCall('GET', `/rides/history/${type}?page=${page}&limit=${limit}`);
      
      if (response.success) {
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.error };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Network error';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  const rateRide = useCallback(async (rideId, rating, comment = '') => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiCall('POST', `/rides/${rideId}/rate`, { rating, comment });
      
      if (response.success) {
        toast.success('Rating submitted successfully!');
        return { success: true };
      } else {
        toast.error(response.error || 'Failed to submit rating');
        return { success: false, error: response.error };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Network error';
      toast.error(errorMessage);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  return {
    loading,
    error,
    bookRide,
    cancelRide,
    getRideHistory,
    rateRide
  };
};

export default useRide;