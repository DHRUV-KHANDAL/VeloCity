// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import AuthProvider from './contexts/AuthProvider'
import NotificationProvider from './contexts/NotificationProvider'
import WebSocketProvider from './contexts/WebSocketProvider'
import RideProvider from './contexts/RideProvider'
import LocationProvider from './contexts/LocationProvider'
import PaymentProvider from './contexts/PaymentProvider'
import ThemeProvider from './contexts/ThemeProvider'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <WebSocketProvider>
            <RideProvider>
              <LocationProvider>
                <PaymentProvider>
                  <App />
                </PaymentProvider>
              </LocationProvider>
            </RideProvider>
          </WebSocketProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>,
)