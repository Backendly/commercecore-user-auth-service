const jwt = require('jsonwebtoken');

const decodeToken = (token) => {
  try {
    const decoded = jwt.decode(token, { complete: true });
    return decoded;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

const isTokenExpired = (token) => {
  const decoded = decodeToken(token);
  if (!decoded) {
    return true;
  }
  const exp = decoded.payload.exp;
  const currentTime = Math.floor(Date.now() / 1000);
  return exp < currentTime;
};

module.exports = {
  decodeToken,
  isTokenExpired,
};