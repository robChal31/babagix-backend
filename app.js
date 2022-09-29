const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cron = require("node-cron");

const cors = require("cors");
const bodyParser = require("body-parser");
const morgan = require("morgan");

require("dotenv/config");

const apiUrl = process.env.API_URL;

cron.schedule("1 20 * * * *", async () => {
  const cronItem = await Item.find({
    category: "6300b61d89f3cf8aab105aa9",
    expired_date: { $lt: Date.now() },
  })
    .select("expired_date")
    .lean();
  const items = cronItem.map((e) => e._id);
  const findMsg = await Message.find({ item: { $in: items } })
    .select("room_name")
    .lean();
  const msgs = findMsg.map((e) => e.room_name);
  try {
    const delMsgs = await Message.deleteMany({ room_name: { $in: msgs } });
    const delItem = await Item.deleteMany({ _id: { $in: items } });
    const user = await User.updateMany(
      { messages: { $in: msgs } },
      { $pull: { messages: { $in: msgs } } }
    );
  } catch (error) {
    return res.status(500).json(error);
  }
});

//importing router
const userRouter = require("./routers/users");
const itemRouter = require("./routers/items");
const categoryRouter = require("./routers/categories");
const messageRouter = require("./routers/messages");
const authJwt = require("./helpers/jwt");
const errorHandler = require("./helpers/error-handler");
const { Item } = require("./models/item");
const { User } = require("./models/user");
const { Message } = require("./models/message");

//middleware

//cors is used to allow all http request access from other ip or dns
// app.use(cors());
// app.use("*", cors());

app.use(bodyParser.json({ limit: "100mb", extended: true }));
app.use(morgan("tiny"));
app.use(authJwt());
app.use("/public/upload", express.static(__dirname + "/public/uploads"));
app.use("/public/avatar", express.static(__dirname + "/public/avatars"));
app.use(errorHandler);

//route
app.use(`${apiUrl}/user`, userRouter);
app.use(`${apiUrl}/item`, itemRouter);
app.use(`${apiUrl}/category`, categoryRouter);
app.use(`${apiUrl}/message`, messageRouter);

//connecting to database
mongoose
  .connect(process.env.CONNECTION_STRING)
  .then(() => {
    console.log("connection is ready bang");
  })
  .catch((err) => {
    console.log(err);
  });

// development
// app.listen(4000, () => {
//   console.log("server is running http://localhost:4000");
// });

// production
let server = app.listen(4000, () => {
  let port = server.address().port;
  console.log("whats my port ?", port);
});
