const mongoose = require("mongoose");
const { Category } = require("../models/category");
const { Item } = require("../models/item");
const fs = require("fs");
const path = require("path");
const { User } = require("../models/user");
const { Message } = require("../models/message");

const getItem = async (req, res) => {
  let filter = {};
  let isFree =
    req.query.isFree && parseInt(req.query.isFree) < 3
      ? parseInt(req.query.isFree)
      : 0;
  if (isFree && !req.query.category) {
    if (isFree < 3) {
      filter = { is_free: isFree };
    }
  }
  if (!isFree && req.query.category) {
    filter = { category: req.query.category.split(",") };
  }
  if (isFree && req.query.category) {
    filter = { is_free: isFree, category: req.query.category.split(",") };
  }

  const itemList = await Item.find({
    ...filter,
    // user: { $ne: req.query.userId },
    // location: {
    //   $near: {
    //     $maxDistance: 1000,
    //     $geometry: {
    //       type: "Point",
    //       coordinates: [req.query.long, req.query.latt],
    //     },
    //   },
    // },
  })
    .populate("category")
    .populate({ path: "user", select: ["_id", "username", "avatar"] })
    .sort({ updatedAt: -1 });
  if (!itemList) {
    return res.status(500).json({
      message: "something went wrong",
      status: false,
    });
  }

  if (itemList) {
    return res.status(200).json(itemList);
  }
};

const getItemById = async (req, res) => {
  const itemList = await Item.findById(req.params.id)
    .populate("category")
    .populate({ path: "user", select: "username avatar" });

  if (!itemList) {
    return res.status(500).json({
      message: "something went wrong",
      status: false,
    });
  }

  res.status(200).json(itemList);
};

const getItemProfile = async (req, res) => {
  const itemList = await Item.find({ user: req.params.id }).populate({
    path: "user",
    select: ["_id", "username", "avatar"],
  });

  if (!itemList) {
    return res.status(500).json({
      message: "something went wrong",
      status: false,
    });
  }

  if (itemList) {
    res.status(200).json(itemList);
  }
};

const getItemByUserId = async (req, res) => {
  const itemList = await Item.find({ user: req.params.id }).populate("user");
  if (!itemList.length) {
    return res.status(400).json("data tidak ada");
  }
  res.status(200).json(itemList);
};

const postItem = async (req, res) => {
  const category = await Category.findById(req.body.category_id);
  if (!category)
    return res.status(500).json({
      message: "Invalid Category",
      status: false,
    });

  let imagesPaths = [];

  if (!req.files) {
    return res.status(400).json("Image must be uploaded");
  }

  const expiredAt = parseInt(req.body.expiredAt) || 0;
  if (req.files) {
    req.files.map((image) => {
      return imagesPaths.push(
        `https://babagix-server.herokuapp.com/public/upload/${image.filename}`
      );
    });
  }
  let itemCreated = new Item({
    item_name: req.body.itemName,
    user: req.body.user_id,
    category: req.body.category_id,
    location: {
      type: "Point",
      coordinates: [
        parseFloat(req.body.longitude),
        parseFloat(req.body.latitude),
      ],
    },
    item_pics: imagesPaths,
    desc: req.body.desc,
    is_free: req.body.is_free,
    expired_date: expiredAt,
  });
  console.log(itemCreated);

  itemCreated
    .save()
    .then((data) => {
      return res.status(200).json(data);
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).json(err);
    });
};

const editItem = async (req, res) => {
  //id check
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(500).json({
      message: "Invalid item id",
      status: false,
    });
  }

  //category check
  const category = await Category.findById(req.body.category_id);
  if (!category)
    return res.status(500).json({
      message: "Invalid Category",
      status: false,
    });

  let imagesPaths = [];

  if (!req.files) {
    return res.status(400).json("Image must be uploaded");
  }

  if (req.files) {
    req.files.map((image) => {
      return imagesPaths.push(
        `${req.protocol}://10.0.2.2:4000/public/upload/${image.filename}`
      );
    });
  }

  const updateItem = await Item.findByIdAndUpdate(
    req.params.id,
    {
      item_name: req.body.itemName,
      user: req.body.user_id,
      category: req.body.category_id,
      location: {
        type: "Point",
        coordinates: [
          parseFloat(req.body.longitude),
          parseFloat(req.body.latitude),
        ],
      },
      item_pics: imagesPaths,
      desc: req.body.desc,
      is_free: req.body.is_free,
      expired_date: req.body.expired_date,
    },
    { new: true }
  );

  if (updateItem) {
    return res.status(200).json(updateItem);
  }
  if (!updateItem) {
    return res.status(500).json("gagal update");
  }
};

