// Frontend Constants
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
export const WS_URL = import.meta.env.VITE_WS_URL || "http://localhost:5000";

export const USER_ROLES = {
  RIDER: "rider",
  DRIVER: "driver",
  ADMIN: "admin",
};

export const RIDE_STATUS = {
  REQUESTED: "requested",
  ACCEPTED: "accepted",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

export const VEHICLE_TYPES = {
  CAR: "car",
  BIKE: "bike",
  AUTO: "auto",
  SUV: "suv",
};
