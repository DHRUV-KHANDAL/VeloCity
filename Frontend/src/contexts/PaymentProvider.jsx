// src/contexts/PaymentProvider.jsx
import React, { useState, useCallback, createContext, useContext } from 'react';

const PaymentContext = createContext();

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
};

export const PaymentProvider = ({ children }) => {
  const [walletBalance, setWalletBalance] = useState(0);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const updateWalletBalance = useCallback((amount) => {
    setWalletBalance(prev => prev + amount);
  }, []);

  const addPaymentMethod = useCallback((method) => {
    setPaymentMethods(prev => [...prev, method]);
  }, []);

  const addTransaction = useCallback((transaction) => {
    setTransactions(prev => [transaction, ...prev]);
  }, []);

  const value = {
    walletBalance,
    paymentMethods,
    transactions,
    updateWalletBalance,
    addPaymentMethod,
    addTransaction
  };

  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  );
};

export default PaymentProvider;