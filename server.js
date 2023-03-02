const express = require("express");
const app = express();
const userRouter = require("./routes/users");
const postRouter = require("./routes/posts");
const PORT = 4000;
const mongoose = require("mongoose");
const helmet = require("helmet");
require("dotenv").config();

// 脆弱性対策
app.use(helmet()) 

// データベース接続
mongoose.connect(process.env.MONGOURL)
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

app.get("/", (req, res) => {
  res.send("hello express");
});

app.listen(PORT, () => console.log("サーバーが起動しました"));
