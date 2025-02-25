import express from "express";
import {
  createReview,
  getAllReviews,
  getSingleReview,
  deleteReview,
  updateReview
} from "../controllers/reviewController.js";

import { authenticateUser } from "../middleware/auth.js";

const router = express.Router();

router.route("/").get(getAllReviews).post(authenticateUser, createReview);

router
  .route("/:id")
  .get(getSingleReview)
  .delete(authenticateUser, deleteReview)
  .patch(authenticateUser, updateReview);

export default router;
