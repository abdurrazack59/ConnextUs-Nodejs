const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.post("/signup", userController.signup);

router.post("/login", userController.login);

router.get(
  "/user/getUserDetails/:email",
  userController.allowIfLoggedin,
  userController.getUser
);

router.put("/user/updateUserProfile", userController.updateUserProfile);

// Admin Routes...

router.get(
  "/users/getAllUsers",
  userController.allowIfLoggedin,
  userController.getUsers
);

router.put(
  "/user/updateUser/:id",
  userController.allowIfLoggedin,
  userController.updateUser
);

router.delete(
  "/user/deleteUser/:id",
  userController.allowIfLoggedin,
  userController.deleteUser
);

module.exports = router;
