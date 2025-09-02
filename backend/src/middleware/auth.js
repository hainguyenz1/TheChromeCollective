const jwt = require('jsonwebtoken');
const https = require('https');

// Auth0 configuration
const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;
const AUTH0_AUDIENCE = process.env.AUTH0_AUDIENCE;

// Simple function to get signing key without jwks-client
function getKey(header, callback) {
  const jwksUri = `https://${AUTH0_DOMAIN}/.well-known/jwks.json`;
  
  https.get(jwksUri, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      try {
        const jwks = JSON.parse(data);
        const key = jwks.keys.find(k => k.kid === header.kid);
        if (key) {
          const signingKey = key.x5c ? `-----BEGIN CERTIFICATE-----\n${key.x5c[0]}\n-----END CERTIFICATE-----` : key.n;
          callback(null, signingKey);
        } else {
          callback(new Error('Unable to find a signing key that matches'));
        }
      } catch (error) {
        callback(error);
      }
    });
  }).on('error', (error) => {
    callback(error);
  });
}

// JWT verification middleware
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ 
      error: 'Access denied. No token provided.' 
    });
  }

  // Extract token from "Bearer <token>" format
  const bearerToken = token.split(' ')[1];
  
  if (!bearerToken) {
    return res.status(401).json({ 
      error: 'Access denied. Invalid token format.' 
    });
  }

  // Verify JWT - handle both ID tokens and access tokens
  const verifyOptions = {
    issuer: `https://${AUTH0_DOMAIN}/`,
    algorithms: ['RS256']
  };

  // Only add audience if it's defined
  if (AUTH0_AUDIENCE) {
    verifyOptions.audience = AUTH0_AUDIENCE;
  }

  jwt.verify(bearerToken, getKey, verifyOptions, (err, decoded) => {
    if (err) {
      console.error('JWT verification error:', err);
      return res.status(401).json({ 
        error: 'Access denied. Invalid token.' 
      });
    }

    // Add user info to request object
    req.user = {
      auth0Id: decoded.sub,
      email: decoded.email,
      username: decoded.nickname || decoded.email.split('@')[0]
    };

    next();
  });
};

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    req.user = null;
    return next();
  }

  const bearerToken = token.split(' ')[1];
  
  if (!bearerToken) {
    req.user = null;
    return next();
  }

  const verifyOptions = {
    issuer: `https://${AUTH0_DOMAIN}/`,
    algorithms: ['RS256']
  };

  // Only add audience if it's defined
  if (AUTH0_AUDIENCE) {
    verifyOptions.audience = AUTH0_AUDIENCE;
  }

  jwt.verify(bearerToken, getKey, verifyOptions, (err, decoded) => {
    if (err) {
      req.user = null;
    } else {
      req.user = {
        auth0Id: decoded.sub,
        email: decoded.email,
        username: decoded.nickname || decoded.email.split('@')[0]
      };
    }
    next();
  });
};

module.exports = {
  verifyToken,
  optionalAuth
};
