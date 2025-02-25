import express from "express";
import {
  createProduct,
  deleteProduct,
  updateProduct,
  uploadImage,
  getAllProducts,
  getSingleProduct
} from "../controllers/productController.js";
import { getSingleProductReviews } from "../controllers/reviewController.js";

import { authenticateUser, authorizePermission } from "../middleware/auth.js";

const router = express.Router();

router
  .route("/")
  .get(getAllProducts)
  .post(authenticateUser, authorizePermission("admin"), createProduct);

router
  .route("/uploadImage")
  .post(authenticateUser, authorizePermission("admin"), uploadImage);

router.route("/:id/reviews").get(getSingleProductReviews);

router
  .route("/:id")
  .get(getSingleProduct)
  .delete(authenticateUser, authorizePermission("admin"), deleteProduct)
  .patch(authenticateUser, authorizePermission("admin"), updateProduct);

export default router;
