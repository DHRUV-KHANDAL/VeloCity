// src/hooks/useWebSocket.js
// Purpose: Custom hook to use WebSocket context
// Type: Custom Hook
// Exports: useWebSocket hook only

import { useContext } from 'react';
import { WebSocketContext } from '../contexts/WebSocketContext';

const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  
  return context;
};

export default useWebSocket;
export { useWebSocket };