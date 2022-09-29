const express = require("express");
const {
  getCategory,
  getCategoryById,
  addCategory,
  editCategory,
  deleteCategory,
} = require("../controllers/categoryController");

const router = express.Router();

//get category list
router.get("/", getCategory);

//get single category
router.get("/:id", getCategoryById);

router.post("/", addCategory);

router.put("/:id", editCategory);

router.delete("/:id", deleteCategory);

module.exports = router;
