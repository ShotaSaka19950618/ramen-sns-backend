const router = require("express").Router();
const User = require("../model/User");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");

// ユーザー情報の登録
router.post("/register", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
    console.log(hashedPassword);
    const newUser = new User({
      username: req.body.username,
      name: req.body.name,
      password: hashedPassword,
    });
    const user = await newUser.save();
    return res.status(200).json(user);
  } catch (err) {
    return res.status(500).json(err);
  }
});

// サインイン（JWT生成）
router.post("/signin", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });

    if (!user) {
      return res.status(404).json("ユーザーが見つかりません");
    }

    const match = await bcrypt.compare(req.body.password, user.password);

    if (!match) {
      return res.status(400).json("パスワードが違います");
    }

    const { password, updatedAt, ...payload } = user._doc;

    const token = jwt.sign(payload, "secret");
    return res.status(200).json({ token });
  } catch (err) {
    return res.status(500).json(err);
  }
});

// サインイン（JWT確認）
router.get("/user", async (req, res) => {
  try {
    const bearToken = await req.headers["authorization"];
    const bearer = await bearToken.split(" ");
    const token = await bearer[1];
    const user = await jwt.verify(token, "secret");
    return res.status(200).json({ user });
  } catch (err) {
    return res.status(500).json(err);
  }
});

module.exports = router;
