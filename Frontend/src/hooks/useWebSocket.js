// src/hooks/useWebSocket.js
import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useAuth } from './useAuth';
import { WS_URL } from '../utils/constants.js';

export const useWebSocket = () => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const [error, setError] = useState(null);
  const wsRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef(null);
  const setupWebSocketRef = useRef(null);
  const isInitialMount = useRef(true);

  // ✅ FIX: Memoize constants to prevent recreation
  const wsConfig = useMemo(() => ({
    maxReconnectAttempts: 5,
    initialReconnectDelay: 3000
  }), []);

  // ✅ FIX: Memoize user ID and role separately
  const userId = useMemo(() => user?.id, [user?.id]);
  const userRole = useMemo(() => user?.role, [user?.role]);

  // ✅ FIX: Define sendMessage first (no dependencies on connect)
  const sendMessage = useCallback((message) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify(message));
        console.log('📤 Sent:', message.type);
      } catch (err) {
        console.error('❌ Failed to send message:', err);
      }
    } else {
      console.warn('⚠️ WebSocket not connected');
    }
  }, []);

  // ✅ FIX: Define setupWebSocket with correct dependencies
  const setupWebSocket = useCallback((url) => {
    try {
      console.log('📡 Attempting WebSocket connection:', url.split('?')[0] + '?token=***');
      
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('✅ WebSocket connected successfully');
        setIsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;
        
        sendMessage({
          type: 'authenticate',
          timestamp: Date.now()
        });
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('📨 Received:', data.type);
          setLastMessage(data);
        } catch (err) {
          console.error('❌ Failed to parse message:', err);
        }
      };

      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        setIsConnected(false);
        setError('Connection error');
      };

      ws.onclose = (event) => {
        console.log(`🔌 WebSocket closed - Code: ${event.code}, Reason: ${event.reason}`);
        setIsConnected(false);

        // ✅ FIX: Reconnect logic inside onclose handler
        if (event.code !== 1000 && reconnectAttemptsRef.current < wsConfig.maxReconnectAttempts) {
          reconnectAttemptsRef.current += 1;
          const delay = wsConfig.initialReconnectDelay * reconnectAttemptsRef.current;
          console.log(`🔄 Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current}/${wsConfig.maxReconnectAttempts})`);

          reconnectTimeoutRef.current = setTimeout(() => {
            if (setupWebSocketRef.current && userId) {
              const token = localStorage.getItem('token');
              const wsUrl = `${WS_URL || 'ws://localhost:5000'}?token=${token}&userId=${userId}&role=${userRole}`;
              setupWebSocketRef.current(wsUrl);
            }
          }, delay);
        }
      };
    } catch (err) {
      console.error('❌ Error creating WebSocket:', err);
      setIsConnected(false);
      setError(err.message);
    }
  }, [sendMessage, wsConfig, userId, userRole]); // ✅ FIXED: Correct dependencies

  // ✅ FIX: Update ref after setupWebSocket is defined
  useEffect(() => {
    setupWebSocketRef.current = setupWebSocket;
  }, [setupWebSocket]);

  // ✅ FIX: Connect function
  const connect = useCallback(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.warn('⚠️ No authentication token available');
      return;
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('ℹ️ WebSocket already connected');
      return;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    const wsUrl = `${WS_URL || 'ws://localhost:5000'}?token=${token}&userId=${userId}&role=${userRole}`;
    setupWebSocket(wsUrl);
  }, [userId, userRole, setupWebSocket]);

  // ✅ FIX: Disconnect function
  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close(1000, 'User initiated disconnect');
      wsRef.current = null;
      setIsConnected(false);
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    reconnectAttemptsRef.current = 0;
    console.log('🛑 WebSocket disconnected');
  }, []);

  // ✅ FIX: Initialization effect - avoid setState in effect
  useEffect(() => {
    // Only run once on mount
    if (isInitialMount.current === false) {
      return;
    }
    isInitialMount.current = false;

    const token = localStorage.getItem('token');
    if (token && userId) {
      // Use setTimeout to break synchronous call chain
      const timer = setTimeout(() => {
        connect();
      }, 0);

      return () => clearTimeout(timer);
    }
  }, [userId, connect]);

  // ✅ FIX: Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    lastMessage,
    error,
    sendMessage,
    connect,
    disconnect,
    reconnect: connect
  };
};

export default useWebSocket;