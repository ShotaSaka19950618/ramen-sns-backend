const router = require("express").Router();
const User = require("../model/User");
const Post = require("../model/Post");
const Notification = require("../model/Notification");
const isAuth = require("../middleware/isAuth");

// 投稿の登録
router.post("/", isAuth, async (req, res) => {
  try {
    const newPost = new Post(req.body);
    const post = await newPost.save();
    if (req.body.commentsSend) {
      const receivedPost = await Post.findByIdAndUpdate(req.body.commentsSend, {
        $push: {
          commentsReceived: post._id,
        },
      });
      const newNotification = new Notification({
        useridSend: req.body.userid,
        useridReceived: receivedPost.userid,
        postid: post._id,
        postDesc: post.desc,
        desc: `あなたの投稿にコメントしました`,
      });
      await newNotification.save();
    }
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

// 関連する投稿を取得
router.get("/:postid/connection", isAuth, async (req, res) => {
  try {
    const data = {};
    const targetPost = await Post.findById(req.params.postid);
    const targetUser = await User.findById(targetPost.userid);
    data.target = { post: targetPost, user: targetUser };
    if (targetPost.commentsSend[0]) {
      const parentPost = await Post.findById(targetPost.commentsSend[0]);
      const parentUser = await User.findById(parentPost.userid);
      data.parent = { post: parentPost, user: parentUser };
    }
    const child = await Promise.all(
      targetPost.commentsReceived.map(async (id) => {
        const childPost = await Post.findById(id);
        const childUser = await User.findById(childPost.userid);
        return { post: childPost, user: childUser };
      })
    );
    data.child = child;
    return res.json({
      success: true,
      message: "投稿を取得しました",
      data: data,
    });
  } catch (err) {
    return res.json(err);
  }
});

// いいねしている投稿を取得
router.get("/:userid/like", isAuth, async (req, res) => {
  try {
    const posts = await Post.find({ likes: req.params.userid });
    const sortPosts = posts.sort((post1, post2) => {
      return new Date(post2.createdAt) - new Date(post1.createdAt);
    });
    const likes = await Promise.all(
      sortPosts.map(async (post) => {
        const postUser = await User.findById(post.userid);
        return { post, user: postUser };
      })
    );
    return res.json({
      success: true,
      message: "いいねしている投稿を取得しました",
      data: likes,
    });
  } catch (err) {
    return res.json(err);
  }
});

// いいね
router.put("/:postid/like", isAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postid);
    if (!post.likes.includes(req.body.userid)) {
      await post.updateOne({
        $push: {
          likes: req.body.userid,
        },
      });
      if (req.body.userid !== req.body.targetUserid) {
        const newNotification = new Notification({
          useridSend: req.body.userid,
          useridReceived: req.body.targetUserid,
          postid: post._id,
          postDesc: post.desc,
          desc: `あなたを投稿にいいねしました`,
        });
        await newNotification.save();
      }
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

// ブックマークしている投稿を取得
router.get("/:userid/bookmark", isAuth, async (req, res) => {
  try {
    const posts = await Post.find({ bookmarks: req.params.userid });
    const sortPosts = posts.sort((post1, post2) => {
      return new Date(post2.createdAt) - new Date(post1.createdAt);
    });
    const bookmarks = await Promise.all(
      sortPosts.map(async (post) => {
        const postUser = await User.findById(post.userid);
        return { post, user: postUser };
      })
    );
    return res.json({
      success: true,
      message: "ブックマークしている投稿を取得しました",
      data: bookmarks,
    });
  } catch (err) {
    return res.json(err);
  }
});

// ブックマーク
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
    const posts = await Post.find({
      userid: req.params.userid,
      commentsSend: "",
    });
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
    const currentUserPosts = await Post.find({
      userid: currentUser._id,
      commentsSend: "",
    });
    const followingsPosts = await Promise.all(
      currentUser.followings.map((followingId) => {
        return Post.find({ userid: followingId, commentsSend: "" });
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
    const posts = await Post.find({ commentsSend: "" });
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

// 店舗ランキングを取得
router.get("/:userid/ranking", isAuth, async (req, res) => {
  try {
    const shop = await Post.aggregate([{ $match: { commentsSend: "" } }]).group(
      {
        _id: "$shopname",
        count: { $sum: 1 },
      }
    );
    const ranking = shop.sort((shop1, shop2) => {
      return new Date(shop2.count) - new Date(shop1.count);
    });
    return res.json({
      success: true,
      message: "店舗ランキングを取得しました",
      data: ranking,
    });
  } catch (err) {
    return res.json(err);
  }
});

module.exports = router;
