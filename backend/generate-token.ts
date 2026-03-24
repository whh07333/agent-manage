import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const payload = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'admin@example.com',
  role: 'admin'
};

const secret = process.env.JWT_SECRET || 'test-jwt-secret-change-in-production';
const token = jwt.sign(payload, secret, { expiresIn: '7d' });

console.log('Generated token for user 00000000-0000-0000-0000-000000000001:');
console.log(token);
console.log('\nExpires in: 7 days');
