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
router.get("/:postid", isAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postid);
    return res.json({
      success: true,
      message: "投稿を取得しました",
      data: post,
    });
  } catch (err) {
    return res.json(err);
  }
});

// 投稿の更新
router.put("/:postid", isAuth, async (req, res) => {
  try {
    await Post.findByIdAndUpdate(req.params.postid, {
      $set: req.body,
    });
    return res.json({
      success: true,
      message: "投稿を更新しました",
    });
  } catch (err) {
    return res.json(err);
  }
});

// 投稿の削除
router.delete("/:postid", isAuth, async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.postid);
    return res.json({
      success: true,
      message: "投稿を削除しました",
    });
  } catch (err) {
    return res.json(err);
  }
});

// いいね関係
router.put("/:postid/like", isAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postid);
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
router.put("/:postid/bookmark", isAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postid);
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

// プロフィール専用のタイムライン投稿を取得
router.get("/:userid/profile", isAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userid);
    const posts = await Post.find({ userId: user._id });
    const sortPosts = posts.sort((post1, post2) => {
      return new Date(post2.createdAt) - new Date(post1.createdAt);
    });
    const timeline = await Promise.all(
      sortPosts.map(async (post) => {
        const postUser = await User.findById(post.userid);
        return { post, user: postUser };
      })
    );
    return res.json({
      success: true,
      message: "タイムラインを取得しました",
      data: timeline,
    });
  } catch (err) {
    return res.json(err);
  }
});

// フォローしているユーザーのタイムライン投稿を取得
router.get("/:userid/timeline", isAuth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.params.userid);
    const currentUserPosts = await Post.find({ userid: currentUser._id });
    const followingsPosts = await Promise.all(
      currentUser.followings.map((followingId) => {
        return Post.find({ userid: followingId });
      })
    );
    const posts = currentUserPosts.concat(...followingsPosts);
    const sortPosts = posts.sort((post1, post2) => {
      return new Date(post2.createdAt) - new Date(post1.createdAt);
    });
    const timeline = await Promise.all(
      sortPosts.map(async (post) => {
        const postUser = await User.findById(post.userid);
        return { post, user: postUser };
      })
    );
    return res.json({
      success: true,
      message: "タイムラインを取得しました",
      data: timeline,
    });
  } catch (err) {
    return res.json(err);
  }
});

// 全タイムライン投稿を取得
router.get("/:userid/all", isAuth, async (req, res) => {
  try {
    const posts = await Post.find();
    const sortPosts = posts.sort((post1, post2) => {
      return new Date(post2.createdAt) - new Date(post1.createdAt);
    });
    const timeline = await Promise.all(
      sortPosts.map(async (post) => {
        const postUser = await User.findById(post.userid);
        return { post, user: postUser };
      })
    );
    return res.json({
      success: true,
      message: "タイムラインを取得しました",
      data: timeline,
    });
  } catch (err) {
    return res.json(err);
  }
});

module.exports = router;
