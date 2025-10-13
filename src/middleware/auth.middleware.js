import { jwttoken } from '#utils/jwt.js';
import logger from '#config/logger.js';

export const authenticateToken = async (req, res, next) => {
  try {
    const token =
      req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res
        .status(401)
        .json({ error: 'Access denied', message: 'No token provided' });
    }

    const decoded = jwttoken.verify(token);
    req.user = decoded;
    next();
  } catch (e) {
    logger.error('Authentication error', e);
    return res
      .status(401)
      .json({ error: 'Access denied', message: 'Invalid token' });
  }
};

export const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res
      .status(403)
      .json({ error: 'Forbidden', message: 'Admin access required' });
  }
  next();
};
