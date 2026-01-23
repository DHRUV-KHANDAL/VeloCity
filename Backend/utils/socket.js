import Ride from "../models/Ride.js";
import User from "../models/User.js";

const setupSocket = (io) => {
  // Store active rides to manage room subscriptions
  const activeRides = new Map();

  // Allow connections without auth (auth happens in user_connected event)
  io.on("connection", (socket) => {
    console.log("✅ WebSocket connected:", socket.id);

    // Join user to their personal room
    socket.on("user_connected", (data) => {
      const { userId, role } = data;
      socket.join(`user_${userId}`);
      socket.join(`${role}_list`);
      console.log(`User ${userId} (${role}) joined their room`);
    });

    // Driver goes online/offline
    socket.on("driver_online", async (driverId) => {
      try {
        await User.findByIdAndUpdate(driverId, {
          "driverInfo.isOnline": true,
        });
        socket.join("drivers_online");
        io.emit("driver_status_change", { driverId, isOnline: true });
        console.log(`Driver ${driverId} is now online`);
      } catch (error) {
        console.error("Error setting driver online:", error);
      }
    });

    socket.on("driver_offline", async (driverId) => {
      try {
        await User.findByIdAndUpdate(driverId, {
          "driverInfo.isOnline": false,
        });
        socket.leave("drivers_online");
        io.emit("driver_status_change", { driverId, isOnline: false });
        console.log(`Driver ${driverId} is now offline`);
      } catch (error) {
        console.error("Error setting driver offline:", error);
      }
    });

    // New ride request - broadcast to all online drivers
    socket.on("new_ride_request", async (rideData) => {
      try {
        console.log("Broadcasting new ride request:", rideData);
        // Broadcast to all drivers
        io.to("driver_list").emit("new_ride_available", {
          rideId: rideData.rideId,
          rider: rideData.rider,
          pickupLocation: rideData.pickupLocation,
          fare: rideData.fare,
          rideType: rideData.rideType,
        });
      } catch (error) {
        console.error("Error handling new ride request:", error);
      }
    });

    // Driver accepts ride
    socket.on("accept_ride", async (data) => {
      try {
        const { rideId, driverId } = data;

        // Update ride with driver
        const ride = await Ride.findByIdAndUpdate(
          rideId,
          {
            driver: driverId,
            status: "accepted",
          },
          { new: true },
        )
          .populate("rider", "name email phone")
          .populate("driver", "name email phone vehicle");

        if (!ride) {
          socket.emit("error", { message: "Ride not found" });
          return;
        }

        // Store active ride
        activeRides.set(rideId, { riderId: ride.rider._id, driverId });

        // Create room for this ride
        socket.join(`ride_${rideId}`);

        // Notify rider
        io.to(`user_${ride.rider._id}`).emit("ride_accepted", {
          ride,
          driver: ride.driver,
        });

        // Notify all drivers that this ride is taken
        io.to("driver_list").emit("ride_taken", { rideId });

        console.log(`Driver ${driverId} accepted ride ${rideId}`);
      } catch (error) {
        console.error("Error accepting ride:", error);
        socket.emit("error", { message: "Error accepting ride" });
      }
    });

    // Location tracking - driver sends live location
    socket.on("update_location", (data) => {
      const { userId, location, rideId } = data;

      if (rideId && activeRides.has(rideId)) {
        // Broadcast driver location to rider
        io.to(`ride_${rideId}`).emit("driver_location_updated", {
          userId,
          location,
          timestamp: new Date(),
        });
      }
    });

    // Rider sends pickup location
    socket.on("update_rider_location", (data) => {
      const { userId, location, rideId } = data;

      if (rideId && activeRides.has(rideId)) {
        // Broadcast rider location to driver
        io.to(`ride_${rideId}`).emit("rider_location_updated", {
          userId,
          location,
          timestamp: new Date(),
        });
      }
    });

    // Ride status updates
    socket.on("update_ride_status", async (data) => {
      const { rideId, status } = data;

      try {
        const ride = await Ride.findByIdAndUpdate(
          rideId,
          { status },
          { new: true },
        )
          .populate("rider", "name email phone")
          .populate("driver", "name email phone");

        // Notify both rider and driver
        io.to(`ride_${rideId}`).emit("ride_status_changed", {
          rideId,
          status,
          ride,
        });

        if (status === "completed" || status === "cancelled") {
          activeRides.delete(rideId);
        }

        console.log(`Ride ${rideId} status updated to ${status}`);
      } catch (error) {
        console.error("Error updating ride status:", error);
      }
    });

    // Join ride room (for tracking location updates)
    socket.on("join_ride", (rideId) => {
      socket.join(`ride_${rideId}`);
      console.log(`Socket joined ride room: ${rideId}`);
    });

    // Leave ride room
    socket.on("leave_ride", (rideId) => {
      socket.leave(`ride_${rideId}`);
      console.log(`Socket left ride room: ${rideId}`);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};

export default setupSocket;
