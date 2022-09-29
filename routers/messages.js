const express = require("express");
const {
  makeRoom,
  getAllRoom,
  getMyMessages,
  addChat,
  getSingleRoom,
  openRoom,
} = require("../controllers/messageController");

const router = express.Router();

router.post("/", makeRoom);
router.get("/getAllRoom", getAllRoom);
router.get("/getARoom/:roomName", getSingleRoom);
router.get("/openRoom/:roomId", openRoom);
router.get("/:userId", getMyMessages);
// router.get("/:userEmail", () => {
//   console.log("router get");
// });
router.post("/:messageRoom", addChat);
router.delete("/:messageId", () => {
  console.log("router post");
});

module.exports = router;
