import { Router } from "express";

import * as userController from "../controllers/userController";

const router = Router();

router.route("/signup").post(userController.createUser);
router.route("/login").post(userController.signIn);
router
  .route("/update/:id")
  .patch(userController.protect, userController.updateUser);
router
  .route("/delete/:id")
  .delete(userController.protect, userController.deleteUser);
router
  .route("/current")
  .get(userController.protect, userController.getCurrentUser);
router.route("/users").get(userController.protect, userController.getAllUsers);
router.route("/block").patch(userController.protect, userController.blockUsers);
router
  .route("/unblock")
  .patch(userController.protect, userController.unblockUsers);
router
  .route("/delete")
  .post(userController.protect, userController.deleteUsers);

export default router;
