import {
  createAuthError,
  createForbiddnError
} from "../errors/custom-error.js";
import jwToken from "jsonwebtoken";
import { isTokenValid } from "../utils.js";
import dotenv from "dotenv";

dotenv.config();

export const authenticateUser = async (req, res, next) => {
  const token = req.signedCookies.token;
  if (!token) {
    throw createAuthError("Access Error");
  }
  try {
    const { name, _id: userId, role } = isTokenValid({ token });
    req.user = { name, userId, role };
  } catch (err) {
    throw createAuthError("Access Error");
  }
  next();
};

export const authorizePermission = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw createForbiddnError("Access forbidden");
    }
    next();
  };
};
