const mongoose = require("mongoose");
const { Message } = require("../models/message");
const { User } = require("../models/user");

const makeRoom = async (req, res) => {
  const roomName = `${req.body.ownerId}-${req.body.requesterId}-${req.body.item}`;
  const roomExist = await Message.findOne({ room_name: roomName });

  if (roomExist) {
    return res.status(200).json(roomExist);
  }
  if (!roomExist) {
    const participant = {
      owner: req.body.ownerId,
      requesterId: req.body.requesterId,
    };
    const createRoom = new Message({
      room_name: roomName,
      user: participant.owner,
      item: req.body.item,
      requesterId: participant.requesterId,
    });
    const saveRoom = await createRoom.save();

    if (saveRoom) {
      createFirstChat(saveRoom.room_name, participant.requesterId);
      makeFirstStep(participant, saveRoom.room_name);
      return res.status(200).json({
        data: saveRoom,
        message: "room telah dibuat",
      });
    }
    if (!saveRoom) {
      return res.status(500).json("failed to make a room");
    }
  }
};

const createFirstChat = async (room, user) => {
  const inisiateChat = await Message.findOneAndUpdate(
    { room_name: room },
    {
      chats: {
        text: "Hi apakah item ini masih tersedia ?",
        user: user,
        created_at: Date.now(),
        isReaded: 0,
      },
    },
    { new: true }
  );
  if (!inisiateChat) {
    throw Error("Failed to add inisiate chat");
  }
};

const getAllRoom = async (req, res) => {
  const allMessage = await Message.find();

  if (!allMessage.length) {
    return res.status(400).json("ga ada room");
  }

  if (allMessage) {
    return res.status(200).json(allMessage);
  }
};

const makeFirstStep = async (data, room) => {
  try {
    const updateOwnerChatList = await User.findByIdAndUpdate(
      data.owner,
      { $push: { messages: room } },
      { new: true }
    );
    const updateRequesterChatList = await User.findByIdAndUpdate(
      data.requesterId,
      { $push: { messages: room } },
      { new: true }
    );
  } catch (error) {
    throw Error(error);
  }
};

const getMyMessages = async (req, res) => {
  const id = req.params.userId;

  let getUserRoom = await User.findById(id).select("messages").lean();
  getUserRoom = getUserRoom.messages;

  const getMyMessages = await Message.find({
    room_name: { $in: getUserRoom },
  })
    .populate("user", "username avatar")
    .populate({
      path: "item",
      model: "Item",
      select: "_id item_pics item_name",
    })
    .populate({
      path: "requesterId",
      model: "User",
      select: "username avatar",
    })
    .sort({ updatedAt: -1 })
    .lean();

  if (getMyMessages) {
    getMyMessages.map((e) => {
      if (e.user._id == id) {
        e.user = e.requesterId;
        delete e.requesterId;
      }
      if (e.user._id !== id) {
        delete e.requesterId;
      }
    });
    return res.status(200).json(getMyMessages);
  }
  if (!getMyMessages || !getMyMessages.length) {
    return res.status(400).json("error while fetching");
  }
};

const addChat = async (req, res) => {
  const addNewChat = Message.findByIdAndUpdate(
    req.params.messageRoom,
    { $push: { chats: req.body } },
    { new: true }
  )
    .then((data) => res.status(200).json(data))
    .catch((err) => es.status(500).json(err));
};

const getSingleRoom = async (req, res) => {
  const message = await Message.findOne({ room_name: req.params.roomName });
  if (message) {
    return res.status(200).json(message);
  }
  if (!message) {
    return res.status(500).json(null);
  }
};

const openRoom = async (req, res) => {
  const message = await Message.findById(req.params.roomId);
  if (message) {
    return res.status(200).json(message);
  }
  if (!message) {
    return res.status(500).json(null);
  }
};

module.exports = {
  makeRoom,
  getAllRoom,
  getMyMessages,
  addChat,
  getSingleRoom,
  openRoom,
};
