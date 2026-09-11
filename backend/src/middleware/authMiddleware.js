const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  let token;

  // Check if the request header contains an authorization token
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract the token from the string
      token = req.headers.authorization.split(' ')[1];

      // Verify the token using your secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach the user information to the request object
      req.user = decoded;

      // Proceed to the requested route
      next();
    } catch (error) {
      console.error('Token verification error:', error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

module.exports = { protect };