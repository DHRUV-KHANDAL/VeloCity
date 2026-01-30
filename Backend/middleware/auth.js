// Backend/src/middleware/auth.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ success: false, error: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ success: false, error: 'Token is not valid' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ success: false, error: 'Token is not valid' });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Admin access required' });
  }
  next();
};

export const driverOnly = (req, res, next) => {
  if (req.user.role !== 'driver') {
    return res.status(403).json({ success: false, error: 'Driver access required' });
  }
  next();
};

export const riderOnly = (req, res, next) => {
  if (req.user.role !== 'rider') {
    return res.status(403).json({ success: false, error: 'Rider access required' });
  }
  next();
};

export default auth;