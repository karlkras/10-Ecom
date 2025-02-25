import { StatusCodes } from "http-status-codes";
import UserModel from "../models/User.js";
import {
  createAuthError,
  createBadRequestError,
  createNotFoundError
} from "../errors/custom-error.js";
import {
  attachCookiesToResponse,
  comparePasswords,
  generateToken,
  checkPermissions
} from "../utils.js";

export const getAllUsers = async (req, res) => {
  const users = await UserModel.find({ role: "user" }).select("-password");
  res.status(StatusCodes.OK).json({ users });
};

export const getSingleUser = async (req, res) => {
  const { id: _id } = req.params;
  const user = await UserModel.findOne({ _id }).select("-password");
  if (!user) {
    throw createNotFoundError("user not found");
  }
  checkPermissions(req.user, user._id);
  res.status(StatusCodes.OK).json(user);
};

export const showCurrentUser = (req, res) => {
  if (!req.user) {
    throw createNotFoundError("no user found");
  }
  res.status(StatusCodes.OK).json({ user: req.user });
};

export const updateUser = async (req, res) => {
  const { name, email } = req.body;
  if (!name && !email) {
    throw createBadRequestError("name and/or email are required");
  }
  const update = { name, email };
  const filter = { _id: req.user.userId };
  const options = { new: true, runValidators: true };
  const user = await UserModel.findOneAndUpdate(filter, update, options);
  const newToken = generateToken(user);
  attachCookiesToResponse({ name: "token", res, user: newToken });
  res
    .status(StatusCodes.OK)
    .json({ _id: user._id, email: user.email, name: user.name });
};

export const updateUserPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    throw createBadRequestError("Old Password and New Password are required");
  }
  const user = await UserModel.findOne({ _id: req.user.userId });
  if (!user) {
    throw createNotFoundError("user not found");
  }
  if (!(await comparePasswords(oldPassword, user.password))) {
    throw createAuthError("Authentication Error");
  }

  user.password = newPassword;
  await user.save();

  res.status(StatusCodes.OK).json({ msg: "Password successfully updated." });
};
