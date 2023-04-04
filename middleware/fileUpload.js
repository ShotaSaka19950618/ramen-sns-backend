const multer = require("multer");
const multerS3 = require("multer-s3");
const { S3Client } = require("@aws-sdk/client-s3");
const path = require("path");
require("dotenv").config();

const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_S3_SECRET_KEY,
  },
  region: process.env.AWS_S3_REGION,
});

const s3Storage = multerS3({
  s3: s3,
  bucket: process.env.AWS_S3_BUCKET,
  contentType: multerS3.AUTO_CONTENT_TYPE,
  acl: "public-read",
  metadata: (req, file, cb) => {
    cb(null, { fieldname: file.fieldname });
  },
  key: (req, file, cb) => {
    // const fileName =
    //   Date.now() + "_" + file.fieldname + "_" + file.originalname;
    cb(null, req.body.name);
  },
});

function sanitizeFile(file, cb) {
  const fileExts = [".png", ".jpg", ".jpeg", ".gif"];

  const isAllowedExt = fileExts.includes(
    path.extname(file.originalname.toLowerCase())
  );

  const isAllowedMimeType = file.mimetype.startsWith("image/");

  if (isAllowedExt && isAllowedMimeType) {
    return cb(null, true);
  } else {
    cb("Error: File type not allowed!");
  }
}

const uploadImage = multer({
  storage: s3Storage,
  fileFilter: (req, file, callback) => {
    sanitizeFile(file, callback);
  },
});

module.exports = uploadImage;
