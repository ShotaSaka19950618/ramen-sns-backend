const router = require("express").Router();
const multer = require("multer");
const isAuth = require("../middleware/isAuth");


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images");
  },
  filename: (req, file, cb) => {
    cb(null, req.body.name);
  },
});

const upload = multer({ storage });

// 画像upload
router.post("/", isAuth, upload.single("file"), (req, res) => {
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
