const express = require("express");
const cors = require("cors");
const app = express();
const userRouter = require("./routes/users");
const postRouter = require("./routes/posts");
const notificationRouter = require("./routes/notifications");
const authRouter = require("./routes/auth");
const uploadRouter = require("./routes/upload");
const PORT = 3000;
const mongoose = require("mongoose");
const helmet = require("helmet");
const path = require("path");
require("dotenv").config();

// CORS対策
app.use(cors());

// 脆弱性対策
app.use(helmet());

// データベース接続
mongoose
  .connect(process.env.MONGOURL)
  .then(() => {
    console.log("DB接続中・・・");
  })
  .catch((err) => {
    console.log(err);
  });

// ミドルウェア
app.use("/images", express.static(path.join(__dirname, "public/images")));
app.use(express.json());
app.use("/api/users", userRouter);
app.use("/api/posts", postRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/auth", authRouter);
app.use("/api/upload", uploadRouter);

app.listen(PORT, () => console.log("サーバーが起動しました"));
