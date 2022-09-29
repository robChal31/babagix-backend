const mongoose = require("mongoose");
const { Category } = require("../models/category");

const getCategory = async (req, res) => {
  const categories = await Category.find();

  if (!categories) {
    return res.status(500).json({
      message: "something went wrong",
      status: false,
    });
  }

  res.status(200).json(categories);
};

const getCategoryById = (req, res) => {
  const category = Category.findById(req.params.id)
    .then((data) => {
      if (data) {
        res.status(200).json(data);
      } else {
        res.status(404).json({
          status: false,
          message: "Invalid ID",
        });
      }
    })
    .catch((err) => {
      res.status(500).json({
        message: err,
        status: false,
      });
    });
};

const addCategory = (req, res) => {
  const categoryCreated = new Category({
    category_name: req.body.category_name,
    icon: req.body.icon,
    value: req.body.value,
  });

  categoryCreated
    .save()
    .then((data) => {
      res.status(200).json(data);
    })
    .catch((err) => {
      res.status(500).json({
        message: err,
        status: false,
      });
    });
};

const editCategory = (req, res) => {
  const categoryUpdate = Category.findByIdAndUpdate(
    req.params.id,
    {
      category_name: req.body.category_name,
      icon: req.body.icon,
    },
    { new: true }
  )
    .then((data) => {
      res.status(200).json(data);
    })
    .catch((err) => {
      res.status(500).json({
        message: err,
        status: false,
      });
    });
};

const deleteCategory = (req, res) => {
  const deletedCategory = Category.findByIdAndRemove(req.params.id)
    .then((data) => {
      if (data) {
        res.status(200).json({
          status: true,
          message: "deleted successfull",
        });
      } else {
        res.status(404).json({
          status: false,
          message: "data invalid",
        });
      }
    })
    .catch((err) => {
      res.status(500).json({
        message: err,
        status: false,
      });
    });
};

module.exports = {
  getCategory,
  getCategoryById,
  addCategory,
  editCategory,
  deleteCategory,
};
