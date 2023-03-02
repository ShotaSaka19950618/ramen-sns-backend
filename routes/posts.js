const router = require("express").Router();
const Post = require("../model/Post");
const User = require("../model/User");

// 投稿の登録
router.post("/", async (req, res) => {
  const newPost = new Post(req.body);
  try {
    const post = await newPost.save();
    return res.status(200).json(post);
  } catch (err) {
    return res.status(500).json(err);
  }
});

// 投稿の取得
router.get("/", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    return res.status(200).json(post);
  } catch (err) {
    return res.status(500).json(err);
  }
});

// 投稿の更新
router.put("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (req.body.userid === post.userid) {
      await post.updateOne({
        $set: req.body,
      });
      return res.status(200).json("投稿が更新されました");
    } else {
      return res.status(403).json("更新できません");
    }
  } catch (err) {
    return res.status(500).json(err);
  }
});

// 投稿の削除
router.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (req.body.userid === post.userid) {
      await post.deleteOne();
      return res.status(200).json("投稿が削除されました");
    } else {
      return res.status(403).json("削除できません");
    }
  } catch (err) {
    return res.status(500).json(err);
  }
});

// いいね関係
router.put("/:id/like", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post.likes.includes(req.body.userid)) {
      await post.updateOne({
        $push: {
          likes: req.body.userid,
        },
      });
      return res.status(200).json("いいねしました");
    } else {
      await post.updateOne({
        $pull: {
          likes: req.body.userid,
        },
      });
      return res.status(200).json("いいね解除しました");
    }
  } catch (err) {
    return res.status(500).json(err);
  }
});

// ブックマーク関係
router.put("/:id/bookmark", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post.bookmarks.includes(req.body.userid)) {
      await post.updateOne({
        $push: {
          bookmarks: req.body.userid,
        },
      });
      return res.status(200).json("ブックマークしました");
    } else {
      await post.updateOne({
        $pull: {
          bookmarks: req.body.userid,
        },
      });
      return res.status(200).json("ブックマーク解除しました");
    }
  } catch (err) {
    return res.status(500).json(err);
  }
});

// プロフィール専用のタイムラインの投稿を取得
router.get("/profile/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    const posts = await Post.find({ userId: user._id });
    return res.status(200).json(posts);
  } catch (err) {
    return res.status(500).json(err);
  }
});

// タイムラインの投稿を取得
router.get("/timeline/:username", async (req, res) => {
  try {
    const currentUser = await User.findOne({ username: req.params.username });
    const currentUserPosts = await Post.find({ userId: currentUser._id });
    const followingsPosts = await Promise.all(
      currentUser.followings.map((followingId) => {
        return Post.find({ userid: followingId });
      })
    );
    const posts = currentUserPosts.concat(...followingsPosts);
    return res.status(200).json(posts);
  } catch (err) {
    return res.status(500).json(err);
  }
});

module.exports = router;
