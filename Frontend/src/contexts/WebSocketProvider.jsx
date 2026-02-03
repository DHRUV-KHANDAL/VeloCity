// src/contexts/WebSocketProvider.jsx
import React, { useState, useEffect, useRef, useCallback, createContext, useContext } from 'react';

const WebSocketContext = createContext(null);

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

export const WebSocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  
  const wsRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef(null);
  const setupWebSocketRef = useRef(null);
  const isInitialMount = useRef(true);

  const maxReconnectAttempts = 5;
  const initialReconnectDelay = 3000;

  const handleReconnect = useCallback((token) => {
    if (reconnectAttemptsRef.current < maxReconnectAttempts && setupWebSocketRef.current) {
      reconnectAttemptsRef.current += 1;
      const delay = initialReconnectDelay * Math.pow(2, reconnectAttemptsRef.current - 1);
      
      console.log(`🔄 Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);
      
      reconnectTimeoutRef.current = setTimeout(() => {
        if (setupWebSocketRef.current && token) {
          const wsUrl = `${import.meta.env.VITE_WS_URL || 'ws://localhost:5000'}?token=${token}`;
          setupWebSocketRef.current(wsUrl);
        }
      }, delay);
    }
  }, [maxReconnectAttempts, initialReconnectDelay]);

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
        setError('Connection error');
      };

      ws.onclose = (event) => {
        console.log(`🔌 WebSocket closed - Code: ${event.code}, Reason: ${event.reason}`);
        setIsConnected(false);

        if (event.code !== 1000 && event.code !== 1001) {
          const token = localStorage.getItem('token');
          if (token) {
            handleReconnect(token);
          }
        }
      };
    } catch (err) {
      console.error('❌ Error creating WebSocket:', err);
      setIsConnected(false);
      setError(err.message);
    }
  }, [handleReconnect]);

  useEffect(() => {
    setupWebSocketRef.current = setupWebSocket;
  }, [setupWebSocket]);

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

    const wsUrl = `${import.meta.env.VITE_WS_URL || 'ws://localhost:5000'}?token=${token}`;
    setupWebSocket(wsUrl);
  }, [setupWebSocket]);

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

  useEffect(() => {
    if (!isInitialMount.current) {
      return;
    }

    isInitialMount.current = false;

    const token = localStorage.getItem('token');
    if (token) {
      const connectionTimer = setTimeout(() => {
        connect();
      }, 500);

      return () => clearTimeout(connectionTimer);
    }
  }, [connect]);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  const sendMessage = useCallback((msg) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify(msg));
        console.log('📤 Sent:', msg.type);
      } catch (err) {
        console.error('❌ Failed to send message:', err);
      }
    } else {
      console.warn('⚠️ WebSocket not connected. Message queued:', msg.type);
    }
  }, []);

  const value = {
    isConnected,
    message,
    sendMessage,
    connect,
    disconnect,
    reconnect: connect,
    error
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

export default WebSocketProvider;