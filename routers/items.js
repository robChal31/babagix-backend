const express = require("express");
const {
  getItemById,
  postItem,
  editItem,
  deleteItem,
  getItem,
  getItemByUserId,
  getSavedItem,
  addSaved,
  removeSaved,
  getOneSaved,
  isLoved,
  removeLoved,
  addLoved,
  getItemProfile,
  searchItem,
} = require("../controllers/itemController");
const { uploadStorage } = require("../helpers/multerHelpers");
const multer = require("multer");

const router = express.Router();
const storage = uploadStorage("uploads");
const upload = multer({ storage });

//getOneSaved
router.get("/getOneSaved", getOneSaved);
router.get("/getSavedItems", getSavedItem);

//search item
router.get("/search", searchItem);

//getIsLoved
router.get("/isLoved", isLoved);

//all item
router.get("/", getItem);

//single document
router.get("/:id", getItemById);

//get item ny user id
router.get("/user/:id", getItemByUserId);

router.get("/profile/:id", getItemProfile);

router.post("/", upload.array("images", 3), postItem);

router.put("/addSaved", addSaved);
router.put("/removeSaved", removeSaved);
router.put("/addLoved", addLoved);
router.put("/removeLoved", removeLoved);

router.put("/:id", upload.array("images", 3), editItem);

router.delete("/:id", deleteItem);

module.exports = router;
