import jwt from 'jsonwebtoken';

export const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    console.log('Authenticate: No token provided');
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log('Authenticate: Invalid token', err.message);
      return res.status(401).json({ message: 'Invalid token' });
    }
    console.log('Authenticate: Decoded token:', decoded);
    req.user = decoded;
    console.log('Authenticate: User attached to request:', req.user);
    next();
  });
};

export const adminMiddleware = (roles = ['admin']) => {
  return (req, res, next) => {
    console.log('AdminMiddleware: Checking user role...');
    console.log('AdminMiddleware: req.user:', req.user);
    
    if (!req.user) {
      console.log('AdminMiddleware: No user found in request');
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      console.log('AdminMiddleware: Access denied. User role:', req.user.role);
      return res.status(403).json({ message: 'Access denied' });
    }

    console.log('AdminMiddleware: Access granted for role:', req.user.role);
    next();
  };
};