import { StatusCodes } from "http-status-codes";
import OrderModel from "../models/Order.js";
import ProductModel from "../models/Product.js";
import {
  createBadRequestError,
  createNotFoundError
} from "../errors/custom-error.js";

import { checkPermissions } from "../utils.js";

const fakeStripeApi = async ({ amount, currency }) => {
  const client_secret = "someRandomValue";
  return { client_secret, amount };
};

export const createOrder = async (req, res) => {
  const { items, tax, shippingFee } = req.body;

  if (!items || items.length < 1 || !tax || !shippingFee) {
    throw createBadRequestError("Items, tax and shipping fee are required");
  }

  let orderItems = [];
  let subTotal = 0;

  for (const item of items) {
    const product = await ProductModel.findOne({ _id: item.product });
    if (!product) {
      throw createNotFoundError(`Product with id ${item.product} not found`);
    }
    const { name, price, image, _id } = product;
    const singleOrderItem = {
      amount: item.amount,
      name,
      price,
      image,
      product: _id
    };
    orderItems = [...orderItems, singleOrderItem];
    subTotal += item.amount * price;
  }

  // calculate total
  const total = tax + shippingFee + subTotal;

  // get client secret
  const paymentIntent = await fakeStripeApi({
    amount: total,
    currency: "usd"
  });

  const order = await OrderModel.create({
    orderItems,
    total,
    subTotal,
    tax,
    shippingFee,
    user: req.user.userId,
    clientSecret: paymentIntent.client_secret
  });

  res.status(StatusCodes.CREATED).json({ order });
};

export const getAllOrders = async (req, res) => {
  const orders = await OrderModel.find({});
  res.status(StatusCodes.OK).json({ orders });
};

export const getSingleOrder = async (req, res) => {
  const order = await OrderModel.findOne({ _id: req.params.id });
  if (!order) {
    throw createNotFoundError(`Order with id ${req.params.id} not found.`);
  }
  checkPermissions(req.user, order.user);
  res.status(StatusCodes.OK).json({ order });
};

export const updateOrder = async (req, res) => {
  let order = await OrderModel.findOne({ _id: req.params.id });
  if (!order) {
    throw createNotFoundError(`Order with id ${req.params.id} not found.`);
  }
  checkPermissions(req.user, order.user);
  const { paymentIntent } = req.body;
  if (!paymentIntent) {
    throw createBadRequestError("paymentIntent required");
  }
  const theIntentId = paymentIntent.id;
  order.clientSecret = theIntentId;
  order.status = "paid";
  await order.save();

  res.status(StatusCodes.OK).json({ order });
};

export const currentUserOrders = async (req, res) => {
  const orders = await OrderModel.find({ user: req.user.userId });
  res.status(StatusCodes.OK).json({ orders });
};
