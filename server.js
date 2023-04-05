const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const helmet = require("helmet");
require("dotenv").config();
const userRouter = require("./routes/users");
const postRouter = require("./routes/posts");
const notificationRouter = require("./routes/notifications");
const authRouter = require("./routes/auth");
const uploadRouter = require("./routes/upload");

const PORT = 8080;
const HOST = "0.0.0.0";

// CORS対策
app.use(cors());

// 脆弱性対策
app.use(helmet());

// データベース接続
mongoose
  .connect(process.env.MONGOURL)
  .then(() => {
    console.log("DB Connect");
  })
  .catch((err) => {
    console.log(err);
  });

// ミドルウェア
app.use(express.json());
app.use("/api/users", userRouter);
app.use("/api/posts", postRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/auth", authRouter);
app.use("/api/upload", uploadRouter);

// 起動確認用
app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(PORT, HOST, () => console.log("start server"));
