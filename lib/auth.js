import { SignJWT, jwtVerify } from 'jose';

function getEncodedKey() {
  const secretKey = process.env.JWT_SECRET_KEY || 'default-secret-key-min-32-characters-long';
  return new TextEncoder().encode(secretKey);
}

export async function signToken(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getEncodedKey());
}

export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, getEncodedKey(), {
      algorithms: ['HS256'],
    });
    return payload;
  } catch (error) {
    console.error('Token verification error:', error.message);
    return null;
  }
}
