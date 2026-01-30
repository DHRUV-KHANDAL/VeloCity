// src/contexts/WebSocketProvider.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { WebSocketContext } from './WebSocketContext';

export const WebSocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [message, setMessage] = useState(null);
  const wsRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimeoutRef = useRef(null);
  const isInitialMount = useRef(true);
  const hasInitialized = useRef(false);
  const setupWebSocketRef = useRef(null); // ✅ NEW: Store reference to setupWebSocket
  
  const maxReconnectAttempts = 5;
  const initialReconnectDelay = 3000;

  // ✅ FIX: Define reconnect logic separately to avoid circular reference
  const handleReconnect = useCallback((token) => {
    if (reconnectAttempts.current < maxReconnectAttempts && setupWebSocketRef.current) {
      reconnectAttempts.current += 1;
      const delay = initialReconnectDelay * Math.pow(2, reconnectAttempts.current - 1);
      
      console.log(`🔄 Reconnecting in ${delay}ms (attempt ${reconnectAttempts.current}/${maxReconnectAttempts})`);
      
      reconnectTimeoutRef.current = setTimeout(() => {
        if (setupWebSocketRef.current && token) {
          const wsUrl = `${import.meta.env.VITE_WS_URL || 'ws://localhost:5000'}?token=${token}`;
          setupWebSocketRef.current(wsUrl);
        }
      }, delay);
    } else if (reconnectAttempts.current >= maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached. Please refresh the page.');
    }
  }, [maxReconnectAttempts, initialReconnectDelay]);

  // ✅ FIX: Define setupWebSocket without circular dependency
  const setupWebSocket = useCallback((url) => {
    try {
      console.log('📡 Attempting WebSocket connection:', url.split('?')[0] + '?token=***');
      
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('✅ WebSocket connected successfully');
        setIsConnected(true);
        reconnectAttempts.current = 0;
        
        ws.send(JSON.stringify({
          type: 'authenticate',
          timestamp: Date.now()
        }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('📨 Received:', data.type);
          setMessage(data);
        } catch (err) {
          console.error('❌ Failed to parse message:', err);
        }
      };

      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        setIsConnected(false);
      };

      ws.onclose = (event) => {
        console.log(`🔌 WebSocket closed - Code: ${event.code}, Reason: ${event.reason}`);
        setIsConnected(false);

        if (event.code !== 1000) {
          const token = localStorage.getItem('token');
          if (token) {
            handleReconnect(token);
          }
        }
      };
    } catch (err) {
      console.error('❌ Error creating WebSocket:', err);
      setIsConnected(false);
    }
  }, [handleReconnect]); // ✅ Only depends on handleReconnect, not itself

  // ✅ Update ref after setupWebSocket is defined
  useEffect(() => {
    setupWebSocketRef.current = setupWebSocket;
  }, [setupWebSocket]);

  // ✅ FIX: Connect function
  const connect = useCallback(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.warn('⚠️  No authentication token available');
      return;
    }

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      console.log('ℹ️  WebSocket already connected');
      return;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    const wsUrl = `${import.meta.env.VITE_WS_URL || 'ws://localhost:5000'}?token=${token}`;
    setupWebSocket(wsUrl);
  }, [setupWebSocket]); // ✅ Proper dependency

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

    reconnectAttempts.current = 0;
    console.log('🛑 WebSocket disconnected');
  }, []);

  // ✅ FIX: Send message function
  const sendMessage = useCallback((msg) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify(msg));
        console.log('📤 Sent:', msg.type);
      } catch (err) {
        console.error('❌ Failed to send message:', err);
      }
    } else {
      console.warn('⚠️  WebSocket not connected. Message queued:', msg.type);
    }
  }, []);

  // ✅ FIX: Initialization effect with connect in dependency array
  useEffect(() => {
    if (!isInitialMount.current || hasInitialized.current) {
      return;
    }

    hasInitialized.current = true;
    isInitialMount.current = false;

    const token = localStorage.getItem('token');
    if (token) {
      const connectionTimer = setTimeout(() => {
        connect(); // ✅ Now connect is included in dependencies
      }, 0);

      return () => clearTimeout(connectionTimer);
    }
  }, [connect]); // ✅ FIX: Include connect dependency

  // ✅ FIX: Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  const value = {
    isConnected,
    message,
    sendMessage,
    connect,
    disconnect,
    reconnect: connect
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

export default WebSocketProvider;