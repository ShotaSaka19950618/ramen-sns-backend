const router = require("express").Router();
const isAuth = require("../middleware/isAuth");
const uploadImage = require("../middleware/fileUpload");

// 画像upload
router.post("/", isAuth, uploadImage.single("file"), (req, res) => {
  try {
    return res.json({
      success: true,
      message: "画像をアップロードしました！",
    });
  } catch (err) {
    return res.json(err);
  }
});

module.exports = router;