const deleteItem = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id))
    res.status(500).send("Invalid id");
  const item = await Item.findById(req.params.id);
  if (item) {
    const itemId = item._id;
    if (item.user.toString() === req.body.userId) {
      const findMsg = await Message.find({ item: itemId })
        .select("room_name")
        .lean();
      try {
        const delMsgs = await Message.deleteMany({ item: itemId });
        const delItem = await Item.findByIdAndDelete(itemId);
      } catch (error) {
        return res.status(500).json(error);
      }
      let msgs = findMsg.map((e) => e.room_name);
      const user = await User.updateMany(
        { messages: { $in: msgs } },
        { $pull: { messages: { $in: msgs } } }
      );
      return res.status(200).json("item deleted");
    }
  }

  return res.status(500).json("Failed to delete");
};

const getSavedItem = async (req, res) => {
  const { userId } = req.query;
  const checkIsSaved = await User.findById(userId).select("itemSaved").lean();
  const savedItem = await Item.find({
    _id: { $in: checkIsSaved.itemSaved },
  }).populate("user");
  if (savedItem) {
    return res.status(200).json(savedItem);
  }
  if (!savedItem) {
    return res.status(200).json([]);
  }
};

const getOneSaved = async (req, res) => {
  const { userId, itemId } = req.query;
  let checkIsSaved = await User.findById(userId).select("itemSaved").lean();
  checkIsSaved = checkIsSaved.itemSaved.filter((e) => e == itemId);

  // const test = checkIsSaved.$where('itemSaved' : itemId)
  if (checkIsSaved) {
    return res.status(200).json(checkIsSaved);
  }
  if (!checkIsSaved) {
    return res.status(200).json([]);
  }
};

const addSaved = async (req, res) => {
  const { itemId, userId } = req.body;
  let user = await User.findByIdAndUpdate(
    userId,
    { $push: { itemSaved: itemId } },
    { new: true }
  ).select("itemSaved");
  user = user.itemSaved.filter((e) => e == itemId);
  if (user) {
    return res.status(200).json(user);
  }
  if (!user) {
    return res.status(500).json("failed to add");
  }
};

const removeSaved = async (req, res) => {
  const { savedId, userId } = req.body;
  let pullSaved = await User.findByIdAndUpdate(
    userId,
    { $pull: { itemSaved: savedId } },
    { new: true }
  ).select("itemSaved");
  pullSaved = pullSaved.itemSaved.filter((e) => e == savedId);
  if (pullSaved) {
    return res.status(200).json(pullSaved);
  }
};

const isLoved = async (req, res) => {
  const { userId, itemId } = req.query;
  let checkIsLoved = await Item.findById(itemId).select("loved");
  const isLoved = checkIsLoved.loved.filter((e) => e == userId);
  if (checkIsLoved) {
    return res
      .status(200)
      .json({ countLoved: checkIsLoved.loved.length, isLoved });
  }

  if (!checkIsLoved) {
    return res.status(200).json([]);
  }
};

const removeLoved = async (req, res) => {
  const { itemId, userId } = req.body;
  const pullLoved = await Item.findByIdAndUpdate(
    itemId,
    { $pull: { loved: userId } },
    { new: true }
  ).select("loved");

  const rmLoved = pullLoved.loved.filter((e) => e == userId);
  if (pullLoved) {
    return res
      .status(200)
      .json({ countLoved: pullLoved.loved.length, rmLoved });
  }
};

const addLoved = async (req, res) => {
  const { itemId, userId } = req.body;
  const pushLoved = await Item.findByIdAndUpdate(
    itemId,
    { $push: { loved: userId } },
    { new: true }
  ).select("loved");
  const addToLoved = pushLoved.loved.filter((e) => e == userId);
  if (pushLoved) {
    return res
      .status(200)
      .json({ countLoved: pushLoved.loved.length, addToLoved });
  }
};

const searchItem = async (req, res) => {
  const findItem = await Item.find({
    item_name: new RegExp(req.query.itemName, "i"),
  }).populate({ path: "user", select: "username avatar" });
  return res.status(200).json(findItem);
};

module.exports = {
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
};
