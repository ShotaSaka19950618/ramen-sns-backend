const router = require("express").Router();
const User = require("../model/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// ユーザー情報の登録
router.post("/register", async (req, res) => {
  try {
    const findUser = await User.findOne({ username: req.body.username });
    if (findUser) {
      return res.json({
        success: false,
        message: "ユーザー名が既に使用されています",
      });
    }  
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
    const newUser = new User({
      username: req.body.username,
      name: req.body.name,
      password: hashedPassword,
    });
    const user = await newUser.save();
    return res.json({
      success: true,
      message: "アカウント作成に成功しました！！",
      data: user,
    });
  } catch (err) {
    return res.json(err);
  }
});

// サインイン（JWT生成）
router.post("/signin", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (!user) {
      return res.json({
        success: false,
        message: "ユーザーが見つかりません",
      });
    }

    const match = await bcrypt.compare(req.body.password, user.password);
    if (!match) {
      return res.json({
        success: false,
        message: "パスワードが違います",
      });
    }

    const { password, updatedAt, ...payload } = user._doc;
    const token = jwt.sign(payload, process.env.JWT_SECRET);
    return res.json({
      success: true,
      message: "サインインに成功しました！！",
      token: token,
    });
  } catch (err) {
    return res.json(err);
  }
});

// サインイン（JWT確認）
router.get("/user", async (req, res) => {
  try {
    const bearToken = req.headers["authorization"];
    const bearer = bearToken.split(" ");
    const token = bearer[1];
    const user = jwt.verify(token, process.env.JWT_SECRET);
    return res.status(200).json({
      success: true,
      message: "トークン認証に成功しました！！",
      data: user,
    });
  } catch (err) {
    return res.json(err);
  }
});

module.exports = router;
