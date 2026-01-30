// src/contexts/PaymentContext.jsx
import React, { createContext, useState, useCallback } from 'react';

export const PaymentContext = createContext();

export const PaymentProvider = ({ children }) => {
  const [walletBalance, setWalletBalance] = useState(0);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);

  const updateWalletBalance = useCallback((balance) => {
    setWalletBalance(balance);
  }, []);

  const addPaymentMethod = useCallback((method) => {
    setPaymentMethods(prev => [...prev, method]);
  }, []);

  const addTransaction = useCallback((transaction) => {
    setTransactionHistory(prev => [transaction, ...prev]);
  }, []);

  const value = {
    walletBalance,
    paymentMethods,
    transactionHistory,
    selectedPaymentMethod,
    updateWalletBalance,
    addPaymentMethod,
    setSelectedPaymentMethod,
    addTransaction
  };

  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  );
};

export default PaymentContext;