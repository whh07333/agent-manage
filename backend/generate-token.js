const jwt = require('jsonwebtoken');
require('dotenv').config();

const secret = process.env.JWT_SECRET || 'test-jwt-secret-change-in-production';
const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

const token = jwt.sign({
  id: 1,
  role: 'admin',
  email: 'admin@example.com',
}, secret, { expiresIn });

console.log('New generated token:');
console.log(token);
