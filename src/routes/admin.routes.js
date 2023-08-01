const express = require("express");
const {
  adminSignup,
  adminLogin,
  findAllUser,
  saveCar,
} = require("../controller/admin.controller");
const { isAuthenticated } = require("../middleware/jwt");
const router = express.Router();
const upload = require("../utils/multer");

router.post("/signup", adminSignup);
router.post("/login", adminLogin);
router.post("/savecars", isAuthenticated, upload.single("image"), saveCar);
router.get("/finduser", isAuthenticated, findAllUser);

module.exports = router;
