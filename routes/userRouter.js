import express from "express";

import {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword
} from "../controllers/userController.js";
import { authenticateUser, authorizePermission } from "../middleware/auth.js";

const router = express.Router();

router
  .route("/")
  .get(authenticateUser, authorizePermission("admin"), getAllUsers);
router.route("/showMe").get(authenticateUser, showCurrentUser);
router.route("/updateUser").patch(authenticateUser, updateUser);
router.route("/updateUserPassword").patch(authenticateUser, updateUserPassword);
router.route("/:id").get(authenticateUser, getSingleUser);

export default router;
