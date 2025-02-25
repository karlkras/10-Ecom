import startDb from "./db/connect.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import {
  createAuthError,
  createBadRequestError
} from "./errors/custom-error.js";
dotenv.config();

export const MongoSeeder = class {
  constructor(mongoModel, seedJson, mongoUri) {
    this.mongoModel = mongoModel;
    this.mongoUri = mongoUri;
    this.seedJson = seedJson;
  }
  async run() {
    try {
      await startDb(this.mongoUri);
      await this.mongoModel.deleteMany();
      await this.mongoModel.create(this.seedJson);
      console.log("wahoo!");
      process.exit(0);
    } catch (err) {
      console.error(`Bad bad, ${err}`);
      process.exit(1);
    }
  }
};

export const MongoDBStatusCodes = Object.freeze({
  DUPLICATE: 11000
});

export const EMAIL_REGX =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export const generateToken = ({ _id, name, role }) => {
  return jwt.sign({ _id, name, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_TOKEN_EXPIRATION
  });
};

export const comparePasswords = async (
  providedPassword,
  registeredPassword
) => {
  return await bcrypt.compare(providedPassword, registeredPassword);
};

export const isTokenValid = ({ token }) =>
  jwt.verify(token, process.env.JWT_SECRET);

export const attachCookiesToResponse = ({ name, res, user }) => {
  const token = generateToken(user);
  const oneDay = 1000 * 60 * 60 * 24;
  res.cookie(name, token, {
    httpOnly: true,
    expires: new Date(Date.now() + oneDay),
    secure: process.env.NODE_ENV === "production",
    signed: true
  });
};

export const clearCookiesToResponse = ({ name, res }) => {
  const token = "";
  res.cookie(name, token, {
    httpOnly: true,
    expires: new Date(Date.now()),
    secure: process.env.NODE_ENV === "production",
    signed: true
  });
};

export const checkPermissions = (requestUser, resourceUserId) => {
  if (requestUser.role === "admin") return;
  if (requestUser.userId === resourceUserId.toString()) return;
  throw createAuthError("not authorized to access this route");
};

export const fileValidation = ({ request, fileName }) => {
  if (!request.files) {
    throw createBadRequestError("File is required to be provided");
  }
  const productFile = request.files[fileName];
  if (!productFile.mimetype.startsWith("image")) {
    throw createBadRequestError("Please upload an image");
  }

  if (productFile.size > Number(process.env.MAX_IMAGE_UPLOAD_SIZE)) {
    throw createBadRequestError("Image size is too large.");
  }
};
