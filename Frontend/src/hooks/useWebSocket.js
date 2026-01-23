// src/hooks/useWebSocket.js
import { useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";
import useAuth from "./useAuth";
import { WS_URL } from "../utils/constants.js";

export const useWebSocket = (url = null) => {
  // Always call useAuth - never conditionally call hooks
  const auth = useAuth();
  const user = auth?.user;

  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const [error, setError] = useState(null);
  const [rideAccepted, setRideAccepted] = useState(null);
  const [driverLocationUpdated, setDriverLocationUpdated] = useState(null);
  const [rideStatusUpdated, setRideStatusUpdated] = useState(null);

  const socketRef = useRef(null);
  const wsUrl = url || WS_URL;

  // Send message function
  const sendMessage = useCallback((event, data) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
      console.log(`📤 Sent: ${event}`, data);
    } else {
      console.warn("Socket not connected, cannot send message");
      setError("Not connected to server");
    }
  }, []);

  // Broadcast new ride
  const broadcastNewRide = useCallback(
    (rideData) => {
      sendMessage("new_ride_request", rideData);
    },
    [sendMessage],
  );

  // Join ride room
  const joinRide = useCallback((rideId) => {
    if (rideId && socketRef.current?.connected) {
      socketRef.current.emit("join_ride", { rideId });
      console.log(`✅ Joined ride room: ${rideId}`);
    }
  }, []);

  // Update rider location
  const updateRiderLocation = useCallback(
    (userId, location, rideId) => {
      sendMessage("update_rider_location", {
        userId,
        location,
        rideId,
      });
    },
    [sendMessage],
  );

  // Initialize Socket.io connection
  useEffect(() => {
    console.log("🔌 Initializing Socket.io connection to", wsUrl);

    try {
      const socket = io(wsUrl, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        transports: ["websocket", "polling"],
        auth: user?.id
          ? {
              userId: user.id,
              role: user.role,
            }
          : undefined,
      });

      socketRef.current = socket;

      // Connection events
      socket.on("connect", () => {
        console.log("✅ Socket.io connected:", socket.id);
        setIsConnected(true);
        setError(null);

        // Notify server about user connection if authenticated
        if (user?.id) {
          socket.emit("user_connected", {
            userId: user.id,
            role: user.role,
          });
        }
      });

      // Listen for ride acceptance
      socket.on("ride_accepted", (data) => {
        console.log("✅ Ride accepted event received:", data);
        setRideAccepted(data);
      });

      // Listen for driver location updates
      socket.on("driver_location_updated", (data) => {
        console.log("📍 Driver location update received:", data);
        setDriverLocationUpdated(data);
      });

      // Listen for ride status updates
      socket.on("ride_status_updated", (data) => {
        console.log("📊 Ride status update received:", data);
        setRideStatusUpdated(data);
      });

      // Listen for new ride available
      socket.on("new_ride_available", (data) => {
        console.log("🚗 New ride available event received:", data);
      });

      // Listen for errors
      socket.on("error", (error) => {
        console.error("❌ Socket error:", error);
        setError(error?.message || "Connection error");
      });

      // Connection error
      socket.on("connect_error", (error) => {
        console.error("❌ Connection error:", error.message);
        setError(error.message);
      });

      // Disconnection
      socket.on("disconnect", (reason) => {
        console.log("❌ Socket disconnected:", reason);
        setIsConnected(false);
      });

      // Reconnection attempts
      socket.on("reconnect_attempt", () => {
        console.log("🔄 Attempting to reconnect...");
      });

      socket.on("reconnect", () => {
        console.log("✅ Reconnected successfully");
        setIsConnected(true);
        setError(null);

        // Re-authenticate after reconnect
        socket.emit("user_connected", {
          userId: user.id,
          role: user.role,
        });
      });

      return () => {
        if (socket) {
          socket.disconnect();
          console.log("🔌 Socket disconnected");
        }
      };
    } catch (err) {
      console.error("Error initializing Socket.io:", err);
      setError(err.message);
    }
  }, [wsUrl]);

  return {
    isConnected,
    lastMessage,
    error,
    rideAccepted,
    driverLocationUpdated,
    rideStatusUpdated,
    sendMessage,
    broadcastNewRide,
    joinRide,
    updateRiderLocation,
    connect: () => socketRef.current?.connect(),
    disconnect: () => socketRef.current?.disconnect(),
  };
};

export default useWebSocket;
