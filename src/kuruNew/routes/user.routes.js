const express = require("express");
const router = express.Router();
const {
  userSignup,
  userLogin,
  uploadProfilePic,
  updateEmail,
  resetPassword,
  changePassword,
} = require("../controller/userController.js");
const { isAuthenticated } = require("../middleware/jwt.js");
const upload = require("../utils/multer");


router.post("/signup", userSignup);
router.post("/login", userLogin);
router.post("/resetpassword", resetPassword);
router.put("/profilepic/:userId", upload.single("image"), uploadProfilePic);
router.put("/updateemail/:userId", updateEmail);
router.put("/updateemail/:userId", updateEmail);
router.put("/changepassword", changePassword);

module.exports = router;
