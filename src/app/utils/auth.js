import jwt from "jsonwebtoken";

const secretKey = process.env.JWT_SECRET_KEY;

export function generateToken(user) {
  return jwt.sign({ id: user._id }, secretKey, { expiresIn: "1d" });
}
export function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, secretKey);
    return decoded;
  } catch (error) {
    console.error("Token verification failed:", error.message);
    return null;
  }
}
