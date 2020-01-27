const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const adminController = require("../controllers/adminController");

router.post("/signup", userController.signup);

router.post("/login", userController.login);

// -------------------------------------User Routes Start-------------------------------------//

router.get(
  "/user/getUserDetails/:id",
  userController.allowIfLoggedin,
  userController.getUser
);

router.put("/user/updateUserProfile/:id", userController.updateUserProfile);

// -------------------------------------User Routes End-------------------------------------//

// -------------------------------------Admin Routes Start-------------------------------------//

router.get(
  "/users/getAllUsers",
  adminController.allowIfLoggedin,
  adminController.getUsers
);

router.delete(
  "/user/deleteUser/:id",
  adminController.allowIfLoggedin,
  adminController.deleteUser
);

// -------------------------------------Admin Routes End-------------------------------------//

module.exports = router;
