import express from "express";
import {
  createOrder,
  updateOrder,
  getAllOrders,
  getSingleOrder,
  currentUserOrders
} from "../controllers/orderController.js";

import { authenticateUser, authorizePermission } from "../middleware/auth.js";

const router = express.Router();

router.route("/user").get(authenticateUser, currentUserOrders);

router
  .route("/")
  .get(authenticateUser, authorizePermission("admin"), getAllOrders)
  .post(authenticateUser, createOrder);

router
  .route("/:id")
  .get(authenticateUser, getSingleOrder)
  .patch(authenticateUser, updateOrder);

export default router;
