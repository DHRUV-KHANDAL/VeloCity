// src/hooks/usePayment.js
import { useContext } from 'react';
import { PaymentContext } from '../contexts/PaymentContext.jsx';

const usePayment = () => {
  const context = useContext(PaymentContext);
  
  if (!context) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  
  return context;
};

export default usePayment;
export { usePayment };