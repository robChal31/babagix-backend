const express = require("express");
const multer = require("multer");
const { uploadStorage } = require("../helpers/multerHelpers");
const {
  registerUser,
  getUser,
  loginUser,
  verifyUser,
  editUser,
  getSingleUser,
} = require("../controllers/userController");

const router = express.Router();

const storage = uploadStorage("avatars");

const upload = multer({ storage });

router.get("/", getUser);

router.get("/:id", getSingleUser);

router.get("/confirm/:verifyToken", verifyUser);

router.post("/register", registerUser);

router.post("/login", loginUser);

router.put("/:id", upload.single("images"), editUser);

module.exports = router;
