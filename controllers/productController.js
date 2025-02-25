import { StatusCodes } from "http-status-codes";
import ProductModel from "../models/Product.js";
import path from "path";
import {
  createAuthError,
  createBadRequestError,
  createNotFoundError
} from "../errors/custom-error.js";
import { fileValidation } from "../utils.js";

export const createProduct = async (req, res) => {
  const user = req.user.userId;

  const payload = { ...req.body, user };

  const product = await ProductModel.create(payload);
  if (!product) {
    throw createBadRequestError("unable to create product");
  }

  res.status(StatusCodes.CREATED).json({ product });
};

export const getAllProducts = async (req, res) => {
  const products = await ProductModel.find({});
  res.status(StatusCodes.OK).json({ products: products });
};

export const getSingleProduct = async (req, res) => {
  const product = await ProductModel.findOne({ _id: req.params.id }).populate(
    "reviews"
  );
  if (!product) {
    throw createNotFoundError(`Product with id ${req.params.id} not found`);
  }
  res.status(StatusCodes.OK).json({ product });
};

export const updateProduct = async (req, res) => {
  const product = await ProductModel.findOneAndUpdate(
    { _id: req.params.id },
    req.body,
    { new: true, runValidators: true }
  );
  res.status(StatusCodes.OK).json({ product });
};

export const deleteProduct = async (req, res) => {
  const aProduct = await ProductModel.findOne({ _id: req.params.id });
  if (!aProduct) {
    throw createNotFoundError(`Production with id ${req.params.id} not found`);
  }
  await aProduct.deleteOne();
  res
    .status(StatusCodes.OK)
    .json({ msg: `Product with id ${req.params.id} deleted` });
};

export const uploadImage = async (req, res) => {
  fileValidation({ request: req, fileName: "image" });
  const productFile = req.files.image;
  const { name: fileName } = productFile;

  const filePath = path.join(
    import.meta.dirname,
    "../public/uploads",
    fileName
  );
  await productFile.mv(filePath);
  res.status(StatusCodes.OK).json({ msg: `${fileName} uploaded` });
};
