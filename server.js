const express = require("express");
const cors = require("cors");
const app = express();
const userRouter = require("./routes/users");
const postRouter = require("./routes/posts");
const authRouter = require("./routes/auth");
const PORT = 4000;
const mongoose = require("mongoose");
const helmet = require("helmet");
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
app.use(express.json());
app.use("/api/users", userRouter);
app.use("/api/posts", postRouter);
app.use("/api/auth", authRouter);

app.get("/", (req, res) => {
  res.send("hello express");
});

app.listen(PORT, () => console.log("サーバーが起動しました"));
