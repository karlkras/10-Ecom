import { StatusCodes } from "http-status-codes";
import ReviewModel from "../models/Review.js";
import ProductModel from "../models/Product.js";
import {
  createBadRequestError,
  createForbiddnError,
  createNotFoundError
} from "../errors/custom-error.js";

import { checkPermissions } from "../utils.js";

export const createReview = async (req, res) => {
  if (!req.body.product) {
    throw createBadRequestError("requires a product id");
  }
  // now validate that the product exists...
  const aProduct = await ProductModel.findOne({ _id: req.body.product });
  if (!aProduct) {
    throw createNotFoundError(`Product with id ${req.body.product} not found.`);
  }
  // now check if this user already added a reivew for the product...
  const checkForReview = await ReviewModel.findOne({
    product: req.body.product,
    user: req.user.userId
  });

  if (checkForReview) {
    throw createForbiddnError(
      "Review already exists on project with this user."
    );
  }

  const review = await ReviewModel.create({
    ...req.body,
    user: req.user.userId
  });

  res.status(StatusCodes.CREATED).json({ review });
};

export const getAllReviews = async (req, res) => {
  const reviews = await ReviewModel.find({});
  res.status(StatusCodes.OK).json({ reviews });
};

export const getSingleReview = async (req, res) => {
  const review = await ReviewModel.findOne({ _id: req.params.id });
  if (!review) {
    throw createNotFoundError(`Review with id ${req.params.id} not found.`);
  }
  res.status(StatusCodes.OK).json({ review });
};

const validateOwnershipAndGetReview = async (req) => {
  const aReview = await ReviewModel.findOne({ _id: req.params.id });

  if (!aReview) {
    throw createNotFoundError(`Review with id ${req.params.id} not found.`);
  }
  checkPermissions(req.user, aReview.user);
  return aReview;
};

export const updateReview = async (req, res) => {
  const review = await validateOwnershipAndGetReview(req);
  const { title, rating, comment } = req.body;
  if (!title && !rating && !comment) {
    throw createBadRequestError("nothing to update");
  }
  review.comment = comment ?? review.comment;
  review.title = title ?? review.title;
  review.rating = rating ? Number(rating) : review.rating;

  await review.save();

  res.status(StatusCodes.OK).json({ review });
};

export const deleteReview = async (req, res) => {
  const aReview = await validateOwnershipAndGetReview(req);

  await aReview.deleteOne();
  res
    .status(StatusCodes.OK)
    .json({ msg: `review with id ${req.params.id} deleted` });
};

export const getSingleProductReviews = async (req, res) => {
  const { id: productId } = req.params;
  const reviews = await ReviewModel.find({ product: productId });
  res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
};
