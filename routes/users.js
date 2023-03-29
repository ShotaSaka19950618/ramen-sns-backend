const router = require("express").Router();
const User = require("../model/User");
const Notification = require("../model/Notification");
const isAuth = require("../middleware/isAuth");

// ユーザー情報の取得
router.get("/:userid", isAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userid);
    const { password, updatedAt, ...other } = user._doc;
    return res.json({
      success: true,
      message: "ユーザー情報を取得しました",
      data: other,
    });
  } catch (err) {
    return res.json(err);
  }
});

// ユーザー情報の更新
router.put("/:userid", isAuth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.userid, {
      $set: req.body,
    });
    return res.json({
      success: true,
      message: "ユーザー情報を更新しました",
    });
  } catch (err) {
    return res.json(err);
  }
});

// ユーザー情報の削除
router.delete("/:userid", isAuth, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.userid);
    return res.json({
      success: true,
      message: "ユーザー情報を削除しました",
    });
  } catch (err) {
    return res.json(err);
  }
});

// フォロー関係
router.put("/:userid/follow", isAuth, async (req, res) => {
  try {
    if (req.body.targetUserid !== req.params.userid) {
      const currentUser = await User.findById(req.params.userid);
      const targetUser = await User.findById(req.body.targetUserid);
      // フォロー関係を判定
      if (!targetUser.followers.includes(req.params.userid)) {
        // フォロー処理
        await targetUser.updateOne({
          $push: {
            followers: req.params.userid,
          },
        });
        await currentUser.updateOne({
          $push: {
            followings: req.body.targetUserid,
          },
        });
        const newNotification = new Notification({
          useridSend: req.params.userid,
          useridReceived: req.body.targetUserid,
          desc: `あなたをフォローしました`,
        });
        await newNotification.save();
        return res.json({
          success: true,
          message: "フォローしました",
        });
      } else {
        // フォロー解除処理
        await targetUser.updateOne({
          $pull: {
            followers: req.params.userid,
          },
        });
        await currentUser.updateOne({
          $pull: {
            followings: req.body.targetUserid,
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
router.get("/:userid/followings", isAuth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.params.userid);
    const followings = await Promise.all(
      currentUser.followings.map(async (followingId) => {
        const user = await User.findById(followingId);
        const { password, updatedAt, ...other } = user._doc;
        return other;
      })
    );
    return res.json({
      success: true,
      message: "全フォローを取得しました",
      data: followings,
    });
  } catch (err) {
    return res.json(err);
  }
});

// 全フォロワー取得
router.get("/:userid/followers", isAuth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.params.userid);
    const followers = await Promise.all(
      currentUser.followers.map(async (followerId) => {
        const user = await User.findById(followerId);
        const { password, updatedAt, ...other } = user._doc;
        return other;
      })
    );
    return res.json({
      success: true,
      message: "全フォロワーを取得しました",
      data: followers,
    });
  } catch (err) {
    return res.json(err);
  }
});

module.exports = router;
