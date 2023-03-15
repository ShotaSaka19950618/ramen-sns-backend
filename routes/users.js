const router = require("express").Router();
const User = require("../model/User");
const isAuth = require("../middleware/isAuth");

// ユーザー情報の取得
router.get("/", isAuth, async (req, res) => {
  try {
    const id = req.query.id;
    const username = req.query.username;
    const user = id
      ? await User.findById(id)
      : await User.findOne({ username: username });
    const { password, updatedAt, ...other } = user._doc;
    return res.json({
      success: true,
      message: "ユーザー情報を取得しました",
      user: other,
    });
  } catch (err) {
    return res.json(err);
  }
});

// ユーザー情報の更新
router.put("/:id", isAuth, async (req, res) => {
  try {
    if (req.body.id === req.params.id || req.body.isAdmin) {
      await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });
      return res.json({
        success: true,
        message: "ユーザー情報を更新しました",
      });
    } else {
      return res.json({
        success: false,
        message: "更新できません",
      });
    }
  } catch (err) {
    return res.json(err);
  }
});

// ユーザー情報の削除
router.delete("/:id", isAuth, async (req, res) => {
  try {
    if (req.body.id === req.params.id || req.body.isAdmin) {
      await User.findByIdAndDelete(req.params.id);
      return res.json({
        success: true,
        message: "ユーザー情報を削除しました",
      });
    } else {
      return res.json({
        success: false,
        message: "削除できません",
      });
    }
  } catch (err) {
    return res.json(err);
  }
});

// フォロー関係
router.put("/:id/follow", isAuth, async (req, res) => {
  try {
    if (req.body.id !== req.params.id) {
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
        return res.json({
          success: true,
          message: "フォローしました",
        });
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
        return res.json({
          success: true,
          message: "フォロー解除しました",
        });
      }
    } else {
      return res.json({
        success: false,
        message: "フォローできません",
      });
    }
  } catch (err) {
    return res.json(err);
  }
});

// 全フォロー取得
router.get("/:id/followings", isAuth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.params.id);
    const followings = await Promise.all(
      currentUser.followings.map(async (followingId) => {
        const user = await User.findById(followingId);
        const { password, updatedAt, ...other } = user._doc;
        return other;
      })
    );
    return res.json({
      success: true,
      followings: followings,
    });
  } catch (err) {
    return res.json(err);
  }
});

// 全フォロワー取得
router.get("/:id/followers", isAuth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.params.id);
    const followers = await Promise.all(
      currentUser.followers.map(async (followerId) => {
        const user = await User.findById(followerId);
        const { password, updatedAt, ...other } = user._doc;
        return other;
      })
    );
    return res.json({
      success: true,
      followers: followers,
    });
  } catch (err) {
    return res.json(err);
  }
});

module.exports = router;
