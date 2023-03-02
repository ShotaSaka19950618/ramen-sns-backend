const router = require("express").Router();
const User = require("../model/User");

// ユーザー情報の登録
router.post("/", async (req, res) => {
  try {
    const newUser = new User({
      username: req.body.username,
      name: req.body.name,
      password: req.body.password,
    });
    const user = await newUser.save();
    return res.status(200).json(user);
  } catch (err) {
    return res.status(500).json(err);
  }
});

// ユーザー情報の取得
router.get("/", async (req, res) => {
  const id = req.query.id;
  const username = req.query.username;
  try {
    const user = id
      ? await User.findById(id)
      : await User.findOne({ username: username });
    const { password, updatedAt, ...other } = user._doc;
    return res.status(200).json(other);
  } catch (err) {
    return res.status(500).json(err);
  }
});

// ユーザー情報の更新
router.put("/:id", async (req, res) => {
  if (req.body.id === req.params.id || req.body.isAdmin) {
    try {
      const user = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });
      return res.status(200).json("ユーザー情報が更新されました");
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json("更新できません");
  }
});

// ユーザー情報の削除
router.delete("/:id", async (req, res) => {
  if (req.body.id === req.params.id || req.body.isAdmin) {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      return res.status(200).json("ユーザー情報が削除されました");
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json("削除できません");
  }
});

// フォロー関係
router.put("/:id/follow", async (req, res) => {
  if (req.body.id !== req.params.id) {
    try {
      const currentUser = await User.findById(req.params.id);
      const targetUser = await User.findById(req.body.id);
      // フォロー関係を判定
      if (!targetUser.followers.includes(req.params.id)) {
        // フォロー処理
        await targetUser.updateOne({
          $push: {
            followers: req.params.id,
          },
        });
        await currentUser.updateOne({
          $push: {
            followings: req.body.id,
          },
        });
        return res.status(200).json("フォローしました");
      } else {
        // フォロー解除処理
        await targetUser.updateOne({
          $pull: {
            followers: req.params.id,
          },
        });
        await currentUser.updateOne({
          $pull: {
            followings: req.body.id,
          },
        });
        return res.status(200).json("フォロー解除しました");
      }
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json("フォローできません");
  }
});

// 全フォロー取得
router.get("/:id/followings", async (req, res) => {
  try {
    const currentUser = await User.findById(req.params.id);
    const followings = await Promise.all(
      currentUser.followings.map(async (followingId) => {
        const user = await User.findById(followingId);
        const { password, updatedAt, ...other } = user._doc;
        return other;
      })
    );
    return res.status(200).json(followings);
  } catch (err) {
    return res.status(500).json(err);
  }
});

// 全フォロワー取得
router.get("/:id/followers", async (req, res) => {
  try {
    const currentUser = await User.findById(req.params.id);
    const followers = await Promise.all(
      currentUser.followers.map(async (followerId) => {
        const user = await User.findById(followerId);
        const { password, updatedAt, ...other } = user._doc;
        return other;
      })
    );
    return res.status(200).json(followers);
  } catch (err) {
    return res.status(500).json(err);
  }
});

module.exports = router;
