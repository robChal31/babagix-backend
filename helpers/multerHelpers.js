const multer = require("multer");

function uploadStorage(path) {
  const FILE_TYPE_MAP = {
    "image/png": "png",
    "image/jpeg": "jpeg",
    "image/jpg": "jpg",
    "image/webp": "webp",
    "image/avif": "avif",
  };
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const isValid = FILE_TYPE_MAP[file.mimetype];
      let uploadError = new Error("Invalid image type");
      if (isValid) {
        uploadError = null;
      }
      cb(uploadError, `public/${path}`);
    },
    filename: function (req, file, cb) {
      let fileName = file.originalname.split(".");
      fileName = fileName
        .splice(0, fileName.length - 1)
        .join("")
        .replace(" ", "-");
      const extention = FILE_TYPE_MAP[file.mimetype];
      cb(null, `${fileName}_${Date.now()}_${Math.random()}.${extention}`);
    },
  });

  return storage;
}

module.exports = { uploadStorage };
