import { StatusCodes } from "http-status-codes";
import {
  comparePasswords,
  attachCookiesToResponse,
  clearCookiesToResponse
} from "../utils.js";
import UserModel from "../models/User.js";
import {
  createAuthError,
  createBadRequestError
} from "../errors/custom-error.js";

export const loginUser = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw createBadRequestError(
      "Password and email are required to login, try again"
    );
  }
  const user = await UserModel.findOne({ email });
  if (!user) {
    throw createAuthError("User not found");
  }
  if (await comparePasswords(password, user.password)) {
    attachCookiesToResponse({ name: "token", res, user });

    res.status(StatusCodes.OK).json({
      user: { name: user.name, userId: user._id, role: user.role }
    });
  } else {
    throw createAuthError("login failure");
  }
};

export const registerUser = async (req, res, next) => {
  const { name, email, password } = req.body;
  //first check if user already exists...
  let user = await UserModel.findOne({ email });
  if (user) {
    throw createAuthError("User already exists.");
  }

  user = await UserModel.create({ name, email, password });
  attachCookiesToResponse({ name: "token", res, user });

  res.status(StatusCodes.CREATED).json({
    user: { name: user.name, userId: user._id, role: user.role }
  });
};

export const logoutUser = async (req, res) => {
  clearCookiesToResponse({ name: "token", res });
  res.status(StatusCodes.OK).send("logout user");
};
