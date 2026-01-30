// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './contexts/AuthContext'
import { WebSocketProvider } from './contexts/WebSocketProvider'  // ✅ Updated import
import { RideProvider } from './contexts/RideContext'
import { LocationProvider } from './contexts/LocationContext'
import { PaymentProvider } from './contexts/PaymentContext'
import { NotificationProvider } from './contexts/NotificationContext'
import { ThemeProvider } from './contexts/ThemeContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <WebSocketProvider>  {/* ✅ Updated */}
          <RideProvider>
            <LocationProvider>
              <PaymentProvider>
                <NotificationProvider>
                  <App />
                </NotificationProvider>
              </PaymentProvider>
            </LocationProvider>
          </RideProvider>
        </WebSocketProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>,
)