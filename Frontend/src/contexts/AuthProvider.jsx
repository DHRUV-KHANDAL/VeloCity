// src/contexts/AuthProvider.jsx
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { AuthContext } from "./AuthContext";

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const initializeRef = useRef(false);

  // Initialize auth on mount only
  useEffect(() => {
    if (initializeRef.current) return; // Prevent multiple initializations in strict mode
    initializeRef.current = true;

    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        const baseURL =
          import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

        if (token) {
          const response = await axios.get(`${baseURL}/auth/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.data.success) {
            setUser(response.data.data.user);
          } else {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setUser(null);
          }
        } else {
          // No token, user is not authenticated
          setUser(null);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const baseURL =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
      const response = await axios.post(`${baseURL}/auth/login`, {
        email,
        password,
      });

      if (response.data.success) {
        const { token, user } = response.data.data;
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        setUser(user);
        toast.success("Login successful!");
        return { success: true, user };
      } else {
        toast.error(response.data.error || "Login failed");
        return { success: false, error: response.data.error };
      }
    } catch (error) {
      toast.error("An error occurred during login");
      return {
        success: false,
        error: error.response?.data?.error || "Login failed",
      };
    }
  };

  const register = async (userData) => {
    try {
      const baseURL =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
      const response = await axios.post(`${baseURL}/auth/register`, userData);

      if (response.data.success) {
        const { token, user } = response.data.data;
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        setUser(user);
        toast.success("Registration successful!");
        return { success: true, user };
      } else {
        toast.error(response.data.error || "Registration failed");
        return { success: false, error: response.data.error };
      }
    } catch (error) {
      toast.error("An error occurred during registration");
      return {
        success: false,
        error: error.response?.data?.error || "Registration failed",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    toast.success("Logged out successfully");
  };

  const apiCall = async (method, url, data = null) => {
    try {
      const baseURL =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
      const token = localStorage.getItem("token");
      const config = {
        method,
        url: `${baseURL}${url}`,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };

      if (data) {
        config.data = data;
      }

      const response = await axios(config);
      return response.data;
    } catch (error) {
      console.error("API call error:", error);
      toast.error("An error occurred during the API call");
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        loading,
        apiCall,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
