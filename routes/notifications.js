const router = require("express").Router();
const Notification = require("../model/Notification");
const User = require("../model/User");
const isAuth = require("../middleware/isAuth");

// 通知を取得
router.get("/:userid", isAuth, async (req, res) => {
  try {
    const notifications = await Notification.find({
      useridReceived: req.params.userid,
    });
    const sortNotifications = notifications.sort((post1, post2) => {
      return new Date(post2.createdAt) - new Date(post1.createdAt);
    });
    const result = await Promise.all(
      sortNotifications.map(async (notification) => {
        const user = await User.findById(notification.useridSend);
        return { notification, user };
      })
    );
    return res.json({
      success: true,
      message: "通知を取得しました",
      data: result,
    });
  } catch (err) {
    return res.json(err);
  }
});

// 通知を確認済みに更新
router.put("/:userid", isAuth, async (req, res) => {
  try {
    const notifications = await Notification.find({
      useridReceived: req.params.userid,
      check: false,
    });
    await Promise.all(
      notifications.map(async (notification) => {
        await Notification.findByIdAndUpdate(notification._id, {
          check: true,
        });
      })
    );
    return res.json({
      success: true,
      message: "通知を確認済みにしました",
    });
  } catch (err) {
    return res.json(err);
  }
});

module.exports = router;
