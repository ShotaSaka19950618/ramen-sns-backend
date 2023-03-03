const router = require("express").Router();
const User = require("../model/User");

// サインイン
router.post("/signin", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });

    if (!user) {
      return res.status(404).json("ユーザーが見つかりません");
    }

    if (req.body.password !== user.password) {
      return res.status(400).json("パスワードが違います");
    }

    const { password, updatedAt, ...other } = user._doc;
    return res.status(200).json(other);
  } catch (err) {
    return res.status(500).json(err);
  }
});

module.exports = router;
