const router = require("express").Router();
const Post = require("../model/Post");
const User = require("../model/User");
const isAuth = require("../middleware/isAuth");

// 投稿の登録
router.post("/", isAuth, async (req, res) => {
  try {
    const newPost = new Post(req.body);
    await newPost.save();
    return res.json({
      success: true,
      message: "投稿しました！！",
    });
  } catch (err) {
    return res.json(err);
  }
});

// 投稿の取得
router.get("/", isAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    return res.json({
      success: true,
      message: "投稿を取得しました",
      post: post,
    });
  } catch (err) {
    return res.json(err);
  }
});

// 投稿の更新
router.put("/:id", isAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (req.body.userid === post.userid) {
      await post.updateOne({
        $set: req.body,
      });
      return res.json({
        success: true,
        message: "投稿を更新しました",
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

// 投稿の削除
router.delete("/:id", isAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (req.body.userid === post.userid) {
      await post.deleteOne();
      return res.json({
        success: true,
        message: "投稿を削除しました",
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

// いいね関係
router.put("/:id/like", isAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post.likes.includes(req.body.userid)) {
      await post.updateOne({
        $push: {
          likes: req.body.userid,
        },
      });
      return res.json({
        success: true,
        message: "いいねしました",
      });
    } else {
      await post.updateOne({
        $pull: {
          likes: req.body.userid,
        },
      });
      return res.json({
        success: true,
        message: "いいね解除しました",
      });
    }
  } catch (err) {
    return res.json(err);
  }
});

// ブックマーク関係
router.put("/:id/bookmark", isAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post.bookmarks.includes(req.body.userid)) {
      await post.updateOne({
        $push: {
          bookmarks: req.body.userid,
        },
      });
      return res.json({
        success: true,
        message: "ブックマークしました",
      });
    } else {
      await post.updateOne({
        $pull: {
          bookmarks: req.body.userid,
        },
      });
      return res.json({
        success: true,
        message: "ブックマーク解除しました",
      });
    }
  } catch (err) {
    return res.json(err);
  }
});

// プロフィール専用のタイムラインの投稿を取得
router.get("/profile/:username", isAuth, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    const posts = await Post.find({ userId: user._id });
    return res.json({
      success: true,
      message: "タイムラインを取得しました",
      posts: posts,
    });
  } catch (err) {
    return res.json(err);
  }
});

// タイムラインの投稿を取得
router.get("/timeline/:username", isAuth, async (req, res) => {
  try {
    const currentUser = await User.findOne({ username: req.params.username });
    const currentUserPosts = await Post.find({ userId: currentUser._id });
    const followingsPosts = await Promise.all(
      currentUser.followings.map((followingId) => {
        return Post.find({ userid: followingId });
      })
    );
    const posts = currentUserPosts.concat(...followingsPosts);
    return res.json({
      success: true,
      message: "タイムラインを取得しました",
      posts: posts,
    });
  } catch (err) {
    return res.json(err);
  }
});

module.exports = router;
